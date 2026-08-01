import { Download, ExternalLink, FileText, Image, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance.js";
import { formatDate, formatFileSize } from "../utils.js";

const buildAttachmentUrl = ({ ticketId, attachmentIndex, action }) => {
  if (!ticketId && ticketId !== 0) return "";
  if (!Number.isInteger(attachmentIndex)) return "";
  return `/tickets/${ticketId}/attachments/${attachmentIndex}/${action}`;
};

const buildCommentAttachmentUrl = ({ ticketId, commentId, attachmentIndex, action }) => {
  if ((!ticketId && ticketId !== 0) || !commentId) return "";
  if (!Number.isInteger(attachmentIndex)) return "";
  return `/tickets/${ticketId}/comments/${commentId}/attachments/${attachmentIndex}/${action}`;
};

const getErrorMessage = async (error) => {
  if (error?.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const payload = JSON.parse(text);
      return payload?.message || "Attachment could not be loaded";
    } catch {
      return "Attachment could not be loaded";
    }
  }

  return error?.response?.data?.message || "Attachment could not be loaded";
};

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const AttachmentPreview = ({ attachment, attachmentIndex, commentId, file, onRemove, ticketId, variant = "card" }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const name = file?.name || attachment?.originalName || "Attachment";
  const size = file?.size || attachment?.size || 0;
  const type = file?.type || attachment?.mimeType || "";
  const localPreviewUrl = file ? URL.createObjectURL(file) : "";
  const proxyUrl = commentId
    ? buildCommentAttachmentUrl({ ticketId, commentId, attachmentIndex, action: "open" })
    : buildAttachmentUrl({ ticketId, attachmentIndex, action: "open" });
  const downloadProxyUrl = commentId
    ? buildCommentAttachmentUrl({ ticketId, commentId, attachmentIndex, action: "download" })
    : buildAttachmentUrl({ ticketId, attachmentIndex, action: "download" });
  const canUseProxy = attachment?.url && proxyUrl;
  const openUrl = canUseProxy ? proxyUrl : localPreviewUrl;
  const downloadUrl = canUseProxy ? downloadProxyUrl : localPreviewUrl;
  const isImage = type.startsWith("image/");

  const fetchAttachmentBlob = useCallback(async (url) => {
    const response = await axiosInstance.get(url, { responseType: "blob" });
    const responseType = response.headers["content-type"];
    const blobType = type || (responseType && responseType !== "application/octet-stream" ? responseType : "") || "application/octet-stream";

    return new Blob([response.data], { type: blobType });
  }, [type]);

  useEffect(() => {
    if (variant !== "chat" || !isImage || !openUrl || !canUseProxy) {
      return undefined;
    }

    let isMounted = true;
    let objectUrl = "";

    const loadPreview = async () => {
      try {
        const blob = await fetchAttachmentBlob(openUrl);
        objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setPreviewUrl(objectUrl);
        }
      } catch {
        if (isMounted) {
          setPreviewUrl("");
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [canUseProxy, fetchAttachmentBlob, isImage, openUrl, variant]);

  const handleOpen = async () => {
    if (!openUrl) return;

    if (!canUseProxy) {
      window.open(openUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      toast.error("Please allow popups to open this file");
      return;
    }

    previewWindow.document.write("<!doctype html><title>Opening attachment...</title><body style=\"font-family: system-ui; padding: 24px; color: #0f172a;\">Opening attachment...</body>");

    setIsOpening(true);
    try {
      const blob = await fetchAttachmentBlob(openUrl);
      const blobUrl = URL.createObjectURL(blob);
      const safeName = escapeHtml(name);

      if (blob.type.startsWith("image/")) {
        previewWindow.document.open();
        previewWindow.document.write(`<!doctype html><html><head><title>${safeName}</title><style>body{margin:0;background:#0f172a;display:grid;min-height:100vh;place-items:center}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${blobUrl}" alt="${safeName}"></body></html>`);
        previewWindow.document.close();
      } else if (blob.type === "application/pdf") {
        previewWindow.document.open();
        previewWindow.document.write(`<!doctype html><html><head><title>${safeName}</title><style>html,body,iframe{height:100%;margin:0;width:100%;border:0}</style></head><body><iframe src="${blobUrl}" title="${safeName}"></iframe></body></html>`);
        previewWindow.document.close();
      } else {
        previewWindow.location.href = blobUrl;
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      previewWindow.close();
      toast.error(await getErrorMessage(error));
    } finally {
      setIsOpening(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;

    if (!canUseProxy) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      link.click();
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await fetchAttachmentBlob(downloadUrl);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      toast.error(await getErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  };

  if (variant === "chip") {
    return (
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
        {isImage ? <Image className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0" />}
        <span className="max-w-[180px] truncate font-medium text-slate-700">{name}</span>
        <span className="shrink-0 text-slate-400">{formatFileSize(size)}</span>
        {onRemove ? (
          <button
            type="button"
            aria-label={`Remove ${name}`}
            onClick={onRemove}
            className="focus-ring -mr-1 rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    );
  }

  if (variant === "chat" && isImage && openUrl) {
    const imagePreviewUrl = canUseProxy ? previewUrl : openUrl;

    return (
      <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
        {imagePreviewUrl ? (
          <button type="button" onClick={handleOpen} className="block w-full" aria-label={`Open ${name}`}>
            <img
              src={imagePreviewUrl}
              alt={name}
              className="max-h-64 w-full rounded-lg object-cover"
              loading="lazy"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            className="flex min-h-28 w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-6 text-sm font-semibold text-slate-500"
          >
            <Image className="h-5 w-5" />
            Open image
          </button>
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="focus-ring absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-sm backdrop-blur hover:bg-slate-950 disabled:opacity-70"
          aria-label={`Download ${name}`}
        >
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 pb-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="truncate text-xs font-semibold text-white">{name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {isImage ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        {openUrl ? (
          <button type="button" onClick={handleOpen} className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-700">
            {name}
          </button>
        ) : (
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        )}
        <p className="text-xs text-slate-500">
          {formatFileSize(size)} {attachment?.uploadedAt ? `- ${formatDate(attachment.uploadedAt)}` : ""}
        </p>
        {attachment?.url && openUrl && downloadUrl ? (
          <div className="mt-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            <button
              type="button"
              onClick={handleOpen}
              disabled={isOpening}
              className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-70"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {isOpening ? "Opening..." : "Open"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-70"
            >
              <Download className="h-3.5 w-3.5" />
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          </div>
        ) : null}
      </div>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className="focus-ring rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};

export default AttachmentPreview;
