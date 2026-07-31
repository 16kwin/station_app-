// SupplierAssortmentTab.tsx — ПОЛНЫЙ ФАЙЛ (исправлены методы удаления)
import React, { useState, useRef, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import CatalogSelectPopup from '../NomenclaturePage/CatalogSelectPopup';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { CommonSupplierProps } from './SupplierCreatePage';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';

interface AssortmentItem {
  uid: string;
  name: string;
  article: string;
  code: number | null;
  typeMainName?: string;
}

const SupplierAssortmentTab: React.FC<CommonSupplierProps> = (props) => {
  const { uid, isEdit } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [items, setItems] = useState<AssortmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showAddPopup, setShowAddPopup] = useState(false);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemUid: string; itemName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const smallButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const cs: React.CSSProperties = { position: 'absolute', top: 164, left: 30, right: 30, bottom: 111 };

  const TABLE_WIDTH = 1660;
  const TABLE_HEIGHT = 464;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 7;

  const COL_CODE = 50;
  const COL_NAME = 280;
  const COL_ARTICLE = 700;
  const COL_GROUP = 1050;

  const fetchAssortment = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiSupplierAssortment(uid));
      setItems(res.data || []);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (uid && isEdit) fetchAssortment(); }, [uid, isEdit]);
  useEffect(() => { if (!contextMenu) return; const h = () => setContextMenu(null); document.addEventListener('click', h); return () => document.removeEventListener('click', h); }, [contextMenu]);

  const checkScroll = () => { const c = scrollContainerRef.current; if (c) setHasScroll(c.scrollHeight > c.clientHeight); };
  useEffect(() => { const t = setTimeout(checkScroll, 100); return () => clearTimeout(t); }, [items]);
  useEffect(() => { const c = scrollContainerRef.current; if (!c) return; checkScroll(); c.addEventListener('scroll', checkScroll); const ro = new ResizeObserver(checkScroll); ro.observe(c); return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); }; }, []);

  const toggleSelect = (itemUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => { const next = new Set(prev); if (next.has(itemUid)) next.delete(itemUid); else next.add(itemUid); return next; });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = items.map(i => i.uid);
      const lastIdx = allIds.indexOf(lastSelectedId);
      const currentIdx = allIds.indexOf(itemUid);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastIdx, currentIdx); const end = Math.max(lastIdx, currentIdx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => { const next = new Set(prev); rangeIds.forEach(id => next.add(id)); return next; });
      }
    } else {
      if (selectedIds.has(itemUid) && selectedIds.size === 1) setSelectedIds(new Set());
      else setSelectedIds(new Set([itemUid]));
    }
    setLastSelectedId(itemUid);
  };

  const handleDeleteSelected = () => { if (selectedIds.size === 0) return; setShowDeleteConfirm(true); };

  const confirmDeleteSelected = async () => {
    try {
      for (const itemUid of selectedIds) {
        await AxiosService.delete(ConstantInfo.restApiSupplierDeleteDelivery(itemUid));
      }
      setSelectedIds(new Set()); setShowDeleteConfirm(false); await fetchAssortment();
    } catch (e) { console.error(e); }
  };

  const handleAddMaterial = async (materialUid: string, _materialName: string) => {
    if (!uid) return;
    try {
      const fd = new FormData(); fd.append('materialUid', materialUid);
      fd.append('supplyDate', new Date().toISOString().slice(0, 16) + ':00');
      await AxiosService.post(ConstantInfo.restApiSupplierDeliveries(uid), fd);
      await fetchAssortment(); setShowAddPopup(false);
    } catch (e) { console.error(e); }
  };

  const handleContextMenu = (e: React.MouseEvent, itemUid: string, itemName: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedIds.has(itemUid)) setSelectedIds(new Set([itemUid]));
    setContextMenu({ x: e.clientX, y: e.clientY, itemUid, itemName });
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить позицию ассортимента?')) { setContextMenu(null); return; }
    const uidsToDelete = selectedIds.has(contextMenu.itemUid) ? selectedIds : new Set([contextMenu.itemUid]);
    Promise.all(Array.from(uidsToDelete).map(uid => AxiosService.delete(ConstantInfo.restApiSupplierDeleteDelivery(uid))))
      .then(() => { setSelectedIds(new Set()); fetchAssortment(); }).catch(e => console.error(e));
    setContextMenu(null);
  };

  const totalRows = Math.max(items.length, VISIBLE_ROWS);

  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0; const isLast = index === items.length - 1;
    return { borderTop: isFirst ? 'none' : '0.5px solid #E5ECF5', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' };
  };

  const contextMenuButtonStyle: React.CSSProperties = { width: 174, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' };

  return (
    <div style={cs}>
      <div style={{ ...blockStyle, width: 1740, height: 565, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, left: 40, display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Button1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button onClick={() => setShowAddPopup(true)} style={smallButtonStyle}><img src={Button4} alt="" style={{ width: 14, height: 14 }} /></button>
          <button onClick={handleDeleteSelected} style={{ ...smallButtonStyle, opacity: selectedIds.size > 0 ? 1 : 0.5, cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed' }}><img src={Button5} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ position: 'absolute', top: 68, left: 40, display: 'flex', gap: 10 }}>
          <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_CODE }}>КОД</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НАИМЕНОВАНИЕ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_ARTICLE }}>АРТИКУЛ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_GROUP }}>ГРУППА УЧЕТА</span>
            </div>
            <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div style={{ minWidth: TABLE_WIDTH }}>
                {isLoading ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF' }}>Загрузка...</span></div> : (
                  <>
                    {Array.from({ length: totalRows }).map((_, index) => {
                      const item = items[index]; const isRealData = !!item; const isSelected = item && selectedIds.has(item.uid);
                      if (!isRealData) return (<div key={`empty-${index}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} />);
                      return (
                        <div key={item.uid} onClick={(e) => toggleSelect(item.uid, e)} onContextMenu={(e) => handleContextMenu(e, item.uid, item.name)} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: isSelected ? '#DEEEFF' : '#FFFFFF', position: 'relative', boxSizing: 'border-box', cursor: 'pointer', userSelect: 'none', ...getRowSeparator(index, true) }}>
                          <span style={{ position: 'absolute', left: COL_CODE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', maxWidth: COL_NAME - COL_CODE - 20 }}>{item.code || '—'}</span>
                          <span style={{ position: 'absolute', left: COL_NAME, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_ARTICLE - COL_NAME - 30 }}>{item.name}</span>
                          <span style={{ position: 'absolute', left: COL_ARTICLE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_GROUP - COL_ARTICLE - 30 }}>{item.article || '—'}</span>
                          <span style={{ position: 'absolute', left: COL_GROUP, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_GROUP - 60 }}>{item.typeMainName || '—'}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
          {hasScroll && <div style={{ width: 10, height: TABLE_HEIGHT, paddingTop: HEADER_HEIGHT }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>}
        </div>
      </div>

      {contextMenu && (<div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}><button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button></div>)}

      {showDeleteConfirm && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}><div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Подтверждение удаления</h3><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Вы уверены, что хотите удалить выбранные элементы?</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={confirmDeleteSelected} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: '#FF3052', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Удалить</button><button onClick={() => setShowDeleteConfirm(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}

      <CatalogSelectPopup isOpen={showAddPopup} onClose={() => setShowAddPopup(false)} onSelect={handleAddMaterial} popupType="analogSelect" />
    </div>
  );
};

export default SupplierAssortmentTab;