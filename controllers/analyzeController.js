const axios = require('axios');
const { sanitizeUrl, validateImageUrl } = require('../utils/validation');

const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const AZURE_API_KEY = process.env.AZURE_API_KEY;

// Validate environment variables
if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
  console.error('❌ ERROR: Azure credentials not found in .env file!');
  console.error('Please set AZURE_ENDPOINT and AZURE_API_KEY in your .env file');
}

/**
 * Analyze image from URL
 */
exports.analyzeFromUrl = async (req, res) => {
  try {
    const { url, features } = req.body;
    
    // Validate input
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }
    
    // Validate URL format
    if (!validateImageUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }
    
    // Sanitize URL
    const sanitizedUrl = sanitizeUrl(url);
    
    // Default features if not provided
    const visualFeatures = features || ['Description', 'Tags', 'Objects', 'Color'];
    
    console.log(`📸 Analyzing image from URL: ${sanitizedUrl}`);
    console.log(`🔍 Features: ${visualFeatures.join(', ')}`);
    
    // Call Azure Computer Vision API
    const response = await axios.post(
      `${AZURE_ENDPOINT}/vision/v3.2/analyze`,
      { url: sanitizedUrl },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_API_KEY,
          'Content-Type': 'application/json'
        },
        params: {
          visualFeatures: visualFeatures.join(','),
          details: '',
          language: 'en'
        }
      }
    );
    
    console.log('✅ Analysis complete');
    
    res.json({
      success: true,
      data: response.data,
      metadata: {
        requestId: response.headers['apim-request-id'],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Analysis error:', error.response?.data || error.message);
    
    // Handle specific Azure API errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.message || 'Azure API error',
        code: error.response.data.error?.code
      });
    }
    
    // Handle network/other errors
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image'
    });
  }
};

/**
 * Analyze uploaded image file
 */
exports.analyzeFromUpload = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided. Use "image" as the field name.' 
      });
    }
    
    // Parse features from request body
    let features = ['Description', 'Tags', 'Objects', 'Color'];
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
      } catch (e) {
        // If not JSON, try comma-separated string
        features = req.body.features.split(',').map(f => f.trim());
      }
    }
    
    console.log(`📸 Analyzing uploaded image: ${req.file.originalname}`);
    console.log(`📦 Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`🔍 Features: ${features.join(', ')}`);
    
    // Call Azure Computer Vision API with binary data
    const response = await axios.post(
      `${AZURE_ENDPOINT}/vision/v3.2/analyze`,
      req.file.buffer,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_API_KEY,
          'Content-Type': 'application/octet-stream'
        },
        params: {
          visualFeatures: features.join(','),
          details: '',
          language: 'en'
        }
      }
    );
    
    console.log('✅ Analysis complete');
    
    res.json({
      success: true,
      data: response.data,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        requestId: response.headers['apim-request-id'],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Upload analysis error:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.message || 'Azure API error',
        code: error.response.data.error?.code
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze uploaded image'
    });
  }
};