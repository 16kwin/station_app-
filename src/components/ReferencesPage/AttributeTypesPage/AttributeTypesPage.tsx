// AttributeTypesPage.tsx — ПОЛНЫЙ ФАЙЛ (единый стиль)
import React, { useRef, useState, useEffect } from 'react';
import { useTabs } from '../../../context/TabContext';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import Icon1 from '../../../assets/References/Icon1.svg';
import Icon2 from '../../../assets/References/Icon2.svg';
import Icon3 from '../../../assets/References/Icon3.svg';
import Icon4 from '../../../assets/References/Icon4.svg';
import Icon7 from '../../../assets/References/Icon7.svg';
import Icon8 from '../../../assets/References/Icon8.svg';
import Icon9 from '../../../assets/References/Icon9.svg';
import Icon10 from '../../../assets/References/Icon10.svg';
import Icon19 from '../../../assets/References/Icon19.svg';
import Popup4 from '../../../assets/References/popup4.svg';

interface AttributeTypeItem {
  uid: string;
  name: string;
  designation: string;
}

const AttributeTypesPage = () => {
  const { activeTabId } = useTabs();
  const tabIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [data, setData] = useState<AttributeTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editItem, setEditItem] = useState<AttributeTypeItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; uid: string; name: string } | null>(null);

  const TABLE_WIDTH = 1720;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 10;
  const TABLE_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS + HEADER_HEIGHT;
  const COL_DESIGNATION = 700;

  useEffect(() => { tabIdRef.current = activeTabId; }, []);

  const fetchData = async () => {
    try {
      const response = await AxiosService.get(ConstantInfo.restApiNomenclatureTypeAttributes);
      setData(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (activeTabId && activeTabId === tabIdRef.current && data.length > 0) fetchData();
  }, [activeTabId]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setHasVerticalScroll(container.scrollHeight > container.clientHeight);
    setHasHorizontalScroll(container.scrollWidth > container.clientWidth);
  };

  useEffect(() => { const timer = setTimeout(checkScroll, 350); return () => clearTimeout(timer); }, [data]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(container);
    return () => { container.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const toggleSelectItem = (uid: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  const isAllSelected = data.length > 0 && data.every(item => selectedIds.has(item.uid));
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(item => item.uid)));
  };

  const handleContextMenu = (e: React.MouseEvent, uid: string, name: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, uid, name });
  };

  const handleCreateClick = () => {
    setFormName('');
    setFormDesignation('');
    setEditItem(null);
    setShowCreatePopup(true);
  };

  const handleCreateSubmit = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      await AxiosService.post(ConstantInfo.restApiNomenclatureTypeAttributes, {
        name: formName.trim(),
        designation: formDesignation.trim(),
      });
      await fetchData();
      setShowCreatePopup(false);
    } catch (error) {
      console.error('Ошибка создания:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    if (!contextMenu) return;
    const item = data.find(d => d.uid === contextMenu.uid);
    if (item) {
      setEditItem(item);
      setFormName(item.name);
      setFormDesignation(item.designation || '');
      setShowEditPopup(true);
    }
    setContextMenu(null);
  };

  const handleEditSubmit = async () => {
    if (!editItem || !formName.trim()) return;
    setIsSaving(true);
    try {
      await AxiosService.patch(`${ConstantInfo.restApiNomenclatureTypeAttributes}/${editItem.uid}`, {
        name: formName.trim(),
        designation: formDesignation.trim(),
      });
      await fetchData();
      setShowEditPopup(false);
      setEditItem(null);
    } catch (error) {
      console.error('Ошибка редактирования:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      for (const uid of selectedIds) {
        await AxiosService.delete(`${ConstantInfo.restApiNomenclatureTypeAttributes}/${uid}`);
      }
      await fetchData();
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    setSelectedIds(new Set([contextMenu.uid]));
    setContextMenu(null);
    setTimeout(() => setShowDeleteConfirm(true), 50);
  };

  const emptyRows = Math.max(0, VISIBLE_ROWS - data.length);

  const smallButtonStyle: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, flexShrink: 0,
  };

  const mediumButtonStyle: React.CSSProperties = {
    height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0,
  };

  const EmptySquare = ({ isSelected, onClick }: { isSelected: boolean; onClick: (e: React.MouseEvent) => void }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick(e); }} style={{ width: 18, height: 18, borderRadius: 2, border: isSelected ? 'none' : '2px solid #2D4059', opacity: isSelected ? 1 : 0.5, flexShrink: 0, boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isSelected && <img src={Icon19} alt="" style={{ width: 18, height: 18 }} />}
    </div>
  );

  const contextMenuButtonStyle: React.CSSProperties = {
    width: 174, height: 40, border: 'none', background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', paddingLeft: 20,
    fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid rgba(102, 110, 254, 0.15)',
    paddingLeft: 12, paddingRight: 12,
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
    color: '#2D4059', outline: 'none', boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  };

  if (isLoading) {
    return (
      <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFC' }}>
      <div style={{ position: 'absolute', top: 35, left: 60 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>Справочник: Виды характеристик</h1>
      </div>

      <div style={{ position: 'absolute', top: 99, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
          <button style={smallButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ position: 'absolute', left: 586, display: 'flex', gap: 15 }}>
          <button style={{ ...mediumButtonStyle, width: 124 }} onClick={handleCreateClick}>
            <img src={Icon4} alt="" style={{ width: 16, height: 16, marginLeft: 12 }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 15 }}>Создать</span>
          </button>
          <button style={smallButtonStyle} onClick={handleDeleteClick}><img src={Icon7} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Icon8} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon9} alt="" style={{ width: 14, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon10} alt="" style={{ width: 18, height: 16 }} /></button>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 154, left: 40 }}>
        <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 40, position: 'relative' }}>
            <EmptySquare isSelected={isAllSelected} onClick={toggleSelectAll} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', marginLeft: 47 }}>НАИМЕНОВАНИЕ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DESIGNATION }}>ОБОЗНАЧЕНИЕ</span>
          </div>
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {data.map(item => {
              const isSelected = selectedIds.has(item.uid);
              return (
                <div key={item.uid} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: isSelected ? '#EDF6FF' : '#FFFFFF', cursor: 'pointer', position: 'relative', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} onContextMenu={(e) => handleContextMenu(e, item.uid, item.name)}>
                  <div style={{ paddingLeft: 20, display: 'flex', alignItems: 'center' }}>
                    <EmptySquare isSelected={isSelected} onClick={() => toggleSelectItem(item.uid)} />
                  </div>
                  <img src={Popup4} alt="" style={{ width: 20, height: 20, flexShrink: 0, marginLeft: 19 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', marginLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_DESIGNATION - 120 }}>{item.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_DESIGNATION, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_DESIGNATION - 60 }}>{item.designation || '—'}</span>
                </div>
              );
            })}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 20, borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }}><EmptySquare isSelected={false} onClick={() => {}} /></div>
            ))}
          </div>
        </div>
        {hasVerticalScroll && (<div style={{ position: 'absolute', right: -25, top: HEADER_HEIGHT, height: TABLE_HEIGHT - HEADER_HEIGHT, width: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>)}
        {hasHorizontalScroll && (<div style={{ position: 'absolute', bottom: -21, left: 0, width: TABLE_WIDTH, height: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="horizontal" trackSize={TABLE_WIDTH} /></div>)}
      </div>

      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          <button style={contextMenuButtonStyle} onClick={handleEditClick}>Редактировать</button>
          <button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button>
        </div>
      )}

      {showCreatePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreatePopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Создание вида характеристики</h3>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateSubmit(); else if (e.key === 'Escape') setShowCreatePopup(false); }} placeholder="Введите название" autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Обозначение</label>
              <input type="text" value={formDesignation} onChange={e => setFormDesignation(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateSubmit(); else if (e.key === 'Escape') setShowCreatePopup(false); }} placeholder="Введите обозначение" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowCreatePopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
              <button onClick={handleCreateSubmit} disabled={isSaving || !formName.trim()} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: formName.trim() && !isSaving ? '#666EFE' : '#BCC8FF', cursor: formName.trim() && !isSaving ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isSaving ? 'Сохранение...' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditPopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Редактирование вида характеристики</h3>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleEditSubmit(); else if (e.key === 'Escape') setShowEditPopup(false); }} placeholder="Введите название" autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Обозначение</label>
              <input type="text" value={formDesignation} onChange={e => setFormDesignation(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleEditSubmit(); else if (e.key === 'Escape') setShowEditPopup(false); }} placeholder="Введите обозначение" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowEditPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
              <button onClick={handleEditSubmit} disabled={isSaving || !formName.trim()} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: formName.trim() && !isSaving ? '#666EFE' : '#BCC8FF', cursor: formName.trim() && !isSaving ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Подтверждение удаления</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Вы уверены, что хотите удалить выбранные элементы?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
              <button onClick={confirmDelete} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: '#FF3052', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributeTypesPage;