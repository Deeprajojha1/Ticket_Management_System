import { FileText, Image, X } from "lucide-react";
import { formatDate, formatFileSize } from "../utils.js";

const AttachmentPreview = ({ attachment, file, onRemove }) => {
  const name = file?.name || attachment?.originalName || "Attachment";
  const size = file?.size || attachment?.size || 0;
  const type = file?.type || attachment?.mimeType || "";
  const url = attachment?.url || (file ? URL.createObjectURL(file) : "");
  const isImage = type.startsWith("image/");

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {isImage ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={url || undefined}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-700"
        >
          {name}
        </a>
        <p className="text-xs text-slate-500">
          {formatFileSize(size)} {attachment?.uploadedAt ? `- ${formatDate(attachment.uploadedAt)}` : ""}
        </p>
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
