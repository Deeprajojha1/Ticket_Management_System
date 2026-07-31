import { Send } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Button from "../../../components/common/Button/Button.jsx";
import AttachmentUploader from "./AttachmentUploader.jsx";

const CommentInput = ({ isLoading, onSubmit, onTyping, onStopTyping, uploadProgress = 0 }) => {
  const { control, handleSubmit, register, reset } = useForm({
    defaultValues: { message: "", attachments: [] },
  });
  const message = useWatch({ control, name: "message" });
  const messageField = register("message", { required: true, minLength: 1, maxLength: 2000 });

  const submit = async (values) => {
    await onSubmit(values);
    reset();
  };

  return (
    <form className="space-y-4 border-t border-slate-200 pt-4" onSubmit={handleSubmit(submit)}>
      <div>
        <textarea
          rows={4}
          maxLength={2000}
          className="focus-ring w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none"
          placeholder="Write a comment..."
          onKeyDown={onTyping}
          {...messageField}
          onBlur={(event) => {
            messageField.onBlur(event);
            onStopTyping?.();
          }}
        />
        <p className="mt-1 text-right text-xs text-slate-500">{message?.length || 0}/2000</p>
      </div>
      <Controller
        name="attachments"
        control={control}
        render={({ field }) => <AttachmentUploader files={field.value} onChange={field.onChange} progress={uploadProgress} />}
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </form>
  );
};

export default CommentInput;
