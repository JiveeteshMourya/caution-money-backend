import multer from "multer";

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/"))
    return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});
