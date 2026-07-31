// SupplierRatingTab.tsx — ПОЛНЫЙ ФАЙЛ (в стиле RatingTab)
import React, { useState, useRef, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { CommonSupplierProps } from './SupplierCreatePage';
import OtzivIcon from '../../../assets/References/NomenclatureCreatePage/Otziv.svg';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';

interface RatingItem {
  uid: string;
  supplierUid: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
}

const SupplierRatingTab: React.FC<CommonSupplierProps> = (props) => {
  const { uid, isEdit } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editRatingUid, setEditRatingUid] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [showViewPopup, setShowViewPopup] = useState(false);
  const [viewComment, setViewComment] = useState('');
  const [viewAuthor, setViewAuthor] = useState('');

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; ratingUid: string; rating: number; comment: string; author: string } | null>(null);
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
  const COL_NAME = 290;
  const COL_RATING = 763;
  const COL_AUTHOR = 1155;

  const StarRatingSmall = ({ value, size = 18 }: { value: number; size?: number }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fillPercent = Math.min(100, Math.max(0, (value - i + 1) * 100));
      stars.push(
        <div key={i} style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="M10 1L12.39 6.53L18.18 7.27L13.92 11.37L15.09 17.23L10 14.25L4.91 17.23L6.08 11.37L1.82 7.27L7.61 6.53L10 1Z" fill="#DBDBDB" stroke="#DBDBDB" strokeWidth="1"/>
          </svg>
          {fillPercent > 0 && (
            <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0, clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}>
              <path d="M10 1L12.39 6.53L18.18 7.27L13.92 11.37L15.09 17.23L10 14.25L4.91 17.23L6.08 11.37L1.82 7.27L7.61 6.53L10 1Z" fill="#666EFE" stroke="#666EFE" strokeWidth="1"/>
            </svg>
          )}
        </div>
      );
    }
    return <div style={{ display: 'flex', gap: 8 }}>{stars}</div>;
  };

  const fetchRatings = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const [ratingsRes, avgRes] = await Promise.all([
        AxiosService.get(ConstantInfo.restApiSupplierRatings(uid)),
        AxiosService.get(ConstantInfo.restApiSupplierRatingsAverage(uid)),
      ]);
      setRatings(ratingsRes.data || []);
      setAverageRating(Math.round((avgRes.data || 0) * 10) / 10);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (uid && isEdit) fetchRatings(); }, [uid, isEdit]);
  useEffect(() => { if (!contextMenu) return; const h = () => setContextMenu(null); document.addEventListener('click', h); return () => document.removeEventListener('click', h); }, [contextMenu]);

  const checkScroll = () => { const c = scrollContainerRef.current; if (c) setHasScroll(c.scrollHeight > c.clientHeight); };
  useEffect(() => { const t = setTimeout(checkScroll, 100); return () => clearTimeout(t); }, [ratings]);
  useEffect(() => { const c = scrollContainerRef.current; if (!c) return; checkScroll(); c.addEventListener('scroll', checkScroll); const ro = new ResizeObserver(checkScroll); ro.observe(c); return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); }; }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateStr; }
  };

  const getRatingStatus = (avg: number): string => {
    if (avg === 0) return 'Новый поставщик или рейтинг отсутствует';
    if (avg <= 2) return 'Поставщик низкого качества';
    if (avg <= 4) return 'Поставщик среднего качества';
    return 'Поставщик высокого качества';
  };

  const toggleSelect = (ratingUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => { const next = new Set(prev); if (next.has(ratingUid)) next.delete(ratingUid); else next.add(ratingUid); return next; });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = ratings.map(r => r.uid);
      const lastIdx = allIds.indexOf(lastSelectedId); const currentIdx = allIds.indexOf(ratingUid);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastIdx, currentIdx); const end = Math.max(lastIdx, currentIdx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => { const next = new Set(prev); rangeIds.forEach(id => next.add(id)); return next; });
      }
    } else {
      if (selectedIds.has(ratingUid) && selectedIds.size === 1) setSelectedIds(new Set());
      else setSelectedIds(new Set([ratingUid]));
    }
    setLastSelectedId(ratingUid);
  };

  const handleDeleteSelected = () => { if (selectedIds.size === 0) return; setShowDeleteConfirm(true); };

  const confirmDeleteSelected = async () => {
    try {
      for (const ratingUid of selectedIds) { await AxiosService.delete(ConstantInfo.restApiSupplierDeleteRating(ratingUid)); }
      setSelectedIds(new Set()); setShowDeleteConfirm(false); await fetchRatings();
    } catch (e) { console.error(e); }
  };

  const handleAddClick = () => { setNewAuthor(''); setNewComment(''); setNewRating(0); setHoverRating(0); setShowAddPopup(true); };

  const handleAddSubmit = async () => {
    if (!uid || newRating === 0) return;
    setIsAdding(true);
    try {
      await AxiosService.post(ConstantInfo.restApiSupplierRatings(uid), { rating: newRating, comment: newComment.trim(), author: newAuthor.trim() });
      await fetchRatings(); setShowAddPopup(false);
    } catch (e) { console.error(e); } finally { setIsAdding(false); }
  };

  const handleContextMenu = (e: React.MouseEvent, ratingUid: string, rating: number, comment: string, author: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedIds.has(ratingUid)) setSelectedIds(new Set([ratingUid]));
    setContextMenu({ x: e.clientX, y: e.clientY, ratingUid, rating, comment, author });
  };

  const handleContextEdit = () => {
    if (!contextMenu) return;
    setEditRatingUid(contextMenu.ratingUid); setEditAuthor(contextMenu.author || '');
    setEditComment(contextMenu.comment || ''); setEditRating(contextMenu.rating);
    setEditHoverRating(0); setShowEditPopup(true); setContextMenu(null);
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить отзыв?')) { setContextMenu(null); return; }
    const uidsToDelete = selectedIds.has(contextMenu.ratingUid) ? selectedIds : new Set([contextMenu.ratingUid]);
    Promise.all(Array.from(uidsToDelete).map(uid => AxiosService.delete(ConstantInfo.restApiSupplierDeleteRating(uid))))
      .then(() => { setSelectedIds(new Set()); fetchRatings(); }).catch(e => console.error(e));
    setContextMenu(null);
  };

  const handleEditSubmit = async () => {
    if (!uid || !editRatingUid || editRating === 0) return;
    setIsEditing(true);
    try {
      await AxiosService.delete(ConstantInfo.restApiSupplierDeleteRating(editRatingUid));
      await AxiosService.post(ConstantInfo.restApiSupplierRatings(uid), { rating: editRating, comment: editComment.trim(), author: editAuthor.trim() });
      await fetchRatings(); setShowEditPopup(false);
    } catch (e) { console.error(e); } finally { setIsEditing(false); }
  };

  const handleViewComment = (comment: string, author: string) => { setViewComment(comment); setViewAuthor(author); setShowViewPopup(true); };

  const totalRows = Math.max(ratings.length, VISIBLE_ROWS);

  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0; const isLast = index === ratings.length - 1;
    return { borderTop: isFirst ? 'none' : '0.5px solid #E5ECF5', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' };
  };

  const contextMenuButtonStyle: React.CSSProperties = { width: 174, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' };

  return (
    <div style={{ ...cs, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...blockStyle, width: 1740, height: 72, flexShrink: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 40, display: 'flex', alignItems: 'center', gap: 18 }}>
          <StarRatingSmall value={averageRating} size={18} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>Средний рейтинг: {averageRating.toFixed(1)}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#666EFE', marginLeft: 42 }}>{getRatingStatus(averageRating)}</span>
        </div>
      </div>

      <div style={{ ...blockStyle, width: 1740, height: 477, flexShrink: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, left: 40, display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Button1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button onClick={handleAddClick} style={smallButtonStyle}><img src={Button4} alt="" style={{ width: 14, height: 14 }} /></button>
          <button onClick={handleDeleteSelected} style={{ ...smallButtonStyle, opacity: selectedIds.size > 0 ? 1 : 0.5, cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed' }}><img src={Button5} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>

        <div style={{ position: 'absolute', top: 68, left: 40, display: 'flex', gap: 10 }}>
          <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА И ВРЕМЯ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НАИМЕНОВАНИЕ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_RATING }}>РЕЙТИНГ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_AUTHOR }}>АВТОР</span>
            </div>
            <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div style={{ minWidth: TABLE_WIDTH }}>
                {isLoading ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF' }}>Загрузка...</span></div> : (
                  <>
                    {Array.from({ length: totalRows }).map((_, index) => {
                      const rating = ratings[index]; const isRealData = !!rating; const isSelected = rating && selectedIds.has(rating.uid);
                      if (!isRealData) return (<div key={`empty-${index}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} />);
                      return (
                        <div key={rating.uid} onClick={(e) => toggleSelect(rating.uid, e)} onContextMenu={(e) => handleContextMenu(e, rating.uid, rating.rating, rating.comment, rating.author)} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: isSelected ? '#DEEEFF' : '#FFFFFF', position: 'relative', boxSizing: 'border-box', cursor: 'pointer', userSelect: 'none', ...getRowSeparator(index, true) }}>
                          <span style={{ position: 'absolute', left: COL_DATE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_NAME - COL_DATE - 20 }}>{formatDate(rating.createdAt)}</span>
                          <div onClick={(e) => { e.stopPropagation(); handleViewComment(rating.comment, rating.author); }} style={{ position: 'absolute', left: COL_NAME, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                            <img src={OtzivIcon} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#666EFE', textDecoration: 'underline' }}>Отзыв</span>
                          </div>
                          <div style={{ position: 'absolute', left: COL_RATING }}><StarRatingSmall value={rating.rating} size={18} /></div>
                          <span style={{ position: 'absolute', left: COL_AUTHOR, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_AUTHOR - 40 }}>{rating.author || '-'}</span>
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

      {contextMenu && (<div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}><button style={contextMenuButtonStyle} onClick={handleContextEdit}>Редактировать</button><button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button></div>)}

      {showAddPopup && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddPopup(false)}><div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Добавление отзыва</h3><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Автор</label><input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setShowAddPopup(false); }} placeholder="Введите имя автора" autoFocus style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Текст отзыва</label><textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Введите текст отзыва" rows={3} style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', padding: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF', resize: 'none' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Рейтинг</label><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ display: 'flex', gap: 8 }}>{[1, 2, 3, 4, 5].map(i => { const fillPercent = Math.min(100, Math.max(0, ((hoverRating || newRating) - i + 1) * 100)); const isHovered = hoverRating >= i; return (<div key={i} onClick={() => setNewRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} style={{ width: 32, height: 32, position: 'relative', cursor: 'pointer', flexShrink: 0 }}><svg width={32} height={32} viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}><path d="M10 1L12.39 6.53L18.18 7.27L13.92 11.37L15.09 17.23L10 14.25L4.91 17.23L6.08 11.37L1.82 7.27L7.61 6.53L10 1Z" fill={isHovered ? '#666EFE' : '#E5E7EB'} stroke={isHovered ? '#666EFE' : '#D1D5DB'} strokeWidth="1"/></svg>{!isHovered && fillPercent > 0 && (<svg width={32} height={32} viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0, clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}><path d="M10 1L12.39 6.53L18.18 7.27L13.92 11.37L15.09 17.23L10 14.25L4.91 17.23L6.08 11.37L1.82 7.27L7.61 6.53L10 1Z" fill="#666EFE" stroke="#666EFE" strokeWidth="1"/></svg>)}</div>); })}</div><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>{hoverRating || newRating || 0}</span></div></div><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={handleAddSubmit} disabled={isAdding || newRating === 0} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: newRating > 0 && !isAdding ? '#666EFE' : '#BCC8FF', cursor: newRating > 0 && !isAdding ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isAdding ? 'Добавление...' : 'Добавить'}</button><button onClick={() => setShowAddPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}

      {showEditPopup && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditPopup(false)}><div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Редактирование отзыва</h3><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Автор</label><input type="text" value={editAuthor} onChange={e => setEditAuthor(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setShowEditPopup(false); }} placeholder="Введите имя автора" autoFocus style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Текст отзыва</label><textarea value={editComment} onChange={e => setEditComment(e.target.value)} placeholder="Введите текст отзыва" rows={3} style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', padding: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF', resize: 'none' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Рейтинг</label><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ display: 'flex', gap: 8 }}>{[1, 2, 3, 4, 5].map(i => { const fillPercent = Math.min(100, Math.max(0, ((editHoverRating || editRating) - i + 1) * 100)); const isHovered = editHoverRating >= i; return (<div key={i} onClick={() => setEditRating(i)} onMouseEnter={() => setEditHoverRating(i)} onMouseLeave={() => setEditHoverRating(0)} style={{ width: 32, height: 32, position: 'relative', cursor: 'pointer', flexShrink: 0 }}><svg width={32} height={32} viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}><path d="M10 1L12.39 6.53L18.18 7.27L13.92 11.37L15.09 17.23L10 14.25L4.91 17.23L6.08 11.37L1.82 7.27L7.61 6.53L10 1Z" fill={isHovered ? '#666EFE' : '#E5E7EB'} stroke={isHovered ? '#666EFE' : '#D1D5DB'} strokeWidth="1"/></svg>{!isHovered && fillPercent > 0 && (<svg width={32} height={32} viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0, clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}><path d="M10 1L12.39 6.53L18.18 7.27L13.92 11.37L15.09 17.23L10 14.25L4.91 17.23L6.08 11.37L1.82 7.27L7.61 6.53L10 1Z" fill="#666EFE" stroke="#666EFE" strokeWidth="1"/></svg>)}</div>); })}</div><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>{editHoverRating || editRating || 0}</span></div></div><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={handleEditSubmit} disabled={isEditing || editRating === 0} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: editRating > 0 && !isEditing ? '#666EFE' : '#BCC8FF', cursor: editRating > 0 && !isEditing ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isEditing ? 'Сохранение...' : 'Сохранить'}</button><button onClick={() => setShowEditPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}

      {showViewPopup && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowViewPopup(false)}><div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Отзыв</h3>{viewAuthor && (<div><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' }}>Автор: </span><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059' }}>{viewAuthor}</span></div>)}<div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', margin: 0, lineHeight: '1.5' }}>{viewComment || 'Без текста'}</p></div><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={() => setShowViewPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть</button></div></div></div>)}

      {showDeleteConfirm && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}><div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Подтверждение удаления</h3><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Вы уверены, что хотите удалить выбранные элементы?</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={confirmDeleteSelected} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: '#FF3052', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Удалить</button><button onClick={() => setShowDeleteConfirm(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}
    </div>
  );
};

export default SupplierRatingTab;