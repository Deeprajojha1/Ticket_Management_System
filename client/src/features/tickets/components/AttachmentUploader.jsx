import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
} from "../constants.js";
import AttachmentPreview from "./AttachmentPreview.jsx";

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

const AttachmentUploader = ({ files = [], onChange, progress = 0 }) => {
  const addFiles = (fileList) => {
    const acceptedFiles = validateFiles(Array.from(fileList || []), files);
    onChange([...files, ...acceptedFiles]);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="attachments"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        className="focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-blue-300 hover:bg-blue-50/50"
      >
        <UploadCloud className="h-8 w-8 text-blue-600" />
        <span className="mt-3 text-sm font-semibold text-slate-900">Drop files here or click to upload</span>
        <span className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, PDF. Up to 5 files, 5 MB each.</span>
        <input
          id="attachments"
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf"
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
      </label>

      {progress > 0 ? (
        <progress
          className="h-2 w-full overflow-hidden rounded-full accent-blue-600"
          value={progress}
          max="100"
          aria-label="Upload progress"
        />
      ) : null}

      {files.length ? (
        <div className="grid gap-2">
          {files.map((file) => (
            <AttachmentPreview
              key={`${file.name}-${file.lastModified}`}
              file={file}
              onRemove={() => onChange(files.filter((item) => item !== file))}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AttachmentUploader;
