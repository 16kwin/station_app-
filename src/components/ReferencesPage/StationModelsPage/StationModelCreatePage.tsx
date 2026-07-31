// StationModelCreatePage.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTabs } from '../../../context/TabContext';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import CatalogSelectPopup from '../NomenclaturePage/CatalogSelectPopup';
import type { PopupType } from '../NomenclaturePage/CatalogSelectPopup';
import Icon7 from '../../../assets/References/NomenclatureCreatePage/Icon7.svg';
import Icon6 from '../../../assets/References/NomenclatureCreatePage/Icon6.svg';
import Icon10 from '../../../assets/References/NomenclatureCreatePage/Icon10.svg';
import Icon101 from '../../../assets/References/NomenclatureCreatePage/Icon101.svg';
import Icon21 from '../../../assets/References/NomenclatureCreatePage/Icon21.svg';
import Icon22 from '../../../assets/References/NomenclatureCreatePage/Icon22.svg';
import Icon31 from '../../../assets/References/NomenclatureCreatePage/Icon31.svg';
import Icon32 from '../../../assets/References/NomenclatureCreatePage/Icon32.svg';
import Icon51 from '../../../assets/References/NomenclatureCreatePage/Icon51.svg';
import Icon52 from '../../../assets/References/NomenclatureCreatePage/Icon52.svg';
import IconArt1 from '../../../assets/References/NomenclatureCreatePage/IconArt1.svg';
import IconArt2 from '../../../assets/References/NomenclatureCreatePage/IconArt2.svg';
import IconArrow from '../../../assets/References/NomenclatureCreatePage/IconArrow.svg';
import IconArrow2 from '../../../assets/References/NomenclatureCreatePage/IconArrow2.svg';

interface ImageItem {
  uid: string;
  url: string;
  originalName: string;
}

interface LocalImageItem {
  file: File;
  url: string;
}

interface CellData {
  id: string;
  column?: number;
  row?: number;
  drum?: number;
}

interface CellsStructure {
  type: 'postamat' | 'drum';
  columns?: number;
  cellsPerColumn?: number;
  drums?: number;
  columnsPerDrum?: number;
  rowsPerColumn?: number;
  cells: CellData[];
}

const DB_NAME = 'station_model_drafts_db';
const DB_VERSION = 1;
const STORE_NAME = 'draft_files';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFileToIndexedDB = async (key: string, file: File): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getFileFromIndexedDB = async (key: string): Promise<File | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const clearAllFilesForDraft = async (uid: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        if ((cursor.key as string).startsWith(`${uid}_`)) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getDraftKey = (uid: string) => `station_model_draft_${uid}`;

interface DraftData {
  uid: string;
  code: number;
  name: string;
  article: string;
  revision: string;
  typeId: string;
  typeName: string;
  manufacturerId: string;
  manufacturerName: string;
  purpose: string;
  gridType: 'postamat' | 'drum' | null;
  columns: number | null;
  cellsPerColumn: number | null;
  drums: number | null;
  columnsPerDrum: number | null;
  rowsPerColumn: number | null;
  selectedDrum: number;
  localImagesMeta: { key: string; fileName: string }[];
  isEdit: boolean;
  isDataSaved: boolean;
  timestamp: number;
}

const saveDraftToStorage = (uid: string, data: DraftData) => {
  try { localStorage.setItem(getDraftKey(uid), JSON.stringify(data)); } catch (e) { console.error(e); }
};

const loadDraftFromStorage = (uid: string): DraftData | null => {
  try {
    const raw = localStorage.getItem(getDraftKey(uid));
    if (!raw) return null;
    const data = JSON.parse(raw) as DraftData;
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) { clearDraftStorage(uid); return null; }
    return data;
  } catch (e) { clearDraftStorage(uid); return null; }
};

const clearDraftStorage = async (uid: string) => {
  localStorage.removeItem(getDraftKey(uid));
  await clearAllFilesForDraft(uid);
};

