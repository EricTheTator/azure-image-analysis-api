const express = require('express');
const router = express.Router();
const multer = require('multer');
const analyzeController = require('../controllers/analyzeController');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Analyze image from URL
router.post('/url', analyzeController.analyzeFromUrl);

// Analyze uploaded image file
router.post('/upload', upload.single('image'), analyzeController.analyzeFromUpload);

// Get available features
router.get('/features', (req, res) => {
  res.json({
    success: true,
    features: [
      { name: 'Description', description: 'Generate human-readable descriptions' },
      { name: 'Tags', description: 'Extract relevant tags and keywords' },
      { name: 'Objects', description: 'Detect objects with bounding boxes' },
      { name: 'Color', description: 'Analyze dominant and accent colors' },
      { name: 'ImageType', description: 'Detect clipart and line drawings' },
      { name: 'Faces', description: 'Detect faces and estimate age/gender' },
      { name: 'Adult', description: 'Detect adult or racy content' },
      { name: 'Brands', description: 'Detect well-known brands and logos' },
      { name: 'Categories', description: 'Categorize images into taxonomy' }
    ]
  });
});

module.exports = router;
