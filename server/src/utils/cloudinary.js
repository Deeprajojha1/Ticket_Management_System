import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadBufferToCloudinary = (file, folder = "supportdesk-ai/tickets") => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, "File upload failed", [{ message: error.message }]));
          return;
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          resourceType: result.resource_type,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileType: file.mimetype,
          size: file.size,
        });
      },
    );

    stream.end(file.buffer);
  });
};

export default cloudinary;
