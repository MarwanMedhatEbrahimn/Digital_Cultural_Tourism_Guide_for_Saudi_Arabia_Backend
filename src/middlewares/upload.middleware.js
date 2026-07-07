const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

// Ensure the target directory exists, create it recursively if it doesn't. 
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Build a multer storage engine that writes to `uploads/<subDir>/`.
const buildStorage = (subDir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.join('uploads', subDir);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

// Common file filter — only allow image MIME types.
const imageFileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
};

// City images upload — field name "images", max `MAX_FILES` files.
const uploadCityImages = multer({
  storage: buildStorage('cities'),
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('images', MAX_FILES);

// Place images upload — field name "images", max `MAX_FILES` files.
const uploadPlaceImages = multer({
  storage: buildStorage('places'),
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('images', MAX_FILES);

// Express middleware wrapper that converts Multer errors into structured JSON responses.
const handleMulterError = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// Convert an array of uploaded Multer files into URL strings relative to server root.
const filesToUrls = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((f) => `/${f.path.replace(/\\/g, '/')}`);
};

// Delete image files from disk given an array of URL strings.
const deleteFiles = (urls) => {
  if (!urls || urls.length === 0) return;
  urls.forEach((url) => {
    const filePath = path.join(process.cwd(), url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

module.exports = {
  uploadCityImages: handleMulterError(uploadCityImages),
  uploadPlaceImages: handleMulterError(uploadPlaceImages),
  filesToUrls,
  deleteFiles,
};
