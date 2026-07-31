// ReferencesPage.tsx — ПОЛНЫЙ ФАЙЛ
import React from 'react';
import { useTabs } from '../../context/TabContext';

const ReferencesPage = () => {
  const { openTab } = useTabs();

  const buttonStyle: React.CSSProperties = {
    height: '54px',
    padding: '0 24px',
    borderRadius: '27px',
    backgroundColor: '#666EFE',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(102, 110, 254, 0.3)',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ paddingTop: '35px', paddingLeft: '60px' }}>
        <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '30px', fontWeight: 'bold', letterSpacing: '0', color: '#2D4059', margin: 0 }}>Справочники</h1>
      </div>
      <div style={{ paddingLeft: '60px', paddingTop: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => openTab('/references/holdings', 'Справочник: Холдинги', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Холдинги</span>
        </button>
        <button onClick={() => openTab('/references/nomenclature', 'Справочник: Номенклатура', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Номенклатура</span>
        </button>
        <button onClick={() => openTab('/references/accounting-groups', 'Справочник: Группы учета', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Группы учета</span>
        </button>
        <button onClick={() => openTab('/references/nomenclature-groups', 'Справочник: Группы номенклатуры', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Группы номенклатуры</span>
        </button>
        <button onClick={() => openTab('/references/nomenclature-types', 'Справочник: Виды номенклатуры', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Виды номенклатуры</span>
        </button>
        <button onClick={() => openTab('/references/attribute-types', 'Справочник: Виды характеристик', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Виды характеристик</span>
        </button>
        <button onClick={() => openTab('/references/units', 'Справочник: Единицы измерения', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Единицы измерения</span>
        </button>
        <button onClick={() => openTab('/references/manufacturers', 'Справочник: Производители', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Производители</span>
        </button>
        <button onClick={() => openTab('/references/brands', 'Справочник: Бренды', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Бренды</span>
        </button>
        <button onClick={() => openTab('/references/models', 'Справочник: Модели', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Модели</span>
        </button>
        <button onClick={() => openTab('/references/countries', 'Справочник: Страны', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Страны</span>
        </button>
        <button onClick={() => openTab('/references/suppliers', 'Справочник: Поставщики', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Поставщики</span>
        </button>
        <button onClick={() => openTab('/references/templates', 'Справочник: Шаблоны пополнения', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Шаблоны пополнения</span>
        </button>
        <button onClick={() => openTab('/references/enterprises', 'Справочник: Предприятия', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Предприятия</span>
        </button>
        <button onClick={() => openTab('/references/workshops', 'Справочник: Цеха', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Цеха</span>
        </button>
        <button onClick={() => openTab('/references/sections', 'Справочник: Участки', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Участки</span>
        </button>
        <button onClick={() => openTab('/references/station-types', 'Справочник: Типы станций', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Типы станций</span>
        </button>
        <button onClick={() => openTab('/references/station-manufacturers', 'Справочник: Производители станций', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Производители станций</span>
        </button>
        <button onClick={() => openTab('/references/station-models', 'Справочник: Модели станций', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Модели станций</span>
        </button>
        <button onClick={() => openTab('/references/station-configurations', 'Справочник: Конфигурации станций', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Конфигурации станций</span>
        </button>
        <button onClick={() => openTab('/references/stations', 'Справочник: Станции', null)} style={buttonStyle} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5559E0'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#666EFE'; }}>
          <span style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: '400', whiteSpace: 'nowrap' }}>Станции</span>
        </button>
      </div>
    </div>
  );
};

export default ReferencesPage;