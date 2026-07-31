// ClearPopup.tsx
import React from 'react';
import Schablon3 from '../../../assets/Schablon/Schablon3.svg';

interface ClearPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClearPopup: React.FC<ClearPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div
        style={{
          width: '630px',
          height: '180px',
          backgroundColor: '#FFFFFF',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '20px',
            top: '17px',
            width: '27px',
            height: '24px',
          }}
        >
          <img
            src={Schablon3}
            alt=""
            style={{
              width: '27px',
              height: '24px',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#2D4059',
            }}
          >
            Очистить шаблон?
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <button
            onClick={() => {
              console.log('Весь шаблон');
              onClose();
            }}
            style={{
              width: '170px',
              height: '35px',
              borderRadius: '25px',
              border: '2px solid #666EFE',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2D4059',
              padding: 0,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F1FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Весь шаблон
          </button>

          <button
            onClick={() => {
              console.log('Выбранные ячейки');
              onClose();
            }}
            style={{
              width: '170px',
              height: '35px',
              borderRadius: '25px',
              border: '2px solid #666EFE',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2D4059',
              padding: 0,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F1FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Выбранные ячейки
          </button>

          <button
            onClick={onClose}
            style={{
              width: '170px',
              height: '35px',
              borderRadius: '25px',
              border: '2px solid #666EFE',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2D4059',
              padding: 0,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F1FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearPopup;