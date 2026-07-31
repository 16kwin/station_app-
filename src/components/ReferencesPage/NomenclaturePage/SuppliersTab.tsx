// SuppliersTab.tsx — ПОЛНЫЙ ФАЙЛ (выделение строк, удаление выделенных, кнопки button1/button4/button5)
import React, { useState, useRef, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import CatalogSelectPopup from './CatalogSelectPopup';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { CommonProps } from './NomenclatureCreatePage';
import PostIcon from '../../../assets/References/NomenclatureCreatePage/Post.svg';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';

interface SupplyItem {
  uid: string;
  materialUid: string;
  supplierUid: string;
  supplierName: string;
  supplyDate: string;
  documentName: string;
  filePath: string;
  originalName: string;
  fileUrl: string;
}

const SuppliersTab: React.FC<CommonProps> = (props) => {
  const { uid, isEdit } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  const [newSupplierUid, setNewSupplierUid] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplyDate, setNewSupplyDate] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; supplyUid: string; supplierName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const smallButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const cs: React.CSSProperties = { position: 'absolute', top: 164, left: 30, right: 30, bottom: 111 };

  const TABLE_WIDTH = 1660;
  const TABLE_HEIGHT = 464;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 7;

  const COL_NAME = 50;
  const COL_DATE = 640;
  const COL_DOCUMENT = 1200;

  const fetchSupplies = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureSupply(uid));
      setSupplies((res.data || []).map((s: any) => ({
        ...s,
        fileUrl: s.fileUrl ? ConstantInfo.fileDir + s.fileUrl.replace(/^\//, '') : null,
      })));
    } catch (e) {
      console.error('Ошибка загрузки поставок:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uid && isEdit) fetchSupplies();
  }, [uid, isEdit]);

  useEffect(() => {
    const handler = () => { if (uid) fetchSupplies(); };
    window.addEventListener('refreshSupplies', handler);
    return () => window.removeEventListener('refreshSupplies', handler);
  }, [uid]);

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

  useEffect(() => {
    const t = setTimeout(checkScroll, 100);
    return () => clearTimeout(t);
  }, [supplies]);

  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return;
    checkScroll();
    c.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(c);
    return () => {
      c.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const toggleSelect = (supplyUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(supplyUid)) next.delete(supplyUid);
        else next.add(supplyUid);
        return next;
      });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = supplies.map(s => s.uid);
      const lastIdx = allIds.indexOf(lastSelectedId);
      const currentIdx = allIds.indexOf(supplyUid);
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
      if (selectedIds.has(supplyUid) && selectedIds.size === 1) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set([supplyUid]));
      }
    }
    setLastSelectedId(supplyUid);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      for (const supplyUid of selectedIds) {
        await AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteSupply(supplyUid));
      }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchSupplies();
    } catch (e) {
      console.error('Ошибка удаления поставок:', e);
    }
  };

  const handleAddClick = () => {
    setNewSupplierUid('');
    setNewSupplierName('');
    setNewSupplyDate(new Date().toISOString().slice(0, 16));
    setNewDocumentName('');
    setSelectedFile(null);
    setShowAddPopup(true);
  };

  const handleAddSubmit = async () => {
    if (!uid || !newSupplierUid) return;
    setIsAdding(true);
    try {
      const fd = new FormData();
      fd.append('supplierUid', newSupplierUid);
      if (newSupplyDate) fd.append('supplyDate', newSupplyDate + ':00');
      if (newDocumentName.trim()) fd.append('documentName', newDocumentName.trim());
      if (selectedFile) fd.append('file', selectedFile);
      await AxiosService.post(ConstantInfo.restApiNomenclatureSupply(uid), fd);
      await fetchSupplies();
      setShowAddPopup(false);
      window.dispatchEvent(new CustomEvent('refreshSupplies'));
    } catch (e) {
      console.error('Ошибка добавления поставщика:', e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, supplyUid: string, supplierName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.has(supplyUid)) {
      setSelectedIds(new Set([supplyUid]));
    }
    setContextMenu({ x: e.clientX, y: e.clientY, supplyUid, supplierName });
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить привязку поставщика?')) {
      setContextMenu(null);
      return;
    }
    const uidsToDelete = selectedIds.has(contextMenu.supplyUid) ? selectedIds : new Set([contextMenu.supplyUid]);
    Promise.all(Array.from(uidsToDelete).map(uid => 
      AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteSupply(uid))
    ))
      .then(() => {
        setSelectedIds(new Set());
        fetchSupplies();
      })
      .catch(e => console.error('Ошибка удаления:', e));
    setContextMenu(null);
  };

  const popupFieldStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid rgba(102, 110, 254, 0.15)',
    backgroundColor: '#FFFFFF',
    display: 'flex', alignItems: 'center',
    paddingLeft: 14, paddingRight: 13,
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', boxSizing: 'border-box',
  };

  const totalRows = Math.max(supplies.length, VISIBLE_ROWS);

  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0;
    const isLast = index === supplies.length - 1;
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
        <div style={{ position: 'absolute', top: 34, left: 40, display: 'flex', gap: 15 }}>
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
        <div style={{ position: 'absolute', top: 83, left: 25, display: 'flex', gap: 10 }}>
          <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Шапка */}
            <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НАИМЕНОВАНИЕ ПОСТАВЩИКА</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА ПОСЛЕДНЕЙ ПОСТАВКИ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DOCUMENT }}>ДОКУМЕНТ ПОСТАВКИ</span>
            </div>
            
            {/* Тело таблицы */}
            <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div style={{ minWidth: TABLE_WIDTH }}>
                {isLoading ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF' }}>Загрузка...</span>
                  </div>
                ) : (
                  <>
                    {Array.from({ length: totalRows }).map((_, index) => {
                      const supply = supplies[index];
                      const isRealData = !!supply;
                      const isSelected = supply && selectedIds.has(supply.uid);

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
                          key={supply.uid} 
                          onClick={(e) => toggleSelect(supply.uid, e)}
                          onContextMenu={(e) => handleContextMenu(e, supply.uid, supply.supplierName)}
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
                          <img src={PostIcon} alt="" style={{ position: 'absolute', left: 21, width: 20, height: 20, flexShrink: 0 }} />
                          <span style={{ position: 'absolute', left: COL_NAME, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_DATE - COL_NAME - 30 }}>
                            {supply.supplierName}
                          </span>
                          <span style={{ position: 'absolute', left: COL_DATE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_DOCUMENT - COL_DATE - 30 }}>
                            {formatDate(supply.supplyDate)}
                          </span>
                          <span style={{ position: 'absolute', left: COL_DOCUMENT, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_DOCUMENT - 60 }}>
                            {supply.fileUrl ? (
                              <a href={supply.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#666EFE', textDecoration: 'none' }}>
                                {supply.originalName || supply.documentName || 'Документ'}
                              </a>
                            ) : (supply.documentName || '-')}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Скроллбар */}
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
          <button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button>
        </div>
      )}

      {/* Попап добавления поставщика */}
      {showAddPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddPopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Добавление поставщика</h3>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Поставщик</label>
              <div onClick={() => setShowSupplierPopup(true)} style={{ ...popupFieldStyle, color: newSupplierName ? '#666EFE' : '#9CA3AF' }}>
                <span>{newSupplierName || 'Выберите поставщика'}</span>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Дата поставки</label>
              <input
                type="datetime-local"
                value={newSupplyDate}
                onChange={e => setNewSupplyDate(e.target.value)}
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название документа</label>
              <input
                type="text"
                value={newDocumentName}
                onChange={e => setNewDocumentName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setShowAddPopup(false); }}
                placeholder="Введите название документа"
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Файл документа</label>
              <div 
                onClick={() => fileInputRef.current?.click()} 
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px dashed rgba(102, 110, 254, 0.3)', backgroundColor: '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="9" y1="3" x2="9" y2="15" stroke="#666EFE" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="9" x2="15" y2="9" stroke="#666EFE" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: selectedFile ? '#666EFE' : '#9CA3AF' }}>
                  {selectedFile ? selectedFile.name : 'Выберите файл'}
                </span>
              </div>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleAddSubmit} disabled={!newSupplierUid || isAdding} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: newSupplierUid && !isAdding ? '#666EFE' : '#BCC8FF', cursor: newSupplierUid && !isAdding ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isAdding ? 'Добавление...' : 'Добавить'}</button>
              <button onClick={() => setShowAddPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
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

      <CatalogSelectPopup
        isOpen={showSupplierPopup}
        onClose={() => setShowSupplierPopup(false)}
        onSelect={(id, name) => {
          setNewSupplierUid(id);
          setNewSupplierName(name);
          setShowSupplierPopup(false);
        }}
        popupType="supplier"
      />
    </div>
  );
};

export default SuppliersTab;