import multer from "multer";
import ApiError from "../utils/ApiError.js";
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_SIZE } from "../utils/constants.js";

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/pdf",
]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new ApiError(400, "Unsupported file type. Allowed types: png, jpg, jpeg, pdf"));
    return;
  }

  cb(null, true);
};

const uploadAttachments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE,
    files: MAX_ATTACHMENTS,
  },
}).array("attachments", MAX_ATTACHMENTS);

export const handleUpload = (req, res, next) => {
  uploadAttachments(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Each attachment must be 5 MB or less"
        : error.message;
      return next(new ApiError(400, message));
    }

    return next(error);
  });
};
