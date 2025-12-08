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
 * Analyze image from URL with comprehensive validation and error handling
 */
exports.analyzeFromUrl = async (req, res) => {
  try {
    const { url, features } = req.body;
    
    // Validate input exists
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required',
        details: 'Please provide a valid image URL in the request body'
      });
    }
    
    // Validate URL format
    if (!validateImageUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
        details: 'URL must start with http:// or https:// and point to a valid image'
      });
    }
    
    // Validate URL length (Azure limit)
    if (url.length > 2048) {
      return res.status(400).json({
        success: false,
        error: 'URL too long',
        details: 'Image URL must be less than 2048 characters'
      });
    }
    
    // Sanitize URL
    const sanitizedUrl = sanitizeUrl(url);
    
    // Validate and sanitize features
    let visualFeatures = ['Description', 'Tags', 'Objects', 'Color'];
    
    if (features) {
      if (!Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid features format',
          details: 'Features must be an array of strings'
        });
      }
      
      const validFeatures = [
        'Description', 'Tags', 'Objects', 'Color', 
        'ImageType', 'Faces', 'Adult', 'Brands', 'Categories'
      ];
      
      const invalidFeatures = features.filter(f => !validFeatures.includes(f));
      
      if (invalidFeatures.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid feature names',
          details: `Invalid features: ${invalidFeatures.join(', ')}. Valid features are: ${validFeatures.join(', ')}`
        });
      }
      
      visualFeatures = features;
    }
    
    console.log(`📸 Analyzing image from URL: ${sanitizedUrl}`);
    console.log(`🔍 Features: ${visualFeatures.join(', ')}`);
    
    // Call Azure Computer Vision API with timeout
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
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log('✅ Analysis complete');
    
    res.json({
      success: true,
      data: response.data,
      metadata: {
        requestId: response.headers['apim-request-id'],
        timestamp: new Date().toISOString(),
        featuresUsed: visualFeatures
      }
    });
    
  } catch (error) {
    console.error('❌ Analysis error:', error.response?.data || error.message);
    
    // Handle specific Azure API errors with user-friendly messages
    if (error.response) {
      const azureError = error.response.data.error;
      let userMessage = 'Azure API error';
      let details = '';
      
      // Provide helpful error messages based on Azure error codes
      switch (azureError?.code) {
        case 'InvalidImageUrl':
          userMessage = 'Invalid or inaccessible image URL';
          details = 'The image URL could not be accessed. Please ensure the URL is publicly accessible and points to a valid image file.';
          break;
        case 'InvalidImageFormat':
          userMessage = 'Unsupported image format';
          details = 'Supported formats: JPEG, PNG, GIF, BMP. Please provide an image in one of these formats.';
          break;
        case 'InvalidImageSize':
          userMessage = 'Invalid image dimensions';
          details = 'Image must be at least 50x50 pixels and no larger than 16,000x16,000 pixels.';
          break;
        case 'InvalidImage':
          userMessage = 'Invalid or corrupted image';
          details = 'The image file appears to be corrupted or is not a valid image.';
          break;
        case 'BadArgument':
          userMessage = 'Invalid request parameters';
          details = azureError.message || 'One or more parameters in your request are invalid.';
          break;
        default:
          if (error.response.status === 429) {
            userMessage = 'Rate limit exceeded';
            details = 'Too many requests. Free tier allows 20 requests per minute. Please wait before trying again.';
          } else {
            details = azureError?.message || 'An error occurred while processing your request.';
          }
      }
      
      return res.status(error.response.status).json({
        success: false,
        error: userMessage,
        details: details,
        code: azureError?.code
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        details: 'The image analysis request took too long. Please try again with a smaller image.'
      });
    }
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        details: 'Unable to connect to Azure Computer Vision service. Please try again later.'
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
      details: 'An unexpected error occurred. Please try again later.'
    });
  }
};

/**
 * Analyze uploaded image file with comprehensive validation
 */
exports.analyzeFromUpload = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided',
        details: 'Please upload an image file using the "image" field name.'
      });
    }
    
    // Validate file size (Azure limit is 4MB for upload)
    if (req.file.size > 4 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'File too large',
        details: 'Image file must be less than 4MB. Please compress or resize your image.'
      });
    }
    
    // Validate file size minimum (at least 1KB to be a real image)
    if (req.file.size < 1024) {
      return res.status(400).json({
        success: false,
        error: 'File too small',
        details: 'Image file must be at least 1KB. The uploaded file appears to be invalid or corrupted.'
      });
    }
    
    // Validate MIME type
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];
    
    if (!validMimeTypes.includes(req.file.mimetype)) {
      return res.status(415).json({
        success: false,
        error: 'Unsupported file type',
        details: `File type "${req.file.mimetype}" is not supported. Please upload a JPEG, PNG, GIF, BMP, or WEBP image.`
      });
    }
    
    // Parse features from request body
    let features = ['Description', 'Tags', 'Objects', 'Color'];
    
    if (req.body.features) {
      try {
        // Try to parse as JSON
        features = JSON.parse(req.body.features);
        
        if (!Array.isArray(features)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid features format',
            details: 'Features must be an array of strings'
          });
        }
      } catch (e) {
        // If not JSON, try comma-separated string
        features = req.body.features.split(',').map(f => f.trim());
      }
      
      // Validate feature names
      const validFeatures = [
        'Description', 'Tags', 'Objects', 'Color', 
        'ImageType', 'Faces', 'Adult', 'Brands', 'Categories'
      ];
      
      const invalidFeatures = features.filter(f => !validFeatures.includes(f));
      
      if (invalidFeatures.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid feature names',
          details: `Invalid features: ${invalidFeatures.join(', ')}. Valid features are: ${validFeatures.join(', ')}`
        });
      }
    }
    
    console.log(`📸 Analyzing uploaded image: ${req.file.originalname}`);
    console.log(`📦 Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`🎨 Type: ${req.file.mimetype}`);
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
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: 4 * 1024 * 1024, // 4MB limit
        maxBodyLength: 4 * 1024 * 1024
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
        featuresUsed: features,
        requestId: response.headers['apim-request-id'],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Upload analysis error:', error.response?.data || error.message);
    
    // Handle Azure API errors
    if (error.response) {
      const azureError = error.response.data.error;
      let userMessage = 'Azure API error';
      let details = '';
      
      switch (azureError?.code) {
        case 'InvalidImageFormat':
          userMessage = 'Unsupported image format';
          details = 'The uploaded file is not a valid image or is corrupted. Supported formats: JPEG, PNG, GIF, BMP.';
          break;
        case 'InvalidImageSize':
          userMessage = 'Invalid image dimensions';
          details = 'Image must be at least 50x50 pixels and no larger than 16,000x16,000 pixels.';
          break;
        case 'InvalidImage':
          userMessage = 'Invalid or corrupted image';
          details = 'The uploaded file appears to be corrupted or is not a valid image.';
          break;
        default:
          if (error.response.status === 429) {
            userMessage = 'Rate limit exceeded';
            details = 'Too many requests. Please wait before trying again.';
          } else {
            details = azureError?.message || 'An error occurred while processing your image.';
          }
      }
      
      return res.status(error.response.status).json({
        success: false,
        error: userMessage,
        details: details,
        code: azureError?.code
      });
    }
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        details: 'Image processing took too long. Please try with a smaller image.'
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      error: 'Failed to analyze uploaded image',
      details: 'An unexpected error occurred during image analysis.'
    });
  }
};