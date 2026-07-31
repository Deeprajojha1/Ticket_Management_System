import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "../../../lib/router.jsx";
import { z } from "zod";
import Button from "../../../components/common/Button/Button.jsx";
import Card from "../../../components/common/Card/Card.jsx";
import Input from "../../../components/common/Input/Input.jsx";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../constants.js";
import AttachmentUploader from "./AttachmentUploader.jsx";

const schema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3000, "Description cannot exceed 3000 characters"),
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES),
  attachments: z.array(z.instanceof(File)).max(5).optional(),
});

const CreateTicketForm = ({ isLoading, onSubmit, uploadProgress = 0 }) => {
  const [descriptionCount, setDescriptionCount] = useState(0);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Technical",
      priority: "Medium",
      attachments: [],
    },
  });

  return (
    <Card className="p-5 sm:p-6">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Input id="title" label="Title" error={errors.title?.message} {...register("title")} />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
              <select id="category" className="focus-ring min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm" {...register("category")}>
                {TICKET_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="priority" className="text-sm font-medium text-slate-700">Priority</label>
              <select id="priority" className="focus-ring min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm" {...register("priority")}>
                {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="description"
            rows={8}
            className={`focus-ring w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none ${errors.description ? "border-red-500" : ""}`}
            {...register("description", {
              onChange: (event) => setDescriptionCount(event.target.value.length),
            })}
          />
          <div className="flex justify-between gap-3">
            {errors.description?.message ? <p className="text-sm text-red-600">{errors.description.message}</p> : <span />}
            <p className="text-xs text-slate-500">{descriptionCount}/3000</p>
          </div>
        </div>

        <Controller
          name="attachments"
          control={control}
          render={({ field }) => (
            <AttachmentUploader files={field.value} onChange={field.onChange} progress={uploadProgress} />
          )}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto">
            <Link to="/customer/tickets">Cancel</Link>
          </Button>
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            Create Ticket
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateTicketForm;
