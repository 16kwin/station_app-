// components/AnimatedGradientBackground.tsx
import React from 'react';

const AnimatedGradientBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div 
        className="w-full h-full animate-cyclic-flow"
        style={{
          // Градиент с четырьмя цветами
          background: 'linear-gradient(135deg, #9F81F2, #1485E6, #59D4A9, #E7AFBE)',
          // Увеличиваем размер, чтобы сдвиги были плавными
          backgroundSize: '400% 400%', 
        }}
      />
      <style>{`
        @keyframes cyclic-flow {
          /*
             Анимация будет двигать градиент по диагонали через 4 основных позиции.
             Начало (0%) должно совпадать с концом (100%) для бесшовного цикла.
          */
          
          /* Начальное состояние (Левый нижний угол) */
          0% {
            background-position: 0% 100%; 
          }
          
          /* Переход ко второму состоянию (смещение вправо/вверх) */
          25% {
            background-position: 100% 50%; 
          }
          
          /* Переход к третьему состоянию (еще дальше) */
          50% {
            background-position: 100% 0%; 
          }
          
          /* Переход к четвертому состоянию (смещение влево/вниз) */
          75% {
            background-position: 0% 50%;
          }
          
          /* Возврат к первому состоянию, чтобы цикл был замкнут */
          100% {
            background-position: 0% 100%;
          }
        }
        .animate-cyclic-flow {
          /* Увеличил время до 24 секунд для максимальной плавности 4-шагового цикла */
          animation: cyclic-flow 24s linear infinite; 
        }
      `}</style>
    </div>
  );
};

export default AnimatedGradientBackground;