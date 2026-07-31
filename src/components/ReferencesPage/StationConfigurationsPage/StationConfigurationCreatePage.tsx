// StationConfigurationCreatePage.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTabs } from '../../../context/TabContext';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import CatalogSelectPopup from '../NomenclaturePage/CatalogSelectPopup';
import type { PopupType } from '../NomenclaturePage/CatalogSelectPopup';
import Icon7 from '../../../assets/References/NomenclatureCreatePage/Icon7.svg';
import Icon6 from '../../../assets/References/NomenclatureCreatePage/Icon6.svg';
import Icon21 from '../../../assets/References/NomenclatureCreatePage/Icon21.svg';
import Icon22 from '../../../assets/References/NomenclatureCreatePage/Icon22.svg';
import Icon31 from '../../../assets/References/NomenclatureCreatePage/Icon31.svg';
import Icon32 from '../../../assets/References/NomenclatureCreatePage/Icon32.svg';

interface CellData {
  id: string;
  column?: number;
  row?: number;
  drum?: number;
}

interface ModelCellsStructure {
  type: 'postamat' | 'drum';
  columns?: number;
  cellsPerColumn?: number;
  drums?: number;
  columnsPerDrum?: number;
  rowsPerColumn?: number;
  cells: CellData[];
}

interface ConfigCell {
  id: string;
  modelCellIds: string[];
  deleted?: boolean;
}

