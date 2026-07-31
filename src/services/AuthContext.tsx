// services/AuthContext.tsx
import React, { useContext, useEffect, useState, type ReactNode } from 'react';
import ConstantInfo from '../info/ConstantInfo';
import AxiosService from './AxiosService';

interface ModalProps {
  children?: ReactNode;
}

interface UserInfo {
  id: string;
  name: string;
  role: string;
  roleDescription: string;
  firstName: string;
  middleName: string;
  lastName: string;
  imgAvatar: any;
}

interface ValueType {
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  userInfo: UserInfo;
  isAdmin: boolean;
  isOperator: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  checkPassword: (password: string) => Promise<boolean>;
  setLocked: (locked: boolean) => void;
  isLocked: boolean;
}

const AuthContext = React.createContext<ValueType | null>(null);

const LOCKED_STORAGE_KEY = 'app_locked_state';
const LOGOUT_EVENT_KEY = 'app_logout_event';
const LOGIN_EVENT_KEY = 'app_login_event';

const emptyUserInfo: UserInfo = {
  id: '',
  name: '',
  role: '',
  roleDescription: '',
  firstName: '',
  middleName: '',
  lastName: '',
  imgAvatar: undefined,
};

export const AuthProvider: React.FC<ModalProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLockedState] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCKED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [userInfo, setUserInfo] = useState<UserInfo>(emptyUserInfo);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOperator, setIsOperator] = useState(false);

  const setLocked = (locked: boolean) => {
    setIsLockedState(locked);
    try {
      localStorage.setItem(LOCKED_STORAGE_KEY, JSON.stringify(locked));
    } catch (e) {
      console.error('Failed to save locked state:', e);
    }
  };

  const resetAuthState = () => {
    setIsAuth(false);
    setIsAdmin(false);
    setIsOperator(false);
    setUserInfo(emptyUserInfo);
    setIsLockedState(false);
    try {
      localStorage.removeItem(LOCKED_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear auth state:', e);
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await AxiosService.get(ConstantInfo.restApiCheckAuth);
      setIsAuth(true);
      setUserInfo({
        id: response.data.id,
        name: response.data.username,
        role: response.data.role,
        roleDescription: response.data.roleDescription,
        firstName: response.data.firstName,
        middleName: response.data.middleName,
        lastName: response.data.lastName,
        imgAvatar: response.data?.imgAvatar || undefined,
      });
      setIsAdmin(response.data.role === 'ROLE_ADMIN');
      setIsOperator(response.data.role === 'ROLE_OPERATOR');
      return true;
    } catch {
      resetAuthState();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  const logout = async () => {
    try {
      await AxiosService.post(ConstantInfo.restApiLogout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      resetAuthState();
      
      // Отправляем сигнал другим вкладкам
      try {
        localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
        localStorage.removeItem('tabs_state');
        localStorage.removeItem('drafts_state');
      } catch (e) {}
    }
  };

  const checkPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await AxiosService.post(ConstantInfo.restApiCheckPassword, { password });
      return response.status === 200;
    } catch {
      return false;
    }
  };

  // Слушаем изменения в localStorage из других вкладок
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Синхронизация блокировки
      if (e.key === LOCKED_STORAGE_KEY) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : false;
          setIsLockedState(newValue);
        } catch {}
      }
      
      // Синхронизация логаута
      if (e.key === LOGOUT_EVENT_KEY && e.newValue) {
        // Принудительно переходим на страницу логина
        window.location.href = '/login';
      }
      
      // Синхронизация входа
      if (e.key === LOGIN_EVENT_KEY && e.newValue) {
        // Вызываем refreshAuth для проверки новых кук
        refreshAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuth();

    // Периодическая проверка (каждые 3 часа)
    const interval = setInterval(() => {
      refreshAuth();
    }, 180 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        setIsAuth,
        isLoading,
        userInfo,
        isAdmin,
        isOperator,
        refreshAuth,
        logout,
        checkPassword,
        setLocked,
        isLocked,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): ValueType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};