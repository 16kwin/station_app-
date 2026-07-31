// StationFilesTab.tsx
import React, { useState, useRef, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import FileIcon from '../../../assets/References/NomenclatureCreatePage/File.svg';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';

interface DocumentItem {
  uid: string;
  stationUid: string;
  documentName: string;
  filePath: string;
  originalName: string;
  url: string;
  createdAt: string;
}

interface StationFilesTabProps {
  stationUid: string;
  isEdit: boolean;
}

const StationFilesTab: React.FC<StationFilesTabProps> = ({ stationUid, isEdit }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showAddDocPopup, setShowAddDocPopup] = useState(false);
  const [showEditDocPopup, setShowEditDocPopup] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileLocalRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; docUid: string; docName: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const smallButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };

  const TABLE_WIDTH = 1660;
  const TABLE_HEIGHT = 464;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 7;

  const COL_NAME = 50;
  const COL_FILE = 720;
  const COL_DATE = 1265;

  const fetchDocuments = async () => {
    if (!stationUid) return;
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiStationDocuments(stationUid));
      setDocuments((res.data || []).map((doc: any) => ({
        ...doc,
        url: doc.url ? ConstantInfo.fileDir + doc.url.replace(/^\//, '') : '',
      })));
    } catch (e) {
      console.error('Ошибка загрузки документов:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (stationUid && isEdit) fetchDocuments();
  }, [stationUid, isEdit]);

  useEffect(() => {
    const handler = () => { if (stationUid) fetchDocuments(); };
    window.addEventListener('refreshStationDocuments', handler);
    return () => window.removeEventListener('refreshStationDocuments', handler);
  }, [stationUid]);

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
  }, [documents]);

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

  const toggleSelect = (docUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(docUid)) next.delete(docUid);
        else next.add(docUid);
        return next;
      });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = documents.map(d => d.uid);
      const lastIdx = allIds.indexOf(lastSelectedId);
      const currentIdx = allIds.indexOf(docUid);
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
      if (selectedIds.has(docUid) && selectedIds.size === 1) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set([docUid]));
      }
    }
    setLastSelectedId(docUid);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      for (const docUid of selectedIds) {
        await AxiosService.delete(ConstantInfo.restApiStationDeleteDocument(stationUid, docUid));
      }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchDocuments();
    } catch (e) {
      console.error('Ошибка удаления документов:', e);
    }
  };

  const handleAddClick = () => {
    setNewDocName('');
    setSelectedFile(null);
    setShowAddDocPopup(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleAddDocSubmit = async () => {
    if (!stationUid || !newDocName.trim() || !selectedFile) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('documentName', newDocName.trim());
      await AxiosService.post(ConstantInfo.restApiStationDocuments(stationUid), fd);
      await fetchDocuments();
      setShowAddDocPopup(false);
      window.dispatchEvent(new CustomEvent('refreshStationDocuments'));
    } catch (e) {
      console.error('Ошибка загрузки документа:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, docUid: string, docName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.has(docUid)) {
      setSelectedIds(new Set([docUid]));
    }
    setContextMenu({ x: e.clientX, y: e.clientY, docUid, docName });
  };

  const handleContextEdit = () => {
    if (!contextMenu) return;
    const doc = documents.find(d => d.uid === contextMenu.docUid);
    if (doc) {
      setEditingDoc(doc);
      setEditDocName(doc.documentName);
      setShowEditDocPopup(true);
    }
    setContextMenu(null);
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить документ?')) {
      setContextMenu(null);
      return;
    }
    const uidsToDelete = selectedIds.has(contextMenu.docUid) ? selectedIds : new Set([contextMenu.docUid]);
    Promise.all(Array.from(uidsToDelete).map(uid => 
      AxiosService.delete(ConstantInfo.restApiStationDeleteDocument(stationUid, uid))
    ))
      .then(() => {
        setSelectedIds(new Set());
        fetchDocuments();
      })
      .catch(e => console.error('Ошибка удаления документа:', e));
    setContextMenu(null);
  };

  const handleEditDocSubmit = async () => {
    if (!editingDoc || !editDocName.trim()) return;
    setIsUploading(true);
    try {
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('documentName', editDocName.trim());
        await AxiosService.post(ConstantInfo.restApiStationDocuments(stationUid), fd);
        await AxiosService.delete(ConstantInfo.restApiStationDeleteDocument(stationUid, editingDoc.uid));
      }
      await fetchDocuments();
      setShowEditDocPopup(false);
      setEditingDoc(null);
      setSelectedFile(null);
    } catch (e) {
      console.error('Ошибка редактирования документа:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const totalRows = Math.max(documents.length, VISIBLE_ROWS);

  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0;
    const isLast = index === documents.length - 1;
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
    <div style={{ position: 'absolute', top: 154, left: 30, right: 30, bottom: 86 }}>
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
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НАИМЕНОВАНИЕ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_FILE }}>ФАЙЛ</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА</span>
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
                      const doc = documents[index];
                      const isRealData = !!doc;
                      const isSelected = doc && selectedIds.has(doc.uid);

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
                          key={doc.uid} 
                          onClick={(e) => toggleSelect(doc.uid, e)}
                          onContextMenu={(e) => handleContextMenu(e, doc.uid, doc.documentName)}
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
                          <img src={FileIcon} alt="" style={{ position: 'absolute', left: 21, width: 20, height: 20, flexShrink: 0 }} />
                          <span style={{ position: 'absolute', left: COL_NAME, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_FILE - COL_NAME - 30 }}>
                            {doc.documentName}
                          </span>
                          <span style={{ position: 'absolute', left: COL_FILE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_DATE - COL_FILE - 30 }}>
                            {doc.originalName}
                          </span>
                          <span style={{ position: 'absolute', left: COL_DATE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_DATE - 60 }}>
                            {formatDate(doc.createdAt)}
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
          <button style={contextMenuButtonStyle} onClick={handleContextEdit}>Редактировать</button>
          <button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button>
        </div>
      )}

      {/* Попап добавления документа */}
      {showAddDocPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddDocPopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Добавление документа</h3>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название</label>
              <input
                type="text"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddDocSubmit(); else if (e.key === 'Escape') setShowAddDocPopup(false); }}
                placeholder="Введите название документа"
                autoFocus
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Файл</label>
              <div 
                onClick={() => fileLocalRef.current?.click()} 
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
              <input ref={fileLocalRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleAddDocSubmit} disabled={!newDocName.trim() || !selectedFile || isUploading} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: newDocName.trim() && selectedFile && !isUploading ? '#666EFE' : '#BCC8FF', cursor: newDocName.trim() && selectedFile && !isUploading ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isUploading ? 'Загрузка...' : 'Добавить'}</button>
              <button onClick={() => setShowAddDocPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Попап редактирования документа */}
      {showEditDocPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setShowEditDocPopup(false); setSelectedFile(null); }}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Редактирование документа</h3>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название</label>
              <input
                type="text"
                value={editDocName}
                onChange={e => setEditDocName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleEditDocSubmit(); else if (e.key === 'Escape') { setShowEditDocPopup(false); setSelectedFile(null); } }}
                placeholder="Введите название документа"
                autoFocus
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Файл (необязательно)</label>
              <div 
                onClick={() => fileLocalRef.current?.click()} 
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px dashed rgba(102, 110, 254, 0.3)', backgroundColor: '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 10 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="9" y1="3" x2="9" y2="15" stroke="#666EFE" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="9" x2="15" y2="9" stroke="#666EFE" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: selectedFile ? '#666EFE' : '#9CA3AF' }}>
                  {selectedFile ? selectedFile.name : 'Выберите новый файл'}
                </span>
              </div>
              <input ref={fileLocalRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleEditDocSubmit} disabled={!editDocName.trim() || isUploading} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: editDocName.trim() && !isUploading ? '#666EFE' : '#BCC8FF', cursor: editDocName.trim() && !isUploading ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isUploading ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => { setShowEditDocPopup(false); setSelectedFile(null); }} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
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

export default StationFilesTab;