const StationConfigurationCreatePage = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab } = useTabs();

  const [name, setName] = useState('');
  const [modelId, setModelId] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelCells, setModelCells] = useState<ModelCellsStructure | null>(null);
  const [configCells, setConfigCells] = useState<ConfigCell[]>([]);
  const [selectedConfigCells, setSelectedConfigCells] = useState<Set<string>>(new Set());
  const [selectedDrum, setSelectedDrum] = useState<number>(1);

  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);

  const getPopupOpenKey = () => `station_config_popup_open_${uid}`;
  const [popupOpen, setPopupOpen] = useState(() => sessionStorage.getItem(getPopupOpenKey()) === 'true');
  const [popupType, setPopupType] = useState<PopupType>('stationModel');

  const POSTAMAT_CELL_WIDTH = 160;
  const DRUM_CELL_SIZE = 60;
  const GAP = 6;
  const COL_GAP = 50;

  useEffect(() => {
    if (!uid) return;
    const cp = window.location.pathname;
    setIsEdit(cp.includes('/edit/'));
    if (cp.includes('/edit/')) loadConfigData(uid);
  }, [uid]);

  const loadConfigData = async (configUid: string) => {
    setIsLoading(true);
    try {
      const d = (await AxiosService.get(ConstantInfo.restApiStationConfiguration(configUid))).data;
      setName(d.name || '');
      if (d.modelId) { setModelId(d.modelId); setModelName(d.modelName || ''); await loadModelCells(d.modelId, d.cellsStructure); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const loadModelCells = async (mid: string, existingStructure?: string) => {
    try {
      const d = (await AxiosService.get(ConstantInfo.restApiStationModel(mid))).data;
      if (d.cellsStructure) {
        const parsed: ModelCellsStructure = JSON.parse(d.cellsStructure);
        setModelCells(parsed);
        if (existingStructure) {
          try { const existing = JSON.parse(existingStructure); if (existing.cells?.length > 0) { setConfigCells(existing.cells); return; } } catch {}
        }
        setConfigCells(parsed.cells.map((c: CellData) => ({ id: c.id, modelCellIds: [c.id], deleted: false })));
      }
    } catch (e) { console.error(e); }
  };

  const openModelPopup = () => { setPopupType('stationModel'); setPopupOpen(true); if (uid) sessionStorage.setItem(getPopupOpenKey(), 'true'); };
  const handlePopupSelect = (id: string, nm: string) => { if (popupType === 'stationModel') { setModelId(id); setModelName(nm); loadModelCells(id); } };
  const handlePopupClose = () => { setPopupOpen(false); if (uid) sessionStorage.removeItem(getPopupOpenKey()); };

  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedConfigCells(prev => { const next = new Set(prev); next.has(cellId) ? next.delete(cellId) : next.add(cellId); return next; });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedConfigCells.size === 0) return;
    setConfigCells(prev => prev.map(c => selectedConfigCells.has(c.id) ? { ...c, deleted: true } : c));
    setSelectedConfigCells(new Set());
  };

  const handleRestoreDeleted = (cellId: string) => {
    setConfigCells(prev => prev.map(c => c.id === cellId && c.deleted ? { ...c, deleted: false } : c));
  };

  const handleMergeSelected = () => {
    if (selectedConfigCells.size < 2 || !modelCells) return;
    const ids = Array.from(selectedConfigCells);

    const allPhysicalIds: string[] = [];
    const processedIds = new Set<string>();
    ids.forEach(id => {
      const cc = configCells.find(c => c.id === id);
      if (cc) cc.modelCellIds.forEach(mid => { if (!processedIds.has(mid)) { allPhysicalIds.push(mid); processedIds.add(mid); } });
    });
    if (allPhysicalIds.length < 2) return;

    const physicalCells: CellData[] = allPhysicalIds.map(mid => modelCells.cells.find(c => c.id === mid)).filter((c): c is CellData => c !== undefined);
    const cols = [...new Set(physicalCells.map(c => c.column!).filter(c => c !== undefined))].sort((a, b) => a - b);
    const rows = [...new Set(physicalCells.map(c => c.row!).filter(r => r !== undefined))].sort((a, b) => a - b);

    const mergedId = ids[0];

    if (cols.length > 1) {
      const minCol = cols[0];
      const maxCol = cols[cols.length - 1];
      const modelRows = modelCells.type === 'postamat' ? modelCells.cellsPerColumn || 0 : modelCells.rowsPerColumn || 0;
      const selectedSet = new Set(allPhysicalIds);
      const selectedRows = new Set(rows);

      const affectedColSet = new Set<number>();
      for (let col = minCol; col <= maxCol; col++) affectedColSet.add(col);

      setConfigCells(prev => {
        // Удаляем ConfigCell которые затрагивают эти колонки ТОЛЬКО в текущем барабане
        let updated: ConfigCell[] = prev.filter(c => {
          const ccCols = new Set(c.modelCellIds.map(mid => {
            const mc = modelCells.cells.find(mcell => mcell.id === mid);
            if (mc?.drum !== selectedDrum) return undefined;
            return mc?.column;
          }).filter((col): col is number => col !== undefined));
          return ![...ccCols].some(col => affectedColSet.has(col));
        });

        // Одна большая ячейка для выделенного
        updated.push({ id: mergedId, modelCellIds: allPhysicalIds, deleted: false });

        // Перестраиваем все строки для этих колонок в текущем барабане
        for (let row = 1; row <= modelRows; row++) {
          if (selectedRows.has(row)) continue;

          const cellsInRow: string[] = [];
          for (let col = minCol; col <= maxCol; col++) {
            const mc = modelCells.cells.find(c => c.column === col && c.row === row && c.drum === selectedDrum);
            if (mc && !selectedSet.has(mc.id)) {
              cellsInRow.push(mc.id);
            }
          }
          if (cellsInRow.length > 0) {
            updated.push({ id: cellsInRow[0], modelCellIds: cellsInRow, deleted: false });
          }
        }
        return updated;
      });
    } else {
      setConfigCells(prev => {
        const others = prev.filter(c => !ids.includes(c.id));
        return [...others, { id: mergedId, modelCellIds: allPhysicalIds, deleted: false }];
      });
    }
    setSelectedConfigCells(new Set());
  };

  const handleRestoreCell = (cellId: string) => {
    setConfigCells(prev => {
      const cell = prev.find(c => c.id === cellId);
      if (!cell || cell.modelCellIds.length <= 1) return prev;

      const physicalCells: CellData[] = cell.modelCellIds.map(mid => modelCells?.cells.find(c => c.id === mid)).filter((c): c is CellData => c !== undefined);
      const cols = [...new Set(physicalCells.map(c => c.column!))];

      if (cols.length > 1 && modelCells) {
        const affectedCols = new Set(cols);
        const toRemove = new Set<string>();
        prev.forEach(cc => {
          if (cc.modelCellIds.length > 1) {
            const ccCols = new Set(cc.modelCellIds.map(mid => {
              const mc = modelCells.cells.find(mcell => mcell.id === mid);
              if (mc?.drum !== selectedDrum) return undefined;
              return mc?.column;
            }).filter(c => c !== undefined));
            if ([...ccCols].some(c => affectedCols.has(c!))) toRemove.add(cc.id);
          }
        });

        const restored: ConfigCell[] = [];
        const modelRows = modelCells.type === 'postamat' ? modelCells.cellsPerColumn || 0 : modelCells.rowsPerColumn || 0;
        cols.forEach(col => {
          for (let row = 1; row <= modelRows; row++) {
            const mc = modelCells.cells.find(c => c.column === col && c.row === row && c.drum === selectedDrum);
            if (mc) restored.push({ id: mc.id, modelCellIds: [mc.id], deleted: false });
          }
        });
        return [...prev.filter(c => !toRemove.has(c.id)), ...restored];
      }

      const unmerged: ConfigCell[] = cell.modelCellIds.map(mid => ({ id: mid, modelCellIds: [mid], deleted: false }));
      return [...prev.filter(c => c.id !== cellId), ...unmerged];
    });
  };

  const handleSave = async () => {
    if (!uid) return;
    setIsSaving(true);
    try {
      const body = { uid, name: name.trim(), modelId: modelId || null, cellsStructure: JSON.stringify({ cells: configCells }) };
      if (isEdit) await AxiosService.patch(`${ConstantInfo.restApiStationConfigurations}/${uid}`, body);
      else await AxiosService.post(ConstantInfo.restApiStationConfigurations, body);
      if (uid) sessionStorage.removeItem(getPopupOpenKey());
      if (!isEdit) { setIsEdit(true); navigate(`/references/station-configurations/edit/${uid}`, { replace: true }); }
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleClose = () => { const t = tabs.find(tab => tab.id === activeTabId); if (t) closeTab(t.id); if (uid) sessionStorage.removeItem(getPopupOpenKey()); };
  const handleCloseWithoutSaving = () => { if (uid) sessionStorage.removeItem(getPopupOpenKey()); handleClose(); };
  const handleSaveAndClose = async () => { await handleSave(); handleClose(); };
  const canSave = name.trim().length > 0 && modelId.length > 0;

  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' };
  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const fieldBaseStyle: React.CSSProperties = { width: 340, height: 44, borderRadius: 10, marginTop: 11, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, outline: 'none', backgroundColor: '#FFFFFF', position: 'relative', boxSizing: 'border-box' };

  const getDisplayCells = useCallback((): CellData[] => {
    if (!modelCells) return [];
    return modelCells.cells.filter(c => modelCells.type === 'drum' ? c.drum === selectedDrum : true);
  }, [modelCells, selectedDrum]);

  const displayCells = getDisplayCells();
  const columnsCount = modelCells?.type === 'postamat' ? modelCells.columns || 0 : modelCells?.columnsPerDrum || 0;
  const rowsCount = modelCells?.type === 'postamat' ? modelCells?.cellsPerColumn || 0 : modelCells?.rowsPerColumn || 0;

  const modelCellToConfigMap = new Map<string, ConfigCell>();
  configCells.forEach(cc => cc.modelCellIds.forEach(mid => modelCellToConfigMap.set(mid, cc)));
  const renderedModelCells = new Set<string>();

  const getVisibleRowIndex = (col: number, row: number): number | null => {
    let visibleIdx = 0;
    for (let r = 1; r <= rowsCount; r++) {
      const mc = displayCells.find(c => c.column === col && c.row === r);
      if (!mc) continue;
      const cc = modelCellToConfigMap.get(mc.id);
      if (!cc || cc.deleted) continue;
      visibleIdx++;
      if (r === row) return visibleIdx;
    }
    return null;
  };

  const totalActiveCells = configCells.filter(c => !c.deleted).length;
  const getDrumCellCount = (drum: number): number => {
    return configCells.filter(c => {
      if (c.deleted) return false;
      return c.modelCellIds.some(mid => {
        const mc = modelCells?.cells.find(cell => cell.id === mid);
        return mc?.drum === drum;
      });
    }).length;
  };

  if (isLoading) return (<div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>);

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0 }}>{isEdit ? name || 'Конфигурация' : 'Справочник: Конфигурации станций (Создание)'}</h1>
      <button onClick={() => setShowClosePopup(true)} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} /></button>

      <div style={{ position: 'absolute', top: 99, left: 30, right: 30, bottom: 86, display: 'flex', gap: 30 }}>
        <div style={{ ...blockStyle, width: 380, height: 565, flexShrink: 0, padding: 30 }}>
          <span style={labelStyle}>Наименование:</span>
          <div style={{ ...fieldBaseStyle, width: '100%', border: nameFocused || name ? '1px solid #666EFE' : '1px solid rgba(102,110,254,0.15)' }}>
            <img src={name ? Icon22 : Icon21} alt="" style={{ width: 16, height: 16, position: 'absolute', left: 14 }} />
            <input style={{ width: 'calc(100% - 50px)', height: '100%', border: 'none', outline: 'none', marginLeft: 44, fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: name ? '#666EFE' : '#A0A3BD', backgroundColor: 'transparent' }} value={name} onChange={e => setName(e.target.value)} onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} placeholder="Введите название" />
            {name && <button onClick={() => setName('')} style={{ position: 'absolute', right: 13, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon6} alt="Очистить" style={{ width: 18, height: 18 }} /></button>}
          </div>
          <div style={{ marginTop: 25 }}>
            <span style={labelStyle}>Модель станции:</span>
            <div onClick={openModelPopup} style={{ ...fieldBaseStyle, width: '100%', cursor: 'pointer', border: modelId ? '1px solid #666EFE' : '1px solid rgba(102,110,254,0.15)' }}>
              <img src={modelId ? Icon32 : Icon31} alt="" style={{ width: 14.5, height: 18, position: 'absolute', left: 15 }} />
              <span style={{ marginLeft: 44, color: modelId ? '#666EFE' : '#A0A3BD' }}>{modelName || 'Выберите модель'}</span>
            </div>
          </div>
          {modelCells && (
            <div style={{ marginTop: 25 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>Тип: <strong>{modelCells.type === 'postamat' ? 'Постамат' : 'Барабанный'}</strong></span>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>Колонок: <strong>{columnsCount}</strong></span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>Строк: <strong>{rowsCount}</strong></span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>Всего ячеек: <strong>{totalActiveCells}</strong></span>
              </div>
              {modelCells.type === 'drum' && modelCells.drums && modelCells.drums > 1 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>По барабанам:</span>
                  {Array.from({ length: modelCells.drums }, (_, i) => i + 1).map(drum => (
                    <div key={drum} style={{ marginTop: 4, marginLeft: 12 }}>
                      <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>
                        Барабан {drum}: <strong>{getDrumCellCount(drum)}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedConfigCells.size > 0 && (
            <div style={{ marginTop: 25, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6B7280' }}>Выбрано: {selectedConfigCells.size}</span>
              <button onClick={handleDeleteSelected} style={{ height: 40, borderRadius: 8, border: '1px solid #FF3052', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, color: '#FF3052' }}>Удалить выбранные</button>
              {selectedConfigCells.size >= 2 && <button onClick={handleMergeSelected} style={{ height: 40, borderRadius: 8, border: 'none', backgroundColor: '#666EFE', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, color: '#FFFFFF' }}>Объединить выбранные</button>}
              <button onClick={() => setSelectedConfigCells(new Set())} style={{ height: 40, borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, color: '#2D4059' }}>Снять выделение</button>
            </div>
          )}
        </div>

        <div style={{ ...blockStyle, flex: 1, height: 565, position: 'relative', padding: 20, overflow: 'auto' }}>
          <span style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>Сетка ячеек</span>
          <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#9CA3AF', marginLeft: 12 }}>(Ctrl+клик | ПКМ — разъединить/восстановить)</span>

          {modelCells?.type === 'drum' && modelCells.drums && modelCells.drums > 1 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              {Array.from({ length: modelCells.drums }).map((_, i) => (
                <button key={i} onClick={() => setSelectedDrum(i + 1)} style={{ width: 100, height: 36, borderRadius: 8, border: selectedDrum === i + 1 ? '2px solid #666EFE' : '1px solid rgba(102,110,254,0.15)', backgroundColor: selectedDrum === i + 1 ? '#F0F1FF' : '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, fontWeight: selectedDrum === i + 1 ? 600 : 400, color: selectedDrum === i + 1 ? '#666EFE' : '#2D4059' }}>Барабан {i + 1}</button>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            {modelCells && columnsCount > 0 && rowsCount > 0 ? (
              <div style={{ display: 'flex', gap: COL_GAP }}>
                {Array.from({ length: columnsCount }).map((_, cIdx) => {
                  const colCells: React.ReactNode[] = [];
                  Array.from({ length: rowsCount }).forEach((_, rIdx) => {
                    const modelCell = displayCells.find(c => c.column === cIdx + 1 && c.row === rIdx + 1);
                    if (!modelCell || renderedModelCells.has(modelCell.id)) return;
                    const configCell = modelCellToConfigMap.get(modelCell.id);
                    if (!configCell) return;

                    const isMerged = configCell.modelCellIds.length > 1;
                    const isDeleted = configCell.deleted;
                    const isSelected = !isDeleted && selectedConfigCells.has(configCell.id);
                    const isFirstInMerge = configCell.modelCellIds[0] === modelCell.id;
                    if (isMerged && !isFirstInMerge) return;

                    const cellWidth = modelCells.type === 'postamat' ? POSTAMAT_CELL_WIDTH : DRUM_CELL_SIZE;
                    const singleHeight = modelCells.type === 'postamat' ? Math.max(20, (484 - (rowsCount - 1) * GAP) / rowsCount) : DRUM_CELL_SIZE;
                    let mergeWidth = cellWidth;
                    let mergeHeight = singleHeight;

                    if (isMerged) {
                      const allMerged: CellData[] = configCell.modelCellIds.map(mid => modelCells.cells.find(c => c.id === mid)).filter((c): c is CellData => c !== undefined);
                      const mcols = [...new Set(allMerged.map(c => c.column!).filter(c => c !== undefined))];
                      const mrows = [...new Set(allMerged.map(c => c.row!).filter(r => r !== undefined))];
                      mergeWidth = cellWidth * mcols.length + COL_GAP * (mcols.length - 1);
                      mergeHeight = singleHeight * mrows.length + GAP * (mrows.length - 1);
                      allMerged.forEach(c => renderedModelCells.add(c.id));
                    }

                    if (isDeleted) {
                      colCells.push(
                        <div key={modelCell.id} onClick={(e) => handleCellClick(configCell.id, e)} onContextMenu={(e) => { e.preventDefault(); handleRestoreDeleted(configCell.id); }}
                          style={{ width: mergeWidth, height: mergeHeight, borderRadius: 3, border: '1px dashed rgba(45,64,89,0.15)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#9CA3AF' }}>—</span>
                        </div>
                      );
                      return;
                    }

                    const visibleRow = getVisibleRowIndex(cIdx + 1, rIdx + 1);
                    colCells.push(
                      <div key={modelCell.id} onClick={(e) => handleCellClick(configCell.id, e)} onContextMenu={(e) => { e.preventDefault(); if (isMerged) handleRestoreCell(configCell.id); }}
                        style={{ width: mergeWidth, height: mergeHeight, borderRadius: 3, border: isSelected ? '2px solid #666EFE' : '1px solid rgba(45,64,89,0.25)', backgroundColor: isMerged ? 'rgba(102,110,254,0.25)' : 'rgba(45,64,89,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFFFFF', fontFamily: 'Inter', cursor: 'pointer', userSelect: 'none' }}>
                        {cIdx + 1}-{visibleRow}
                        {isMerged && <span style={{ fontSize: 10, marginLeft: 4 }}>({configCell.modelCellIds.length})</span>}
                      </div>
                    );
                  });
                  return <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: GAP, position: 'relative' }}>{colCells}</div>;
                })}
              </div>
            ) : (
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#9CA3AF' }}>Выберите модель станции</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', gap: 30 }}>
        <button onClick={canSave ? handleSave : undefined} disabled={!canSave || isSaving} style={{ height: 51, borderRadius: 10, border: 'none', backgroundColor: canSave && !isSaving ? '#666EFE' : '#BCC8FF', cursor: canSave && !isSaving ? 'pointer' : 'not-allowed', padding: '0 30px', fontFamily: 'Inter', fontSize: 15, fontWeight: 400, color: '#FFFFFF' }}>{isSaving ? 'Сохранение...' : 'Записать'}</button>
        <button onClick={() => setShowClosePopup(true)} style={{ height: 51, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', padding: '0 24px', fontFamily: 'Inter', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть</button>
      </div>

      <CatalogSelectPopup isOpen={popupOpen} onClose={handlePopupClose} onSelect={handlePopupSelect} popupType={popupType} />

      {showClosePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowClosePopup(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Закрыть вкладку</h3>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>{canSave ? 'Сохранить изменения перед закрытием?' : 'Не все обязательные поля заполнены.'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {canSave && <button onClick={handleSaveAndClose} style={{ height: 44, borderRadius: 10, border: 'none', backgroundColor: '#666EFE', cursor: 'pointer', fontFamily: 'Inter', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Сохранить и закрыть</button>}
              <button onClick={handleCloseWithoutSaving} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть без сохранения</button>
              <button onClick={() => setShowClosePopup(false)} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationConfigurationCreatePage;