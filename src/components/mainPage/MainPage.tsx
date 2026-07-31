import React from 'react';
import Glavmenu from '../../assets/Glavmenu.svg';

const MainPage = () => {
  return (
    <div className="h-full w-full overflow-auto p-6 flex items-center justify-center">
      <img
        src={Glavmenu}
        alt="Главное меню"
        className="w-full h-full object-contain"
        draggable={false}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
};

export default MainPage;