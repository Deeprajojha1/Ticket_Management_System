import { Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
} from "../constants.js";
import AttachmentUploader from "./AttachmentUploader.jsx";

const CommentInput = ({ disabled = false, isLoading, onSubmit, onTyping, onStopTyping, uploadProgress = 0 }) => {
  const { control, getValues, handleSubmit, register, reset, setValue } = useForm({
    defaultValues: { message: "", attachments: [] },
  });
  const message = useWatch({ control, name: "message" });
  const messageField = register("message", { required: true, minLength: 1, maxLength: 2000 });

  const submit = async (values) => {
    if (disabled) return;
    await onSubmit(values);
    reset();
  };

  const handlePaste = (event) => {
    if (disabled) return;

    const items = Array.from(event.clipboardData?.items || []);
    const pastedFiles = items
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter(Boolean);

    if (!pastedFiles.length) return;

    const currentFiles = getValues("attachments") || [];
    const nextFiles = [];

    pastedFiles.forEach((file, index) => {
      if (currentFiles.length + nextFiles.length >= MAX_ATTACHMENTS) {
        toast.error(`Maximum ${MAX_ATTACHMENTS} files are allowed`);
        return;
      }

      if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type)) {
        toast.error("Only PNG, JPG, JPEG, and PDF attachments are supported");
        return;
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        toast.error(`${file.name || "Pasted image"} must be 5 MB or less`);
        return;
      }

      const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
      const pastedFile = new File([file], file.name || `pasted-image-${Date.now()}-${index}.${extension}`, {
        type: file.type,
        lastModified: Date.now(),
      });

      nextFiles.push(pastedFile);
    });

    if (!nextFiles.length) return;

    event.preventDefault();
    setValue("attachments", [...currentFiles, ...nextFiles], { shouldDirty: true, shouldValidate: true });
    toast.success(`${nextFiles.length} pasted file${nextFiles.length === 1 ? "" : "s"} attached`);
  };

  return (
    <form className="border-t border-slate-200 pt-3" onSubmit={handleSubmit(submit)}>
      <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
        <textarea
          rows={2}
          maxLength={2000}
          disabled={disabled}
          className="focus-ring max-h-24 min-h-14 w-full resize-none rounded-md border-0 bg-transparent px-2.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500"
          placeholder={disabled ? "Conversation locked" : "Write a reply..."}
          onKeyDown={disabled ? undefined : onTyping}
          onPaste={handlePaste}
          {...messageField}
          onBlur={(event) => {
            messageField.onBlur(event);
            onStopTyping?.();
          }}
        />
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-1.5 sm:flex-row sm:items-end sm:justify-between">
          <Controller
            name="attachments"
            control={control}
            render={({ field }) => (
              <AttachmentUploader
                files={field.value}
                onChange={field.onChange}
                disabled={disabled}
                progress={isLoading ? uploadProgress : 0}
                variant="compact"
              />
            )}
          />
          <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
            <span className="text-xs text-slate-500">{message?.length || 0}/2000</span>
            <button
              type="submit"
              disabled={disabled || isLoading}
              className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
