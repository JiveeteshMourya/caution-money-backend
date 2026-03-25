import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { multerMiddlewareText } from "../responseTexts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FINAL upload folder (relative to project root): ./public/tempImgs
export const UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "tempImgs"
);
// ensure dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// to tempFiles folder for general files
export const UPLOAD_DIR_FILES = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "tempFiles"
);
if (!fs.existsSync(UPLOAD_DIR_FILES))
  fs.mkdirSync(UPLOAD_DIR_FILES, { recursive: true });

// diskStorage (we need req.file.path later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const prefix = Date.now();
    cb(null, `${prefix}-${file.originalname}`);
  },
});

// storge for general files (image/pdf/docx/pptx)
const storageFiles = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR_FILES);
  },
  filename: (req, file, cb) => {
    const prefix = Date.now();
    cb(null, `${prefix}-${file.originalname}`);
  },
});

// only allow images and limit size (adjust size as needed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/"))
    return cb(null, true);
  cb(new Error(multerMiddlewareText.onlyImages));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

// ---------- new: uploadFile which accepts image/pdf/docx/pptx ----------
const ALLOWED_MIMETYPES = new Set([
  // images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // pdf/docx/pptx (common)
  "application/pdf",
  "application/msword", // .doc (older)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  // microsoft excel if you want to allow later
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const fileFilterFiles = (req, file, cb) => {
  if (!file || !file.mimetype) return cb(new Error("Invalid file upload"));

  if (ALLOWED_MIMETYPES.has(file.mimetype)) return cb(null, true);

  // fall back: allow any image/* (in case some browsers send different mime)
  if (file.mimetype.startsWith && file.mimetype.startsWith("image/"))
    return cb(null, true);

  cb(new Error(multerMiddlewareText.onlyValidFiles));
};

export const uploadFile = multer({
  storage: storageFiles,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: fileFilterFiles,
});
