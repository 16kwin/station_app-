// IntegrationTab.tsx — ПОЛНЫЙ ФАЙЛ (выделение строк, удаление выделенных, кнопки button1/button4/button5)
import React, { useState, useRef, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { CommonProps } from './NomenclatureCreatePage';
import InterIcon from '../../../assets/References/NomenclatureCreatePage/Inter.svg';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';

interface IntegrationItem {
  uid: string;
  materialUid: string;
  event: string;
  exchangeType: string;
  direction: string;
  protocol: string;
  targetSystem: string;
  createdAt: string;
}

const EXCHANGE_TYPES = ['Внутренний', 'Внешний'];
const DIRECTIONS = ['Исходящий', 'Входящий'];
const PROTOCOLS = ['WebSocket', 'REST'];
const TARGET_SYSTEMS = ['1С:Предприятие', 'SAP', 'Oracle EBS'];

const IntegrationTab: React.FC<CommonProps> = (props) => {
  const { uid, isEdit } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newExchangeType, setNewExchangeType] = useState(EXCHANGE_TYPES[0]);
  const [newDirection, setNewDirection] = useState(DIRECTIONS[0]);
  const [newProtocol, setNewProtocol] = useState(PROTOCOLS[0]);
  const [newTargetSystem, setNewTargetSystem] = useState(TARGET_SYSTEMS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editIntegrationUid, setEditIntegrationUid] = useState('');
  const [editExchangeType, setEditExchangeType] = useState(EXCHANGE_TYPES[0]);
  const [editDirection, setEditDirection] = useState(DIRECTIONS[0]);
  const [editProtocol, setEditProtocol] = useState(PROTOCOLS[0]);
  const [editTargetSystem, setEditTargetSystem] = useState(TARGET_SYSTEMS[0]);
  const [isEditing, setIsEditing] = useState(false);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; integrationUid: string; exchangeType: string; direction: string; protocol: string; targetSystem: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const smallButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const cs: React.CSSProperties = { position: 'absolute', top: 164, left: 30, right: 30, bottom: 111 };

  const TABLE_WIDTH = 1660;
  const TABLE_HEIGHT = 464;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 7;

  const COL_DATE = 50;
  const COL_EVENT = 280;
  const COL_EXCHANGE = 728;
  const COL_DIRECTION = 939;
  const COL_PROTOCOL = 1170;
  const COL_SYSTEM = 1388;

  const fetchIntegrations = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureIntegrations(uid));
      setIntegrations(res.data || []);
    } catch (e) {
      console.error('Ошибка загрузки интеграций:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uid && isEdit) fetchIntegrations();
  }, [uid, isEdit]);

  useEffect(() => {
    if (!contextMenu) return;
    const h = () => setContextMenu(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [contextMenu]);

  const checkScroll = () => {
    const c = scrollContainerRef.current;
    if (c) setHasScroll(c.scrollHeight > c.clientHeight);
  };

  useEffect(() => { const t = setTimeout(checkScroll, 100); return () => clearTimeout(t); }, [integrations]);
  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return;
    checkScroll();
    c.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(c);
    return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const toggleSelect = (itemUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(itemUid)) next.delete(itemUid);
        else next.add(itemUid);
        return next;
      });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = integrations.map(i => i.uid);
      const lastIdx = allIds.indexOf(lastSelectedId);
      const currentIdx = allIds.indexOf(itemUid);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastIdx, currentIdx);
        const end = Math.max(lastIdx, currentIdx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => {
          const next = new Set(prev);
          rangeIds.forEach(id => next.add(id));
          return next;
        });
      }
    } else {
      if (selectedIds.has(itemUid) && selectedIds.size === 1) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set([itemUid]));
      }
    }
    setLastSelectedId(itemUid);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      for (const itemUid of selectedIds) {
        await AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteIntegration(itemUid));
      }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchIntegrations();
    } catch (e) {
      console.error('Ошибка удаления интеграций:', e);
    }
  };

  const handleAddClick = () => {
    setNewExchangeType(EXCHANGE_TYPES[0]);
    setNewDirection(DIRECTIONS[0]);
    setNewProtocol(PROTOCOLS[0]);
    setNewTargetSystem(TARGET_SYSTEMS[0]);
    setShowAddPopup(true);
  };

  const handleAddSubmit = async () => {
    if (!uid) return;
    setIsAdding(true);
    try {
      await AxiosService.post(ConstantInfo.restApiNomenclatureIntegrations(uid), {
        exchangeType: newExchangeType,
        direction: newDirection,
        protocol: newProtocol,
        targetSystem: newTargetSystem,
      });
      await fetchIntegrations();
      setShowAddPopup(false);
    } catch (e) {
      console.error('Ошибка добавления интеграции:', e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: IntegrationItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.has(item.uid)) {
      setSelectedIds(new Set([item.uid]));
    }
    setContextMenu({ 
      x: e.clientX, y: e.clientY, 
      integrationUid: item.uid,
      exchangeType: item.exchangeType,
      direction: item.direction,
      protocol: item.protocol,
      targetSystem: item.targetSystem,
    });
  };

  const handleContextEdit = () => {
    if (!contextMenu) return;
    setEditIntegrationUid(contextMenu.integrationUid);
    setEditExchangeType(contextMenu.exchangeType || EXCHANGE_TYPES[0]);
    setEditDirection(contextMenu.direction || DIRECTIONS[0]);
    setEditProtocol(contextMenu.protocol || PROTOCOLS[0]);
    setEditTargetSystem(contextMenu.targetSystem || TARGET_SYSTEMS[0]);
    setShowEditPopup(true);
    setContextMenu(null);
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить запись интеграции?')) {
      setContextMenu(null);
      return;
    }
    const uidsToDelete = selectedIds.has(contextMenu.integrationUid) ? selectedIds : new Set([contextMenu.integrationUid]);
    Promise.all(Array.from(uidsToDelete).map(uid => 
      AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteIntegration(uid))
    ))
      .then(() => {
        setSelectedIds(new Set());
        fetchIntegrations();
      })
      .catch(e => console.error('Ошибка удаления интеграции:', e));
    setContextMenu(null);
  };

  const handleEditSubmit = async () => {
    if (!uid || !editIntegrationUid) return;
    setIsEditing(true);
    try {
      await AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteIntegration(editIntegrationUid));
      await AxiosService.post(ConstantInfo.restApiNomenclatureIntegrations(uid), {
        exchangeType: editExchangeType,
        direction: editDirection,
        protocol: editProtocol,
        targetSystem: editTargetSystem,
      });
      await fetchIntegrations();
      setShowEditPopup(false);
    } catch (e) {
      console.error('Ошибка редактирования интеграции:', e);
    } finally {
      setIsEditing(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid rgba(102, 110, 254, 0.15)',
    paddingLeft: 12, paddingRight: 12,
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
    color: '#2D4059', outline: 'none', boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  };

  const totalRows = Math.max(integrations.length, VISIBLE_ROWS);

  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0;
    const isLast = index === integrations.length - 1;
    return {
      borderTop: isFirst ? 'none' : '0.5px solid #E5ECF5',
      borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5',
    };
  };

  const contextMenuButtonStyle: React.CSSProperties = {
    width: 174, height: 40, border: 'none', background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', paddingLeft: 20,
    fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059',
  };

  return (
    <div style={cs}>
      <div style={{ ...blockStyle, width: 1740, height: 565, position: 'relative' }}>
        {/* Кнопки */}
        <div style={{ position: 'absolute', top: 14, left: 40, display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}>
            <img src={Button1} alt="" style={{ width: 18, height: 18 }} />
          </button>
          <button onClick={handleAddClick} style={smallButtonStyle}>
            <img src={Button4} alt="" style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={handleDeleteSelected} style={{ ...smallButtonStyle, opacity: selectedIds.size > 0 ? 1 : 0.5, cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed' }}>
            <img src={Button5} alt="" style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Таблица */}
        <div style={{ position: 'absolute', top: 68, left: 40, display: 'flex', gap: 10 }}>
          <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА И ВРЕМЯ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_EVENT }}>СОБЫТИЕ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_EXCHANGE }}>ТИП ОБМЕНА</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DIRECTION }}>НАПРАВЛЕНИЕ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_PROTOCOL }}>ПРОТОКОЛ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_SYSTEM }}>ОБМЕН С СИСТЕМОЙ</span>
            </div>
            
            <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div style={{ minWidth: TABLE_WIDTH }}>
                {isLoading ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF' }}>Загрузка...</span>
                  </div>
                ) : (
                  <>
                    {Array.from({ length: totalRows }).map((_, index) => {
                      const item = integrations[index];
                      const isRealData = !!item;
                      const isSelected = item && selectedIds.has(item.uid);

                      if (!isRealData) {
                        return (
                          <div 
                            key={`empty-${index}`} 
                            style={{ 
                              height: ROW_HEIGHT, 
                              backgroundColor: '#FFFFFF', 
                              boxSizing: 'border-box',
                              display: 'flex', 
                              alignItems: 'center',
                              borderTop: '0.5px solid #E5ECF5',
                              borderBottom: '0.5px solid #E5ECF5',
                            }} 
                          />
                        );
                      }

                      return (
                        <div 
                          key={item.uid} 
                          onClick={(e) => toggleSelect(item.uid, e)}
                          onContextMenu={(e) => handleContextMenu(e, item)}
                          style={{ 
                            height: ROW_HEIGHT, 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: isSelected ? '#DEEEFF' : '#FFFFFF', 
                            position: 'relative', 
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                            userSelect: 'none',
                            ...getRowSeparator(index, true),
                          }}
                        >
                          <span style={{ position: 'absolute', left: COL_DATE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_EVENT - COL_DATE - 20 }}>
                            {formatDate(item.createdAt)}
                          </span>
                          
                          <div style={{ position: 'absolute', left: COL_EVENT, display: 'flex', alignItems: 'center', gap: 12, maxWidth: COL_EXCHANGE - COL_EVENT - 20, overflow: 'hidden' }}>
                            <img src={InterIcon} alt="" style={{ width: 15, height: 18, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.event}
                            </span>
                          </div>

                          <span style={{ position: 'absolute', left: COL_EXCHANGE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_DIRECTION - COL_EXCHANGE - 20 }}>
                            {item.exchangeType}
                          </span>
                          <span style={{ position: 'absolute', left: COL_DIRECTION, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_PROTOCOL - COL_DIRECTION - 20 }}>
                            {item.direction}
                          </span>
                          <span style={{ position: 'absolute', left: COL_PROTOCOL, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_SYSTEM - COL_PROTOCOL - 20 }}>
                            {item.protocol}
                          </span>
                          <span style={{ position: 'absolute', left: COL_SYSTEM, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_SYSTEM - 40 }}>
                            {item.targetSystem}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {hasScroll && (
            <div style={{ width: 10, height: TABLE_HEIGHT, paddingTop: HEADER_HEIGHT }}>
              <CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} />
            </div>
          )}
        </div>
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          <button style={contextMenuButtonStyle} onClick={handleContextEdit}>Редактировать</button>
          <button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button>
        </div>
      )}

      {/* Попап добавления интеграции */}
      {showAddPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddPopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Добавление интеграции</h3>

            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Тип обмена</label><select value={newExchangeType} onChange={e => setNewExchangeType(e.target.value)} style={selectStyle}>{EXCHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Направление</label><select value={newDirection} onChange={e => setNewDirection(e.target.value)} style={selectStyle}>{DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Протокол</label><select value={newProtocol} onChange={e => setNewProtocol(e.target.value)} style={selectStyle}>{PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Обмен с системой</label><select value={newTargetSystem} onChange={e => setNewTargetSystem(e.target.value)} style={selectStyle}>{TARGET_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleAddSubmit} disabled={isAdding} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: !isAdding ? '#666EFE' : '#BCC8FF', cursor: !isAdding ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isAdding ? 'Добавление...' : 'Добавить'}</button>
              <button onClick={() => setShowAddPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Попап редактирования интеграции */}
      {showEditPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditPopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Редактирование интеграции</h3>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Тип обмена</label><select value={editExchangeType} onChange={e => setEditExchangeType(e.target.value)} style={selectStyle}>{EXCHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Направление</label><select value={editDirection} onChange={e => setEditDirection(e.target.value)} style={selectStyle}>{DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Протокол</label><select value={editProtocol} onChange={e => setEditProtocol(e.target.value)} style={selectStyle}>{PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Обмен с системой</label><select value={editTargetSystem} onChange={e => setEditTargetSystem(e.target.value)} style={selectStyle}>{TARGET_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleEditSubmit} disabled={isEditing} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: !isEditing ? '#666EFE' : '#BCC8FF', cursor: !isEditing ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isEditing ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => setShowEditPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Попап подтверждения удаления */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Подтверждение удаления</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Вы уверены, что хотите удалить выбранные элементы?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={confirmDeleteSelected} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: '#FF3052', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Удалить</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationTab;