window.config = {
  // Автоматически определяем IP API в зависимости от того, где запущено
  ip_api: window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('192.168.')
          ? 'http://localhost' 
          : 'http://109.69.22.155'
};