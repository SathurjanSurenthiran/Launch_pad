import multer from "multer";
import ValidationException from "../exceptions/validation.exception.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WEBP images are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

export const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadArray = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

export default {
  uploadFields,
  uploadSingle,
  uploadArray,
};
