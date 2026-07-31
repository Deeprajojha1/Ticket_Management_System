import multer from "multer";
import ApiError from "../utils/ApiError.js";
import {
  MAX_AI_AUDIO_SIZE,
  MAX_AI_CHAT_ATTACHMENTS,
  MAX_AI_CHAT_ATTACHMENT_SIZE,
} from "../utils/constants.js";

const chatAttachmentTypes = new Set([
  "image/png",
  "image/jpg",
  "image/jpeg",
  "application/pdf",
]);

const audioTypes = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/ogg",
  "audio/webm",
  "video/webm",
]);

const storage = multer.memoryStorage();

const createFileFilter = (allowedTypes, message) => (_req, file, cb) => {
  if (!allowedTypes.has(file.mimetype)) {
    cb(new ApiError(400, message));
    return;
  }

  cb(null, true);
};

const chatUpload = multer({
  storage,
  fileFilter: createFileFilter(chatAttachmentTypes, "Unsupported chat attachment. Allowed types: png, jpg, jpeg, pdf"),
  limits: {
    fileSize: MAX_AI_CHAT_ATTACHMENT_SIZE,
    files: MAX_AI_CHAT_ATTACHMENTS,
  },
}).array("attachments", MAX_AI_CHAT_ATTACHMENTS);

const audioUpload = multer({
  storage,
  fileFilter: createFileFilter(audioTypes, "Unsupported audio type. Allowed types: wav, mp3, m4a, ogg, webm"),
  limits: {
    fileSize: MAX_AI_AUDIO_SIZE,
    files: 1,
  },
}).single("audio");

const handleMulter = (uploader, sizeMessage) => (req, res, next) => {
  uploader(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE" ? sizeMessage : error.message;
      return next(new ApiError(400, message));
    }

    return next(error);
  });
};

export const handleAIChatUpload = handleMulter(chatUpload, "Each chat attachment must be 5 MB or less");
export const handleAIAudioUpload = handleMulter(audioUpload, "Audio file must be 15 MB or less");