const ToggleSwitch: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => {
  const trackWidth = 26; const trackHeight = 13; const knobSize = 11; const padding = (trackHeight - knobSize) / 2;
  return (
    <div onClick={(e) => { e.stopPropagation(); onChange(); }} style={{ width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2, backgroundColor: value ? '#666EFE' : 'rgba(45, 64, 89, 0.44)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.3s ease' }}>
      <motion.div initial={false} animate={{ x: value ? trackWidth - knobSize - padding * 2 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }} style={{ width: knobSize, height: knobSize, borderRadius: '50%', backgroundColor: '#FFFFFF', position: 'absolute', top: padding, left: padding }} />
    </div>
  );
};

const StationModelCreatePage = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab } = useTabs();

  const [activeTab, setActiveTab] = useState(0);
  const [tabsCollapsed, setTabsCollapsed] = useState(false);

  const [name, setName] = useState('');
  const [article, setArticle] = useState('');
  const [revision, setRevision] = useState('');
  const [purpose, setPurpose] = useState('');
  const [typeId, setTypeId] = useState('');
  const [typeName, setTypeName] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [modelCode, setModelCode] = useState<number>(0);

  // Тип сетки: null = не выбрано, 'postamat', 'drum'
  const [gridType, setGridType] = useState<'postamat' | 'drum' | null>(null);
  const [columns, setColumns] = useState<number | null>(null);
  const [cellsPerColumn, setCellsPerColumn] = useState<number | null>(null);
  const [drums, setDrums] = useState<number | null>(null);
  const [columnsPerDrum, setColumnsPerDrum] = useState<number | null>(null);
  const [rowsPerColumn, setRowsPerColumn] = useState<number | null>(null);
  const [selectedDrum, setSelectedDrum] = useState<number>(1);
  const [cellsStructure, setCellsStructure] = useState<CellsStructure | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [localImages, setLocalImages] = useState<LocalImageItem[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  const getPopupOpenKey = () => `station_model_popup_open_${uid}`;
  const [popupOpen, setPopupOpen] = useState(() => sessionStorage.getItem(getPopupOpenKey()) === 'true');
  const [popupType, setPopupType] = useState<PopupType>('stationType');
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const clearFieldError = (fieldKey: string) => { setValidationErrors(prev => { const next = new Set(prev); next.delete(fieldKey); return next; }); };
  const getFieldBorderStyle = (fieldKey: string, isFilled: boolean, isFocused: boolean): string => {
    if (validationErrors.has(fieldKey) && !isFocused) return '2px solid #FF3052';
    if (isFilled || isFocused) return '1px solid #666EFE';
    return '1px solid rgba(102, 110, 254, 0.15)';
  };
  const getSelectBorderStyle = (fieldKey: string, isFilled: boolean): string => {
    if (validationErrors.has(fieldKey)) return '2px solid #FF3052';
    if (isFilled) return '1px solid #666EFE';
    return '1px solid rgba(102, 110, 254, 0.15)';
  };

  useEffect(() => { if (!contextMenu) return; const h = () => setContextMenu(null); document.addEventListener('click', h); return () => document.removeEventListener('click', h); }, [contextMenu]);

  const parseCellsStructure = (json: string | null): CellsStructure | null => {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
  };

  const generateCellsPreview = (): CellData[] => {
    const cells: CellData[] = [];
    if (gridType === 'postamat' && columns && cellsPerColumn) {
      for (let col = 1; col <= columns; col++) {
        for (let row = 1; row <= cellsPerColumn; row++) {
          cells.push({ id: `${col}-${row}`, column: col, row });
        }
      }
    }
    if (gridType === 'drum' && drums && columnsPerDrum && rowsPerColumn && selectedDrum) {
      for (let col = 1; col <= columnsPerDrum; col++) {
        for (let row = 1; row <= rowsPerColumn; row++) {
          cells.push({ id: `${selectedDrum}-${col}-${row}`, drum: selectedDrum, column: col, row });
        }
      }
    }
    return cells;
  };

  const fetchImages = async () => {
    if (!uid) return;
    try {
      const res = await AxiosService.get(ConstantInfo.restApiStationModelImages(uid));
      setImages((res.data || []).map((img: any) => ({ uid: img.uid, url: img.url ? ConstantInfo.fileDir + img.url.replace(/^\//, '') : '', originalName: img.originalName || '' })));
    } catch (e) { console.error(e); }
  };

  const saveDraftToLocalStorage = useCallback(async () => {
    if (!uid || !isDataLoaded) return;
    for (const img of localImages) { const key = `${uid}_img_${img.url}`; await saveFileToIndexedDB(key, img.file); }
    const draft: DraftData = { uid, code: modelCode, name, article, revision, typeId, typeName, manufacturerId, manufacturerName, purpose, gridType, columns, cellsPerColumn, drums, columnsPerDrum, rowsPerColumn, selectedDrum, localImagesMeta: localImages.map(img => ({ key: `${uid}_img_${img.url}`, fileName: img.file.name })), isEdit, isDataSaved, timestamp: Date.now() };
    saveDraftToStorage(uid, draft);
  }, [uid, modelCode, name, article, revision, typeId, typeName, manufacturerId, manufacturerName, purpose, gridType, columns, cellsPerColumn, drums, columnsPerDrum, rowsPerColumn, selectedDrum, localImages, isEdit, isDataSaved, isDataLoaded]);

  useEffect(() => { if (!uid || !isDataLoaded) return; const timer = setTimeout(() => { saveDraftToLocalStorage(); }, 500); return () => clearTimeout(timer); }, [saveDraftToLocalStorage, uid, isDataLoaded]);

  const restoreLocalFiles = useCallback(async (draft: DraftData) => {
    if (!uid) return;
    const restored: LocalImageItem[] = [];
    for (const meta of (draft.localImagesMeta || [])) { const file = await getFileFromIndexedDB(meta.key); if (file) restored.push({ file, url: URL.createObjectURL(file) }); }
    setLocalImages(restored);
  }, [uid]);

  const loadModelData = async (muid: string) => {
    setIsLoading(true);
    try {
      const d = (await AxiosService.get(ConstantInfo.restApiStationModel(muid))).data;
      setName(d.name || ''); setArticle(d.article || ''); setRevision(d.revision || ''); setPurpose(d.purpose || ''); setModelCode(d.code || 0);
      if (d.typeId) { setTypeId(d.typeId); setTypeName(d.typeName || ''); }
      if (d.manufacturerId) { setManufacturerId(d.manufacturerId); setManufacturerName(d.manufacturerName || ''); }
      const cs = parseCellsStructure(d.cellsStructure);
      if (cs) {
        setCellsStructure(cs);
        setGridType(cs.type);
        if (cs.type === 'postamat') { setColumns(cs.columns || null); setCellsPerColumn(cs.cellsPerColumn || null); }
        else if (cs.type === 'drum') { setDrums(cs.drums || null); setColumnsPerDrum(cs.columnsPerDrum || null); setRowsPerColumn(cs.rowsPerColumn || null); }
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!uid) return;
    const cp = window.location.pathname;
    const isEditMode = cp.includes('/edit/');
    setIsEdit(isEditMode);
    const init = async () => {
      if (isEditMode) {
        setIsDataSaved(true);
        await loadModelData(uid);
        await fetchImages();
        const draft = loadDraftFromStorage(uid);
        if (draft && draft.uid === uid && draft.isEdit) {
          setName(draft.name); setArticle(draft.article); setRevision(draft.revision); setPurpose(draft.purpose);
          setTypeId(draft.typeId); setTypeName(draft.typeName); setManufacturerId(draft.manufacturerId); setManufacturerName(draft.manufacturerName);
          setModelCode(draft.code);
          setGridType(draft.gridType); setColumns(draft.columns); setCellsPerColumn(draft.cellsPerColumn);
          setDrums(draft.drums); setColumnsPerDrum(draft.columnsPerDrum); setRowsPerColumn(draft.rowsPerColumn);
          setSelectedDrum(draft.selectedDrum || 1);
          setIsDataSaved(draft.isDataSaved);
          await restoreLocalFiles(draft);
        }
        setIsDataLoaded(true);
      } else {
        setIsDataSaved(false);
        const draft = loadDraftFromStorage(uid);
        if (draft && draft.uid === uid) {
          setName(draft.name); setArticle(draft.article); setRevision(draft.revision); setPurpose(draft.purpose);
          setTypeId(draft.typeId); setTypeName(draft.typeName); setManufacturerId(draft.manufacturerId); setManufacturerName(draft.manufacturerName);
          setModelCode(draft.code);
          setGridType(draft.gridType); setColumns(draft.columns); setCellsPerColumn(draft.cellsPerColumn);
          setDrums(draft.drums); setColumnsPerDrum(draft.columnsPerDrum); setRowsPerColumn(draft.rowsPerColumn);
          setSelectedDrum(draft.selectedDrum || 1);
          setIsDataSaved(draft.isDataSaved);
          await restoreLocalFiles(draft);
        }
        setIsDataLoaded(true);
      }
    };
    init();
  }, [uid]);

  const handleSave = async () => {
    if (!uid) return;
    setIsSaving(true);
    try {
      const body: any = { uid, name: name.trim(), article: article.trim(), revision: revision.trim(), purpose: purpose.trim(), typeId: typeId || null, manufacturerId: manufacturerId || null };
      if (gridType === 'postamat') { body.columns = columns; body.cellsPerColumn = cellsPerColumn; }
      else if (gridType === 'drum') { body.drums = drums; body.columnsPerDrum = columnsPerDrum; body.rowsPerColumn = rowsPerColumn; }
      if (isEdit && isDataSaved) { await AxiosService.patch(`${ConstantInfo.restApiStationModels}/${uid}`, body); }
      else { await AxiosService.post(ConstantInfo.restApiStationModels, body); setIsDataSaved(true); }
      for (const img of localImages) { const fd = new FormData(); fd.append('file', img.file); await AxiosService.post(ConstantInfo.restApiStationModelImages(uid), fd); }
      setLocalImages([]);
      await fetchImages();
      await clearDraftStorage(uid);
      if (uid) sessionStorage.removeItem(getPopupOpenKey());
      if (!isEdit) { setIsEdit(true); navigate(`/references/station-models/edit/${uid}`, { replace: true }); }
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleClose = () => { const t = tabs.find(tab => tab.id === activeTabId); if (t) closeTab(t.id); if (uid) sessionStorage.removeItem(getPopupOpenKey()); };
  const handleCloseWithoutSaving = async () => { if (uid) { await clearDraftStorage(uid); sessionStorage.removeItem(getPopupOpenKey()); } handleClose(); };
  const handleSaveAndClose = async () => { await handleSave(); handleClose(); };
  const openPopup = (type: PopupType) => { setPopupType(type); setPopupOpen(true); if (uid) sessionStorage.setItem(getPopupOpenKey(), 'true'); };
  const handlePopupSelect = (id: string, nm: string) => {
    switch (popupType) {
      case 'stationType': setTypeName(nm); setTypeId(id); setValidationErrors(p => { const n = new Set(p); n.delete('type'); return n; }); break;
      case 'stationManufacturer': setManufacturerName(nm); setManufacturerId(id); setValidationErrors(p => { const n = new Set(p); n.delete('manufacturer'); return n; }); break;
    }
  };
  const handlePopupClose = () => { setPopupOpen(false); if (uid) sessionStorage.removeItem(getPopupOpenKey()); };
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (!files) return; const imgs: LocalImageItem[] = []; for (let i = 0; i < files.length; i++) { imgs.push({ file: files[i], url: URL.createObjectURL(files[i]) }); } setLocalImages(p => [...p, ...imgs]); if (localFileInputRef.current) localFileInputRef.current.value = ''; };
  const handleLocalDeleteImage = (index: number) => { setLocalImages(p => { const n = [...p]; URL.revokeObjectURL(n[index].url); n.splice(index, 1); return n; }); if (selectedImageIndex >= (localImages || []).length - 1) setSelectedImageIndex(Math.max(0, (localImages || []).length - 2)); };
  const handleImageContextMenu = (e: React.MouseEvent, index: number) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, index }); };
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedImageIndex(p => p > 0 ? p - 1 : displayImages.length - 1); };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedImageIndex(p => p < displayImages.length - 1 ? p + 1 : 0); };

  const canSave = name.trim().length > 0;
  const displayImages = localImages.length > 0 ? localImages.map(img => ({ uid: img.url, url: img.url, originalName: img.file.name })) : images;
  const cellsPreview = generateCellsPreview();

  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' };
  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const fieldBaseStyle: React.CSSProperties = { width: 340, height: 44, borderRadius: 10, marginTop: 11, display: 'flex', alignItems: 'center', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, outline: 'none', backgroundColor: '#FFFFFF', position: 'relative', boxSizing: 'border-box' };
  const buttonStyle = (isActive: boolean): React.CSSProperties => ({ width: 151, height: 40, borderRadius: 10, backgroundColor: isActive ? '#666EFE' : '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: isActive ? '#FFFFFF' : '#2D4059', transition: 'all 0.3s ease', position: 'relative', paddingLeft: 21 });

  // Размеры ячеек
  const POSTAMAT_CELL_WIDTH = 160;
  const POSTAMAT_CELL_HEIGHT = 484 / (cellsPerColumn || 1) - 6; // минус отступы
  const DRUM_CELL_SIZE = 60;
  const GAP = 6;
  const COL_GAP = 50;

  if (isLoading) return (<div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>);

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>{isEdit ? name || 'Модель станции' : 'Справочник: Модели станций (Создание)'}</h1>
      <button onClick={() => setShowClosePopup(true)} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} /></button>

      {/* Табы */}
      <div style={{ position: 'absolute', top: 99, left: 60, right: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 25, alignItems: 'center' }}>
          <button onClick={() => setActiveTab(0)} style={buttonStyle(activeTab === 0)}><span>Основное</span>
            <button onClick={(e) => { e.stopPropagation(); setTabsCollapsed(!tabsCollapsed); }} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', width: 6, height: 10, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
              <motion.img src={activeTab === 0 ? IconArrow : IconArrow2} alt="" style={{ width: 6, height: 10 }} animate={{ rotate: tabsCollapsed ? 0 : 180 }} transition={{ duration: 0.3 }} />
            </button>
          </button>
          <AnimatePresence>
            {!tabsCollapsed && (
              <motion.button key="cells" onClick={() => setActiveTab(1)} style={buttonStyle(activeTab === 1)} initial={{ width: 0, opacity: 0, marginRight: -25 }} animate={{ width: 151, opacity: 1, marginRight: 0 }} exit={{ width: 0, opacity: 0, marginRight: -25 }} transition={{ duration: 0.3 }}>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>Сетка ячеек</motion.span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {activeTab === 0 ? (
        <div style={{ position: 'absolute', top: 154, left: 30, right: 30, bottom: 86, display: 'flex', gap: 30 }}>
          <div style={{ ...blockStyle, width: 792, height: 565, flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, left: 30 }}>
              <span style={labelStyle}>Код:</span><div style={{ ...fieldBaseStyle, backgroundColor: '#F5F6FA', border: '1px solid rgba(102, 110, 254, 0.5)', cursor: 'not-allowed' }}><span style={{ marginLeft: 0, color: '#666EFE', opacity: 0.5 }}>{String(modelCode).padStart(4, '0')}</span></div>
              <div style={{ marginTop: 25 }}><span style={labelStyle}>Артикул:</span><div style={{ ...fieldBaseStyle, border: '1px solid rgba(102, 110, 254, 0.15)' }}><img src={article ? IconArt2 : IconArt1} alt="" style={{ width: 20, height: 20, position: 'absolute', left: 13 }} /><input style={{ width: 'calc(100% - 50px)', height: '100%', border: 'none', outline: 'none', marginLeft: 44, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: article ? '#666EFE' : '#A0A3BD', backgroundColor: 'transparent' }} value={article} onChange={e => setArticle(e.target.value)} placeholder="Артикул" />{article && <button onClick={() => setArticle('')} style={{ position: 'absolute', right: 13, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon6} alt="Очистить" style={{ width: 18, height: 18 }} /></button>}</div></div>
              <div style={{ marginTop: 25 }}><span style={labelStyle}>Ревизия:</span><div style={{ ...fieldBaseStyle, border: '1px solid rgba(102, 110, 254, 0.15)' }}><input style={{ width: '100%', height: '100%', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: revision ? '#666EFE' : '#A0A3BD', backgroundColor: 'transparent' }} value={revision} onChange={e => setRevision(e.target.value)} placeholder="Ревизия" />{revision && <button onClick={() => setRevision('')} style={{ position: 'absolute', right: 13, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon6} alt="Очистить" style={{ width: 18, height: 18 }} /></button>}</div></div>
            </div>
            <div style={{ position: 'absolute', top: 40, right: 52 }}>
              <span style={labelStyle}>Наименование:</span><div style={{ ...fieldBaseStyle, border: getFieldBorderStyle('name', !!name.trim(), nameFocused) }}><img src={name ? Icon22 : Icon21} alt="" style={{ width: 16, height: 16, position: 'absolute', left: 14 }} /><input style={{ width: 'calc(100% - 50px)', height: '100%', border: 'none', outline: 'none', marginLeft: 44, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: name ? '#666EFE' : '#A0A3BD', backgroundColor: 'transparent' }} value={name} onChange={e => { setName(e.target.value); clearFieldError('name'); }} onFocus={() => { setNameFocused(true); clearFieldError('name'); }} onBlur={() => setNameFocused(false)} placeholder="Введите название" />{name && <button onClick={() => setName('')} style={{ position: 'absolute', right: 13, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon6} alt="Очистить" style={{ width: 18, height: 18 }} /></button>}</div>
              <div style={{ marginTop: 25 }}><span style={labelStyle}>Тип станции:</span><div onClick={() => { clearFieldError('type'); openPopup('stationType'); }} style={{ ...fieldBaseStyle, cursor: 'pointer', border: getSelectBorderStyle('type', !!typeId) }}><img src={typeId ? Icon32 : Icon31} alt="" style={{ width: 14.5, height: 18, position: 'absolute', left: 15 }} /><span style={{ marginLeft: 44, color: typeId ? '#666EFE' : '#A0A3BD' }}>{typeName || 'Выберите тип'}</span></div></div>
              <div style={{ marginTop: 25 }}><span style={labelStyle}>Производитель:</span><div onClick={() => { clearFieldError('manufacturer'); openPopup('stationManufacturer'); }} style={{ ...fieldBaseStyle, cursor: 'pointer', border: getSelectBorderStyle('manufacturer', !!manufacturerId) }}><img src={manufacturerId ? Icon32 : Icon31} alt="" style={{ width: 14.5, height: 18, position: 'absolute', left: 15 }} /><span style={{ marginLeft: 44, color: manufacturerId ? '#666EFE' : '#A0A3BD' }}>{manufacturerName || 'Выберите производителя'}</span></div></div>
            </div>
            <div style={{ position: 'absolute', top: 370, left: 30, right: 30 }}><span style={labelStyle}>Назначение:</span><div style={{ width: 732, height: 150, borderRadius: 10, border: purpose ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', marginTop: 11, position: 'relative' }}><img src={purpose ? Icon52 : Icon51} alt="" style={{ width: 16, height: 16, position: 'absolute', top: 15, left: 15 }} /><textarea style={{ width: '100%', height: '100%', border: 'none', outline: 'none', paddingTop: 15, paddingLeft: 44, paddingRight: 40, paddingBottom: 15, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: purpose ? '#666EFE' : '#A0A3BD', backgroundColor: 'transparent', resize: 'none', borderRadius: 10, boxSizing: 'border-box' }} value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Введите назначение" />{purpose && <button onClick={() => setPurpose('')} style={{ position: 'absolute', top: 15, right: 13, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon6} alt="Очистить" style={{ width: 18, height: 18 }} /></button>}</div></div>
          </div>
          <div style={{ ...blockStyle, width: 413, height: 565, flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, left: 30 }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' }}>Изображение</span></div>
            <div style={{ position: 'absolute', top: 49, left: 30, width: 353, height: 400, border: '1px solid rgba(230, 232, 248, 0.44)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 351, height: 47, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(230, 232, 248, 0.44)', cursor: 'pointer' }} onClick={() => localFileInputRef.current?.click()}><img src={Icon10} alt="Добавить" style={{ width: 21, height: 21 }} /></div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#FAFBFC' }}>
                {displayImages.length > 1 && <button onClick={prevImage} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 19, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, zIndex: 1 }}><img src={Icon101} alt="" style={{ width: 13, height: 19, transform: 'scaleX(-1)' }} /></button>}
                {displayImages.length > 0 ? (<div onContextMenu={(e) => handleImageContextMenu(e, selectedImageIndex)} style={{ width: 231, height: 193, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}><img src={displayImages[selectedImageIndex]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>) : (<span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9CA3AF' }}>Нет изображений</span>)}
                {displayImages.length > 1 && <button onClick={nextImage} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 19, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, zIndex: 1 }}><img src={Icon101} alt="" style={{ width: 13, height: 19 }} /></button>}
              </div>
              <div style={{ width: 351, height: 47, display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 6, borderTop: '1px solid rgba(230, 232, 248, 0.44)', overflowX: 'auto' }}>{displayImages.map((img, idx) => (<div key={idx} onClick={() => setSelectedImageIndex(idx)} onContextMenu={(e) => handleImageContextMenu(e, idx)} style={{ width: 43, height: 36, borderRadius: 4, border: idx === selectedImageIndex ? '2px solid #666EFE' : '2px solid transparent', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative', backgroundColor: '#F5F6FA' }}><img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>))}</div>
            </div>
            <input ref={localFileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleLocalImageUpload} />
          </div>
        </div>
      ) : (
        /* ВКЛАДКА СЕТКА ЯЧЕЕК */
        <div style={{ position: 'absolute', top: 154, left: 30, right: 30, bottom: 86, display: 'flex', gap: 30 }}>
          {/* Левая панель параметров */}
          <div style={{ ...blockStyle, width: 380, height: 565, flexShrink: 0, position: 'relative', padding: 30 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>Тип сетки</span>
            
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div onClick={() => { setGridType('postamat'); setDrums(null); setColumnsPerDrum(null); setRowsPerColumn(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Постамат</span>
                <ToggleSwitch value={gridType === 'postamat'} onChange={() => { setGridType(gridType === 'postamat' ? null : 'postamat'); if (gridType !== 'postamat') { setDrums(null); setColumnsPerDrum(null); setRowsPerColumn(null); } }} />
              </div>
              <div onClick={() => { setGridType('drum'); setColumns(null); setCellsPerColumn(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Барабанный</span>
                <ToggleSwitch value={gridType === 'drum'} onChange={() => { setGridType(gridType === 'drum' ? null : 'drum'); if (gridType !== 'drum') { setColumns(null); setCellsPerColumn(null); } }} />
              </div>
            </div>

            {gridType === 'postamat' && (
              <div style={{ marginTop: 25 }}>
                <span style={labelStyle}>Параметры постамата</span>
                <div style={{ display: 'flex', gap: 15, marginTop: 11 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Колонок</span>
                    <input type="number" min={1} max={10} value={columns ?? ''} onChange={e => setColumns(e.target.value ? parseInt(e.target.value) : null)} style={{ ...fieldBaseStyle, width: '100%' }} placeholder="0" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Ячеек в колонке</span>
                    <input type="number" min={1} max={20} value={cellsPerColumn ?? ''} onChange={e => setCellsPerColumn(e.target.value ? parseInt(e.target.value) : null)} style={{ ...fieldBaseStyle, width: '100%' }} placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {gridType === 'drum' && (
              <div style={{ marginTop: 25 }}>
                <span style={labelStyle}>Параметры барабана</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 11 }}>
                  <div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Барабанов</span>
                    <input type="number" min={1} max={10} value={drums ?? ''} onChange={e => { setDrums(e.target.value ? parseInt(e.target.value) : null); setSelectedDrum(1); }} style={{ ...fieldBaseStyle, width: '100%' }} placeholder="0" />
                  </div>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Колонок в барабане</span>
                      <input type="number" min={1} max={10} value={columnsPerDrum ?? ''} onChange={e => setColumnsPerDrum(e.target.value ? parseInt(e.target.value) : null)} style={{ ...fieldBaseStyle, width: '100%' }} placeholder="0" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Строк в колонке</span>
                      <input type="number" min={1} max={10} value={rowsPerColumn ?? ''} onChange={e => setRowsPerColumn(e.target.value ? parseInt(e.target.value) : null)} style={{ ...fieldBaseStyle, width: '100%' }} placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280' }}>
                Всего ячеек: <strong style={{ color: '#2D4059' }}>{cellsPreview.length}</strong>
                {gridType === 'drum' && drums && ` (барабан ${selectedDrum}: ${cellsPreview.length})`}
              </span>
            </div>
          </div>

          {/* Визуализация сетки */}
          <div style={{ ...blockStyle, flex: 1, height: 565, position: 'relative', padding: 20, overflow: 'auto' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>Предпросмотр сетки</span>

            {/* Переключатель барабанов */}
            {gridType === 'drum' && drums && drums > 1 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Array.from({ length: drums }).map((_, i) => (
                  <button key={i} onClick={() => setSelectedDrum(i + 1)} style={{ width: 100, height: 36, borderRadius: 8, border: selectedDrum === i + 1 ? '2px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: selectedDrum === i + 1 ? '#F0F1FF' : '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: selectedDrum === i + 1 ? 600 : 400, color: selectedDrum === i + 1 ? '#666EFE' : '#2D4059' }}>Барабан {i + 1}</button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              {gridType === 'postamat' && columns && cellsPerColumn ? (
                <div style={{ display: 'flex', gap: COL_GAP }}>
                  {Array.from({ length: columns }).map((_, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                      {Array.from({ length: cellsPerColumn }).map((_, rIdx) => (
                        <div key={rIdx} style={{ width: POSTAMAT_CELL_WIDTH, height: Math.max(20, (484 - (cellsPerColumn - 1) * GAP) / cellsPerColumn), borderRadius: 3, border: '1px solid rgba(45, 64, 89, 0.25)', backgroundColor: 'rgba(45, 64, 89, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFFFFF', fontFamily: 'Inter' }}>{cIdx + 1}-{rIdx + 1}</div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : gridType === 'drum' && drums && columnsPerDrum && rowsPerColumn ? (
                <div style={{ display: 'flex', gap: COL_GAP }}>
                  {Array.from({ length: columnsPerDrum }).map((_, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                      {Array.from({ length: rowsPerColumn }).map((_, rIdx) => (
                        <div key={rIdx} style={{ width: DRUM_CELL_SIZE, height: DRUM_CELL_SIZE, borderRadius: 3, border: '1px solid rgba(45, 64, 89, 0.25)', backgroundColor: 'rgba(45, 64, 89, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#FFFFFF', fontFamily: 'Inter' }}>{selectedDrum}-{cIdx + 1}-{rIdx + 1}</div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9CA3AF' }}>Задайте параметры сетки</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Нижние кнопки */}
      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', alignItems: 'center', gap: 30 }}>
        <button style={{ height: 51, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059' }}>Синхронизировать</button>
        <button onClick={canSave ? handleSave : undefined} disabled={!canSave || isSaving} style={{ height: 51, borderRadius: 10, border: 'none', backgroundColor: canSave && !isSaving ? '#666EFE' : '#BCC8FF', cursor: canSave && !isSaving ? 'pointer' : 'not-allowed', padding: '0 30px', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF' }}>{isSaving ? 'Сохранение...' : 'Записать'}</button>
        <button onClick={() => setShowClosePopup(true)} style={{ height: 51, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', padding: '0 24px', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть</button>
      </div>

      {contextMenu && (<div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 150, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}><button onClick={() => { handleLocalDeleteImage(contextMenu.index); setContextMenu(null); }} style={{ width: '100%', height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Удалить</button></div>)}
      <CatalogSelectPopup isOpen={popupOpen} onClose={handlePopupClose} onSelect={handlePopupSelect} popupType={popupType} />
      {showClosePopup && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowClosePopup(false)}><div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Закрыть вкладку</h3><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>{canSave ? 'Сохранить изменения перед закрытием?' : 'Не все обязательные поля заполнены.'}</p><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{canSave && <button onClick={handleSaveAndClose} style={{ height: 44, borderRadius: 10, border: 'none', backgroundColor: '#666EFE', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Сохранить и закрыть</button>}<button onClick={handleCloseWithoutSaving} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть без сохранения</button><button onClick={() => setShowClosePopup(false)} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}
    </div>
  );
};

export default StationModelCreatePage;