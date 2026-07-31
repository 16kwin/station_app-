// AxiosService.ts
import axios from 'axios';
import ConstantInfo from '../info/ConstantInfo';
import { navigateTo } from './navigate';

declare global {
  interface Window {
    config: { ip_api: string };
  }
}

// Настройка axios
const AxiosService = axios.create({
  baseURL: window.config.ip_api,
  withCredentials: true,
});

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

let csrfInitialized = false;

// Переменные для очереди обновления токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

AxiosService.interceptors.request.use(async (config) => {
  // Для GET запросов на /csrf не добавляем CSRF токен
  if (config.url?.includes('/csrf')) {
    return config;
  }
  
  // Если CSRF ещё не инициализирован, получаем токен
  if (!csrfInitialized) {
    try {
      const csrfResponse = await AxiosService.get('/csrf');
      const csrfToken = csrfResponse.data.token;
      AxiosService.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
      csrfInitialized = true;
      console.log('CSRF инициализирован в интерцепторе');
    } catch (error) {
      console.error('Ошибка получения CSRF в интерцепторе:', error);
    }
  }
  
  // Устанавливаем CSRF токен в заголовок для не-GET запросов
  if (config.method !== 'get') {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    } else {
      const defaultToken = AxiosService.defaults.headers.common['X-XSRF-TOKEN'];
      if (defaultToken) {
        config.headers['X-XSRF-TOKEN'] = defaultToken;
      }
    }
  }
  
  return config;
});

AxiosService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если оригинальный запрос не существует, просто отклоняем
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Не пытаемся обновить токен для запроса refresh_token
    if (originalRequest.url?.includes(ConstantInfo.restApiRefreshToken)) {
      return Promise.reject(error);
    }

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Если уже идёт обновление, ставим запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return AxiosService(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пробуем обновить токен
        await axios.get(
          window.config.ip_api + ConstantInfo.restApiRefreshToken, 
          { withCredentials: true }
        );

        // Успешно обновили — обрабатываем очередь
        processQueue(null);
        
        // Повторяем исходный запрос
        return AxiosService(originalRequest);
      } catch (refreshError) {
        // Не удалось обновить — отклоняем все запросы в очереди
        processQueue(refreshError, null);
        console.warn('Не удалось обновить токен');
        navigateTo('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    console.log('ошибка interceptors');
    console.log(error);
    return Promise.reject(error);
  }
);

export default AxiosService;