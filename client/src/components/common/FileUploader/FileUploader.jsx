import { useId, useRef } from "react";
import { Paperclip, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
} from "../../../features/tickets/constants.js";
import AttachmentPreview from "../../../features/tickets/components/AttachmentPreview.jsx";

const validateFiles = (incomingFiles, existingFiles) => {
  const nextFiles = [];

  for (const file of incomingFiles) {
    if (existingFiles.length + nextFiles.length >= MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} files are allowed`);
      break;
    }

    if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type)) {
      toast.error(`${file.name} is not a supported file type`);
      continue;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error(`${file.name} must be 5 MB or less`);
      continue;
    }

    nextFiles.push(file);
  }

  return nextFiles;
};

const FileUploader = ({ disabled = false, files = [], id, onChange, progress = 0, variant = "dropzone" }) => {
  const generatedId = useId();
  const inputId = id || `attachments-${generatedId}`;
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    if (disabled) return;

    const acceptedFiles = validateFiles(Array.from(fileList || []), files);
    onChange([...files, ...acceptedFiles]);
  };

  if (variant === "compact") {
    const showProgress = files.length > 0 && progress > 0 && progress < 100;

    return (
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={`focus-ring inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm ${
              disabled ? "cursor-not-allowed opacity-60" : "hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <Paperclip className="h-4 w-4" />
            Attach
          </button>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.pdf"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {files.length ? (
            files.map((file) => (
              <AttachmentPreview
                key={`${file.name}-${file.lastModified}`}
                file={file}
                variant="chip"
                onRemove={disabled ? undefined : () => onChange(files.filter((item) => item !== file))}
              />
            ))
          ) : null}
        </div>

        {showProgress ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Upload progress" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div className="h-full rounded-full bg-blue-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        className={`focus-ring flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center ${
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-blue-300 hover:bg-blue-50/50"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-blue-600" />
        <span className="mt-3 text-sm font-semibold text-slate-900">Drop files here or click to upload</span>
        <span className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, PDF. Up to 5 files, 5 MB each.</span>
      </button>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.pdf"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {files.length > 0 && progress > 0 && progress < 100 ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Upload progress" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <div className="h-full rounded-full bg-blue-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {files.length ? (
        <div className="grid gap-2">
          {files.map((file) => (
            <AttachmentPreview
              key={`${file.name}-${file.lastModified}`}
              file={file}
              onRemove={disabled ? undefined : () => onChange(files.filter((item) => item !== file))}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default FileUploader;
