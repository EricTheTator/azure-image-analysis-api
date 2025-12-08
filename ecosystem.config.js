module.exports = {
  apps: [{
    name: 'azure-image-api',
    script: './server.js',
    
    // Instances
    instances: 'max',              // Use all CPU cores
    exec_mode: 'cluster',          // Cluster mode for load balancing
    
    // Restart behavior
    autorestart: true,             // Auto-restart if crashed
    watch: false,                  // Don't watch files in production
    max_memory_restart: '1G',      // Restart if memory exceeds 1GB
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Development environment
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};
