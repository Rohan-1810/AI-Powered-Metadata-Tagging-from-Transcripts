const multer = require('multer');
const path = require('path');

// Store file buffer in memory for immediate processing and DB storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.txt', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype === 'text/plain' || file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .txt and .json files are supported.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
});

const handleUpload = (req, res, next) => {
  const singleUpload = upload.single('file');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed limit of 5 MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

module.exports = { handleUpload };
