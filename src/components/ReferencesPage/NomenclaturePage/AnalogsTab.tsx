// AnalogsTab.tsx — ПОЛНЫЙ ФАЙЛ (выделение строк, удаление выделенных, кнопки button1/button4/button5)
import React, { useState, useRef, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import CatalogSelectPopup from './CatalogSelectPopup';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { CommonProps } from './NomenclatureCreatePage';
import AnalogIcon from '../../../assets/References/NomenclatureCreatePage/analog.svg';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';

interface AnalogItem {
  uid: string;
  materialUid: string;
  analogMaterialUid: string;
  analogMaterialName: string;
  analogModelName: string;
  compatibilityPercent: number;
  createdAt: string;
}

const AnalogsTab: React.FC<CommonProps> = (props) => {
  const {
    uid, isEdit,
    selectedAccountingGroupId, selectedNomenclatureGroupId, selectedNomenclatureTypeId,
  } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [analogs, setAnalogs] = useState<AnalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showCatalogPopup, setShowCatalogPopup] = useState(false);
  const [selectedAnalogUid, setSelectedAnalogUid] = useState('');
  const [selectedAnalogName, setSelectedAnalogName] = useState('');
  const [compatibilityPercent, setCompatibilityPercent] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [matchedChars, setMatchedChars] = useState(0);
  const [groupsMatch, setGroupsMatch] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualPercent, setManualPercent] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; analogUid: string; analogName: string } | null>(null);
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
  const COL_MODEL = 640;
  const COL_COMPATIBILITY = 1400;

  const canAddAnalog = !!(selectedAccountingGroupId && selectedNomenclatureGroupId && selectedNomenclatureTypeId);
  const excludeUids = uid ? [uid, ...analogs.map(a => a.analogMaterialUid)] : [];

  const fetchAnalogs = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureAnalogs(uid));
      setAnalogs(res.data || []);
    } catch (e) {
      console.error('Ошибка загрузки аналогов:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uid && isEdit) fetchAnalogs();
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

  useEffect(() => { const t = setTimeout(checkScroll, 100); return () => clearTimeout(t); }, [analogs]);
  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return;
    checkScroll();
    c.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(c);
    return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const toggleSelect = (analogUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(analogUid)) next.delete(analogUid);
        else next.add(analogUid);
        return next;
      });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = analogs.map(a => a.uid);
      const lastIdx = allIds.indexOf(lastSelectedId);
      const currentIdx = allIds.indexOf(analogUid);
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
      if (selectedIds.has(analogUid) && selectedIds.size === 1) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set([analogUid]));
      }
    }
    setLastSelectedId(analogUid);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      for (const analogUid of selectedIds) {
        await AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteAnalog(analogUid));
      }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      await fetchAnalogs();
    } catch (e) {
      console.error('Ошибка удаления аналогов:', e);
    }
  };

  const handleAddClick = () => {
    if (!canAddAnalog) return;
    setSelectedAnalogUid('');
    setSelectedAnalogName('');
    setCompatibilityPercent(0);
    setTotalChars(0);
    setMatchedChars(0);
    setGroupsMatch(true);
    setShowManualInput(false);
    setManualPercent('');
    setShowResult(false);
    setShowAddPopup(true);
  };

  const handleCatalogSelect = async (id: string, name: string) => {
    setSelectedAnalogUid(id);
    setSelectedAnalogName(name);
    setShowCatalogPopup(false);

    try {
      const res = await AxiosService.post(ConstantInfo.restApiNomenclatureCalculateCompatibility, {
        materialUid1: uid,
        materialUid2: id,
      });
      setCompatibilityPercent(res.data.compatibilityPercent);
      setTotalChars(res.data.totalCharacteristics);
      setMatchedChars(res.data.matchedCharacteristics);
      setGroupsMatch(res.data.groupsMatch);
      setShowResult(true);
    } catch (e) {
      console.error('Ошибка расчёта совместимости:', e);
    }
  };

  const handleAddSubmit = async () => {
    if (!uid || !selectedAnalogUid) return;
    setIsAdding(true);
    try {
      const percent = showManualInput ? parseInt(manualPercent) || 0 : compatibilityPercent;
      await AxiosService.post(ConstantInfo.restApiNomenclatureAnalogs(uid), {
        analogMaterialUid: selectedAnalogUid,
        compatibilityPercent: percent,
      });
      await fetchAnalogs();
      setShowAddPopup(false);
    } catch (e) {
      console.error('Ошибка добавления аналога:', e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, analogUid: string, analogName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.has(analogUid)) {
      setSelectedIds(new Set([analogUid]));
    }
    setContextMenu({ x: e.clientX, y: e.clientY, analogUid, analogName });
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить аналог?')) {
      setContextMenu(null);
      return;
    }
    const uidsToDelete = selectedIds.has(contextMenu.analogUid) ? selectedIds : new Set([contextMenu.analogUid]);
    Promise.all(Array.from(uidsToDelete).map(uid => 
      AxiosService.delete(ConstantInfo.restApiNomenclatureDeleteAnalog(uid))
    ))
      .then(() => {
        setSelectedIds(new Set());
        fetchAnalogs();
      })
      .catch(e => console.error('Ошибка удаления аналога:', e));
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

  const totalRows = Math.max(analogs.length, VISIBLE_ROWS);

  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0;
    const isLast = index === analogs.length - 1;
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
        <div style={{ position: 'absolute', top: 14, left: 40, right: 40, display: 'flex', flexDirection: 'column' }}>
          {/* Кнопки */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 8, paddingLeft: 0 }}>
            <button style={smallButtonStyle}>
              <img src={Button1} alt="" style={{ width: 18, height: 18 }} />
            </button>
            <button 
              onClick={handleAddClick} 
              style={{ ...smallButtonStyle, opacity: canAddAnalog ? 1 : 0.5, cursor: canAddAnalog ? 'pointer' : 'not-allowed' }}
              title={!canAddAnalog ? 'Заполните группу учета, группу номенклатуры и вид номенклатуры' : 'Добавить аналог'}
            >
              <img src={Button4} alt="" style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={handleDeleteSelected} style={{ ...smallButtonStyle, opacity: selectedIds.size > 0 ? 1 : 0.5, cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed' }}>
              <img src={Button5} alt="" style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              {/* Шапка */}
              <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НАИМЕНОВАНИЕ</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_MODEL }}>МОДЕЛЬ</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_COMPATIBILITY }}>ПРИМЕНИМОСТЬ</span>
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
                        const analog = analogs[index];
                        const isRealData = !!analog;
                        const isSelected = analog && selectedIds.has(analog.uid);

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
                            key={analog.uid} 
                            onClick={(e) => toggleSelect(analog.uid, e)}
                            onContextMenu={(e) => handleContextMenu(e, analog.uid, analog.analogMaterialName)}
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
                            <img src={AnalogIcon} alt="" style={{ position: 'absolute', left: 21, width: 20, height: 20, flexShrink: 0 }} />
                            <span style={{ position: 'absolute', left: COL_NAME, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_MODEL - COL_NAME - 30 }}>
                              {analog.analogMaterialName}
                            </span>
                            <span style={{ position: 'absolute', left: COL_MODEL, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_COMPATIBILITY - COL_MODEL - 30 }}>
                              {analog.analogModelName || '-'}
                            </span>
                            <span style={{ position: 'absolute', left: COL_COMPATIBILITY, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_COMPATIBILITY - 40 }}>
                              {analog.compatibilityPercent}%
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
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          <button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button>
        </div>
      )}

      {/* Попап добавления аналога */}
      {showAddPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddPopup(false)}>
          <div style={{ width: 500, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Добавление аналога</h3>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Материал-аналог</label>
              <div onClick={() => setShowCatalogPopup(true)} style={{ ...popupFieldStyle, color: selectedAnalogName ? '#666EFE' : '#9CA3AF' }}>
                <span>{selectedAnalogName || 'Выберите из каталога'}</span>
              </div>
            </div>

            {showResult && (
              <div style={{ backgroundColor: '#F5F6FA', borderRadius: 10, padding: 15 }}>
                {!groupsMatch ? (
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#FF3052', margin: 0, textAlign: 'center' }}>
                      Группы учёта/номенклатуры/виды не совпадают
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', margin: '10px 0 0', textAlign: 'center' }}>
                      Совместимость: 0%
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>
                      Совпало характеристик: {matchedChars} из {totalChars}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700, color: '#2D4059', margin: '10px 0 0', textAlign: 'center' }}>
                      Совместимость: {compatibilityPercent}%
                    </p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    style={{ height: 32, paddingLeft: 16, paddingRight: 16, borderRadius: 8, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, color: '#666EFE', textDecoration: 'underline' }}
                  >
                    {showManualInput ? 'Использовать автоматический' : 'Ввести вручную'}
                  </button>
                </div>
              </div>
            )}

            {showManualInput && (
              <div>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Процент совместимости (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={manualPercent}
                  onChange={e => setManualPercent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSubmit(); else if (e.key === 'Escape') setShowAddPopup(false); }}
                  placeholder="0-100"
                  autoFocus
                  style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleAddSubmit} disabled={isAdding || !selectedAnalogUid} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: selectedAnalogUid && !isAdding ? '#666EFE' : '#BCC8FF', cursor: selectedAnalogUid && !isAdding ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isAdding ? 'Добавление...' : 'Добавить'}</button>
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
        isOpen={showCatalogPopup}
        onClose={() => setShowCatalogPopup(false)}
        onSelect={(id, name) => handleCatalogSelect(id, name)}
        popupType="analogSelect"
        excludeUids={excludeUids}
      />
    </div>
  );
};

export default AnalogsTab;