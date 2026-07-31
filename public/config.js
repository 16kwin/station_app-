window.config = {
  ip_api: window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('192.168.')
          ? 'http://localhost:8084' 
          : 'http://45.146.164.123:8084'
};