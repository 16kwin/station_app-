// components/AccountPage/AccountPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '../../context/TabContext';

const AccountPage = () => {
  const { userInfo, logout, setLocked } = useAuth();
  const navigate = useNavigate();
  const { closeTab, tabs } = useTabs();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Закрываем все вкладки кроме главной
    tabs.forEach(tab => {
      if (tab.path !== '/main') {
        closeTab(tab.id);
      }
    });
    
    await logout();
    navigate('/login');
    setIsLoggingOut(false);
  };

  const handleLock = () => {
    setLocked(true);
  };

  return (
    <div className="h-full p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#2D4059]">Аккаунт</h1>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md">
        {/* Информация о пользователе */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#666EFE] rounded-full flex items-center justify-center text-white text-xl font-bold">
              {userInfo.firstName?.charAt(0) || userInfo.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#2D4059]">
                {userInfo.lastName} {userInfo.firstName} {userInfo.middleName}
              </p>
              <p className="text-gray-500">{userInfo.name}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Роль:</span> {userInfo.roleDescription || userInfo.role}
            </p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <button
            onClick={handleLock}
            className="w-full bg-gray-100 hover:bg-gray-200 text-[#2D4059] py-3 rounded-xl transition-colors font-medium"
          >
            🔒 Спящий режим
          </button>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            {isLoggingOut ? 'Выход...' : '🚪 Выйти из аккаунта'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;