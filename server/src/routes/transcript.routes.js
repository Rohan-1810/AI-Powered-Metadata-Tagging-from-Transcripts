const express = require('express');
const router = express.Router();
const {
  createTranscript,
  getTranscripts,
  getTranscriptById,
  deleteTranscript,
  retryTranscript
} = require('../controllers/transcript.controller');
const { protect } = require('../middleware/auth.middleware');
const { handleUpload } = require('../middleware/upload.middleware');

// All transcript routes require JWT authentication
router.use(protect);

router.route('/')
  .post(handleUpload, createTranscript)
  .get(getTranscripts);

router.route('/:id')
  .get(getTranscriptById)
  .delete(deleteTranscript);

router.post('/:id/retry', retryTranscript);

module.exports = router;
