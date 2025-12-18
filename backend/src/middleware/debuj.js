// Debug middleware to log all requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.headers.authorization) {
    console.log('  Authorization header present');
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    
    if (res.statusCode >= 400) {
      console.log('  Error response:', data);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};