/**
 * Sanitize URL input to prevent injection attacks
 */
exports.sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  return url
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Validate image URL format
 */
exports.validateImageUrl = (url) => {
  try {
    const urlObject = new URL(url);
    
    // Must be http or https
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return false;
    }
    
    return true;
    
  } catch (e) {
    return false;
  }
};

/**
 * Validate features array
 */
exports.validateFeatures = (features) => {
  const validFeatures = [
    'Description', 'Tags', 'Objects', 'Color', 
    'ImageType', 'Faces', 'Adult', 'Brands', 'Categories'
  ];
  
  if (!Array.isArray(features)) return false;
  
  return features.every(feature => validFeatures.includes(feature));
};
