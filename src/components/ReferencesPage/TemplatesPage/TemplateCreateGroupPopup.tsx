// TemplateCreateGroupPopup.tsx
import React, { useState, useEffect } from 'react';

interface TemplateCreateGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

let globalZIndex = 10003;

const getNextZIndex = () => {
  globalZIndex += 1;
  return globalZIndex;
};

const TemplateCreateGroupPopup: React.FC<TemplateCreateGroupPopupProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [zIndex, setZIndex] = useState(10003);

  useEffect(() => {
    if (isOpen) {
      setZIndex(getNextZIndex());
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '500px', backgroundColor: '#FFFFFF', borderRadius: '20px',
          padding: '30px 35px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          fontFamily: 'Inter, sans-serif', fontSize: '17px', fontWeight: 700,
          color: '#2D4059', margin: '0 0 30px 0', textAlign: 'center',
        }}>
          Создание группы
        </h2>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500,
            color: '#2D4059', display: 'block', marginBottom: '7px',
          }}>
            Название группы
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите название"
            autoFocus
            style={{
              width: '100%', height: '44px', borderRadius: '10px',
              border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF',
              paddingLeft: '12px', paddingRight: '12px', fontFamily: 'Inter, sans-serif',
              fontSize: '14px', fontWeight: 500, color: '#2D4059', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            style={{
              height: '40px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px',
              border: 'none', backgroundColor: name.trim() && !isLoading ? '#666EFE' : '#BCC8FF',
              cursor: name.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: '#FFFFFF',
            }}
          >
            {isLoading ? 'Создание...' : 'Создать'}
          </button>
          <button
            onClick={onClose}
            style={{
              height: '40px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px',
              border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '15px',
              fontWeight: 400, color: '#2D4059',
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreateGroupPopup;