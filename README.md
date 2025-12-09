# 🖼️ Azure Image Analysis API

A professional, production-ready REST API that provides seamless access to Microsoft Azure's Computer Vision capabilities for image analysis. This API acts as an intelligent middleware layer, simplifying complex Azure Computer Vision operations into an easy-to-use interface.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.18-blue.svg)](https://expressjs.com/)
[![Azure](https://img.shields.io/badge/Azure-Computer%20Vision-0089D6.svg)](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)



## 🎮 Live Demo

**Interactive Demo:** [http://165.22.163.145:3000/demo-test.html](http://165.22.163.145:3000/demo-test.html)

Test the API with both URL-based analysis and file uploads!
---

## 📋 Table of Contents

- [For Business Stakeholders](#-for-business-stakeholders)
- [For Developers](#-for-developers)
- [For Architects](#-for-architects)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security](#-security)
- [Performance & Scalability](#-performance--scalability)
- [Maintenance](#-maintenance)
- [License](#-license)

---

## 💼 For Business Stakeholders

### What This API Does

Transform your business applications with AI-powered image analysis. This API enables your systems to:

- **Automatically describe images** - Generate human-readable descriptions of visual content
- **Extract metadata** - Identify objects, colors, and key elements in images
- **Content moderation** - Detect inappropriate content automatically
- **Brand recognition** - Identify logos and brands in images
- **Automated tagging** - Generate searchable keywords for image libraries

### Business Value

**Cost Efficiency**
- Pay only for what you use (Azure free tier: 5,000 requests/month)
- No need for in-house computer vision expertise
- Reduces manual image classification labor costs by up to 90%

**Speed to Market**
- RESTful API integrates with any platform in hours, not months
- No complex Azure configuration required for end users
- Comprehensive documentation reduces developer onboarding time

**Use Cases**
- **E-commerce**: Automatically tag and categorize product images
- **Content Management**: Organize and search media libraries
- **Social Media**: Moderate user-generated content
- **Digital Asset Management**: Index and retrieve visual assets
- **Accessibility**: Generate alt-text for images automatically

### ROI

| Metric | Value |
|--------|-------|
| Implementation Time | 2-4 hours |
| Monthly Cost (Free Tier) | $0 for 5,000 images |
| Integration Complexity | Low (standard REST API) |
| Maintenance Overhead | Minimal (managed service) |
| Scalability | High (cloud-based) |

---

## 👨‍💻 For Developers

### Technology Stack

```
Backend:      Node.js v18+ with Express.js
Cloud:        Microsoft Azure Computer Vision API v3.2
Security:     Helmet.js, Input validation, CORS
File Upload:  Multer with size/type validation
Monitoring:   Morgan logging, PM2 process management
```

### Features

- ✅ RESTful API design following best practices
- ✅ Comprehensive input validation and sanitization
- ✅ Detailed error handling with meaningful messages
- ✅ Support for both URL and file upload analysis
- ✅ Rate limiting awareness
- ✅ Request/response logging
- ✅ CORS enabled for web applications
- ✅ Helmet.js security headers
- ✅ Timeout handling (30s max)
- ✅ Multiple image format support (JPEG, PNG, GIF, BMP, WEBP)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/azure-image-analysis-api.git
cd azure-image-analysis-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Azure credentials

# Run development server
npm run dev

# Run production server
npm start
```

### Environment Variables

```bash
AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_API_KEY=your-azure-api-key
PORT=3000
NODE_ENV=production
```

### API Endpoints

#### POST `/api/v1/analyze/url`
Analyze image from URL

**Request:**
```json
{
  "url": "https://example.com/image.jpg",
  "features": ["Description", "Tags", "Objects"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "description": { /* ... */ },
    "tags": [ /* ... */ ],
    "objects": [ /* ... */ ]
  },
  "metadata": {
    "requestId": "abc123...",
    "timestamp": "2025-12-08T23:30:00.000Z"
  }
}
```

#### POST `/api/v1/analyze/upload`
Analyze uploaded image file

**Request:** `multipart/form-data`
- `image`: Image file (max 4MB)
- `features`: JSON array or comma-separated list

#### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-08T23:30:00.000Z",
  "uptime": 3600.5
}
```

### Available Analysis Features

| Feature | Description |
|---------|-------------|
| `Description` | AI-generated natural language descriptions |
| `Tags` | Keyword tags with confidence scores |
| `Objects` | Object detection with bounding boxes |
| `Color` | Dominant and accent color analysis |
| `ImageType` | Clipart or line drawing detection |
| `Faces` | Face detection with age/gender estimation |
| `Adult` | Adult/racy/gory content detection |
| `Brands` | Logo and brand recognition |
| `Categories` | Image categorization (86 categories) |

### Error Handling

All errors return consistent JSON structure:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "details": "Technical details for developers",
  "code": "AzureErrorCode"
}
```

### Code Example

```javascript
const axios = require('axios');

async function analyzeImage(imageUrl) {
  try {
    const response = await axios.post('http://your-server.com/api/v1/analyze/url', {
      url: imageUrl,
      features: ['Description', 'Tags', 'Objects']
    });
    
    console.log('Analysis:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
}
```

### Testing

```bash
# Test with cURL
curl -X POST http://localhost:3000/api/v1/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg"}'

# Test file upload
curl -X POST http://localhost:3000/api/v1/analyze/upload \
  -F "image=@./test-image.jpg"
```

---

## 🏗️ For Architects

### System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Client    │─────▶│  Your API    │─────▶│  Azure Computer │
│  (Postman,  │      │  (Express    │      │  Vision API     │
│   Web App)  │◀─────│   Node.js)   │◀─────│  (Cloud Service)│
└─────────────┘      └──────────────┘      └─────────────────┘
     HTTP/HTTPS          HTTPS                   HTTPS
```

### Design Principles

**1. Separation of Concerns**
- Routes: Handle HTTP routing
- Controllers: Business logic and Azure integration
- Utils: Validation and sanitization
- Middleware: Security and logging

**2. Error Handling Strategy**
- Graceful degradation
- Meaningful error messages for all stakeholders
- Proper HTTP status codes
- Logging for debugging and monitoring

**3. Security Layers**
- Input validation (URL, file type, size)
- Sanitization to prevent injection attacks
- Helmet.js for HTTP security headers
- CORS configuration
- API credentials stored in environment variables
- No sensitive data in logs or responses

### Scalability Considerations

**Horizontal Scaling**
- Stateless design allows multiple instances
- No session storage (can add Redis if needed)
- Load balancer ready

**Vertical Scaling**
- Efficient memory usage
- Non-blocking I/O with async/await
- Stream processing for large files

**Performance Optimizations**
- Request timeouts prevent resource exhaustion
- File size limits (4MB for uploads)
- Input validation before external API calls
- Connection pooling (axios default)

### Reliability & Availability

**High Availability**
- PM2 process management with auto-restart
- Health check endpoint for monitoring
- Azure SLA: 99.9% uptime

**Fault Tolerance**
- Comprehensive error handling
- Timeout protection (30s)
- Graceful error responses
- Detailed logging for debugging

**Monitoring**
- Morgan HTTP request logging
- Console logging for operations
- PM2 monitoring capabilities
- Azure request tracking via request IDs

### Security Architecture

**Attack Vector Mitigation**

| Vector | Mitigation |
|--------|------------|
| XSS | Input sanitization, Helmet CSP |
| CSRF | Stateless API (no sessions) |
| Injection | Input validation, URL sanitization |
| DoS | Rate limiting (Azure-side), Timeouts |
| File Upload Attacks | MIME type validation, Size limits |
| Credential Exposure | Environment variables, .gitignore |

**Data Flow Security**
1. Input validation at API boundary
2. Sanitization before processing
3. TLS encryption in transit (HTTPS)
4. Azure handles data at rest
5. No sensitive data logging

### Deployment Architecture

**Production Setup**
```
Internet → Load Balancer → Reverse Proxy (Nginx) → PM2 → Node.js API → Azure
                                ↓
                         SSL/TLS Termination
                         Rate Limiting
                         DDoS Protection
```

**Recommended Infrastructure**
- **Hosting**: DigitalOcean Droplet (2GB RAM minimum)
- **Process Manager**: PM2 with cluster mode
- **Reverse Proxy**: Nginx for SSL termination
- **DNS**: CloudFlare for DDoS protection
- **Monitoring**: PM2 Plus or custom solution

### Maintainability

**Code Quality**
- Clear separation of concerns
- Consistent error handling patterns
- Comprehensive comments
- RESTful design principles

**Documentation**
- Inline code comments
- API documentation (separate HTML)
- This README for all stakeholders
- Environment variable documentation

**Versioning**
- API versioned (`/api/v1/`)
- Semantic versioning for releases
- Git for source control
- Environment-based configuration

### Integration Patterns

**Synchronous (Current)**
```
Client → API → Azure → API → Client
  └─ Waits for complete response
```

**Asynchronous (Future Enhancement)**
```
Client → API → Queue → Worker → Azure
         ↓
      Job ID
         ↓
Client polls/webhook for results
```

### Compliance & Data Privacy

- No image data stored on API server
- Images processed by Azure in their region
- Azure GDPR compliance inherited
- No PII collected or logged
- Audit trail via request IDs

### Capacity Planning

**Free Tier Limits**
- 20 requests/minute
- 5,000 requests/month
- Recommended for: Development, POC, small applications

**Production Recommendations**
- Monitor Azure metrics
- Upgrade to Standard tier for production
- Implement caching for repeated analyses
- Consider CDN for static documentation

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Azure Computer Vision resource
- DigitalOcean account (for deployment)

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/azure-image-analysis-api.git
   cd azure-image-analysis-api
   npm install
   ```

2. **Configure**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure credentials
   ```

3. **Run**
   ```bash
   npm run dev
   ```

4. **Test**
   Visit `http://localhost:3000` for interactive documentation

---

## 📚 API Documentation

Comprehensive interactive documentation is available at the root endpoint (`/`) when the server is running. The documentation includes:

- Getting started guide
- Complete endpoint reference
- Code examples in multiple languages
- Live interactive demo
- Error handling guide
- Feature descriptions

Access it at: `http://your-server-url/`

---

## 🚢 Deployment

### DigitalOcean Deployment

1. **Create Droplet**
   ```bash
   # Ubuntu 22.04, 2GB RAM minimum
   ```

2. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Clone & Setup**
   ```bash
   git clone https://github.com/yourusername/azure-image-analysis-api.git
   cd azure-image-analysis-api
   npm install --production
   ```

4. **Configure Environment**
   ```bash
   nano .env
   # Add your Azure credentials
   ```

5. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

6. **Configure Firewall**
   ```bash
   sudo ufw allow 3000
   sudo ufw enable
   ```

### PM2 Configuration

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'azure-image-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 🔒 Security

### Security Features

- ✅ Input validation on all endpoints
- ✅ XSS protection via sanitization
- ✅ Helmet.js security headers
- ✅ CORS configured
- ✅ File type validation
- ✅ Size limits enforced
- ✅ Timeout protection
- ✅ No credential exposure

### Security Best Practices

1. **Never commit `.env` file**
2. **Use HTTPS in production** (configure Nginx/CloudFlare)
3. **Rotate API keys** regularly
4. **Monitor logs** for suspicious activity
5. **Update dependencies** regularly
6. **Use environment-specific configs**

---

## ⚡ Performance & Scalability

### Current Performance

- **Response Time**: < 3 seconds (avg)
- **Concurrent Requests**: 20/minute (Azure free tier)
- **File Processing**: Up to 4MB images
- **Timeout**: 30 seconds maximum

### Scaling Strategies

**Immediate (No Code Changes)**
- Upgrade Azure tier for higher limits
- Use PM2 cluster mode
- Add load balancer
- Implement CDN for documentation

**Future Enhancements**
- Redis caching for repeated images
- Webhook/polling for async processing
- Image preprocessing/optimization
- Multiple Azure region support

---

## 🛠️ Maintenance

### Monitoring

```bash
# PM2 monitoring
pm2 monit
pm2 logs azure-image-api

# Check status
pm2 status

# Restart if needed
pm2 restart azure-image-api
```

### Updates

```bash
# Update code
git pull origin main
npm install
pm2 restart azure-image-api
```

### Health Checks

Monitor `/health` endpoint:
```bash
curl http://your-server.com/health
```

### Logs

Logs are managed by PM2:
- Location: `~/.pm2/logs/`
- Rotation: Automatic (PM2)
- Retention: Configure via PM2

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This is an educational project. For suggestions or issues, please contact the repository owner.

---

## 📞 Support

For technical support or questions:
- Check the interactive documentation at `/`
- Review this README
- Check Azure Computer Vision documentation

---

## 🎓 Academic Project

This API was developed as part of the UNCC System Integration program to demonstrate:
- System integration skills
- API design and documentation
- Cloud service integration
- Professional development practices
- Security awareness
- Scalability considerations

---

**Built with ❤️ for UNCC Final Project**
