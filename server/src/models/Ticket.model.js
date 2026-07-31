import mongoose from "mongoose";
import Counter from "./Counter.model.js";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../utils/constants.js";

const priorityWeights = {
  [TICKET_PRIORITIES.LOW]: 1,
  [TICKET_PRIORITIES.MEDIUM]: 2,
  [TICKET_PRIORITIES.HIGH]: 3,
  [TICKET_PRIORITIES.URGENT]: 4,
};

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "raw", "video", "auto"],
      default: "image",
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      default: null,
    },
    to: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      enum: Object.values(TICKET_CATEGORIES),
      required: [true, "Category is required"],
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TICKET_PRIORITIES),
      required: [true, "Priority is required"],
      index: true,
    },
    priorityWeight: {
      type: Number,
      default: 2,
      select: false,
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUSES),
      default: TICKET_STATUSES.OPEN,
      index: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    activityLog: {
      type: [activitySchema],
      default: [],
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

ticketSchema.index({ title: "text", description: "text", ticketNumber: "text" });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ updatedAt: -1 });

ticketSchema.pre("validate", async function generateTicketNumber(next) {
  if (!this.isNew || this.ticketNumber) {
    return next();
  }

  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { key: `ticket-${year}` },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  this.ticketNumber = `SD-${year}-${String(counter.sequence).padStart(6, "0")}`;
  return next();
});

ticketSchema.pre("save", function updateDerivedFields(next) {
  if (this.isModified("priority")) {
    this.priorityWeight = priorityWeights[this.priority] || priorityWeights[TICKET_PRIORITIES.MEDIUM];
  }

  if (!this.lastActivity || this.isModified("title") || this.isModified("description") || this.isModified("priority") || this.isModified("status")) {
    this.lastActivity = new Date();
  }

  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
