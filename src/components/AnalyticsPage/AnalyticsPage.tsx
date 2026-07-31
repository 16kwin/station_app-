// AnalyticsPage.tsx — ПОЛНЫЙ ФАЙЛ
import React from 'react';
import { useTabs } from '../../context/TabContext';

const AnalyticsPage = () => {
  const { openTab } = useTabs();

  const handleOrdersClick = () => {
    openTab('/orders', 'Заказы', null);
  };

  const handleTkpClick = () => {
    openTab('/tkp', 'ТКП', null);
  };

  const buttonStyle: React.CSSProperties = {
    width: 300,
    height: 120,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(102, 110, 254, 0.15)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    fontFamily: 'Inter, sans-serif',
    fontSize: 20,
    fontWeight: 600,
    color: '#2D4059',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 40 }}>
        <button onClick={handleOrdersClick} style={buttonStyle}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666EFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Заказы
        </button>
        <button onClick={handleTkpClick} style={buttonStyle}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666EFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          ТКП
        </button>
      </div>
    </div>
  );
};

export default AnalyticsPage;