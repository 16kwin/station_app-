// TemplatesPage.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import TemplateCreateGroupPopup from './TemplateCreateGroupPopup';
import CatalogSelectPopup from '../NomenclaturePage/CatalogSelectPopup';
import { useTabs } from '../../../context/TabContext';
import Icon1 from '../../../assets/References/Icon1.svg';
import Icon2 from '../../../assets/References/Icon2.svg';
import Icon3 from '../../../assets/References/Icon3.svg';
import Icon4 from '../../../assets/References/Icon4.svg';
import Icon6 from '../../../assets/References/Icon6.svg';
import Icon7 from '../../../assets/References/Icon7.svg';
import Icon8 from '../../../assets/References/Icon8.svg';
import Icon9 from '../../../assets/References/Icon9.svg';
import Icon10 from '../../../assets/References/Icon10.svg';
import Icon17 from '../../../assets/References/Icon17.svg';
import Icon18 from '../../../assets/References/Icon18.svg';
import Icon19 from '../../../assets/References/Icon19.svg';
import Icon22 from '../../../assets/References/Icon22.svg';
import Icon23 from '../../../assets/References/Icon23.svg';
import Icon24 from '../../../assets/References/Icon24.svg';
import Icon25 from '../../../assets/References/Icon25.svg';
import IconOpen from '../../../assets/References/IconOpen.svg';
import Iconn2 from '../../../assets/Station/Iconn2.svg';
import Iconn3 from '../../../assets/Station/Iconn3.svg';
import Icon31 from '../../../assets/References/NomenclatureCreatePage/Icon31.svg';
import Icon32 from '../../../assets/References/NomenclatureCreatePage/Icon32.svg';
import PopupIcon2 from '../../../assets/Station/PopupIcon2.svg';
import PopupIcon4 from '../../../assets/Station/PopupIcon4.svg';
import PopupIcon7 from '../../../assets/Station/PopupIcon7.svg';

interface TemplateItem {
  uid: string;
  name: string;
  number: number | null;
  categoryId: number | null;
  categoryName: string | null;
  configuration: string | null;
  configurationName: string | null;
  modelName: string | null;
  totalCells: number;
  filledCells: number;
  freeCells: number;
  createdAt: string;
  active: boolean;
  stationNames: string[];
}

interface CategoryItem {
  id: number;
  uid: string;
  name: string;
  templates: TemplateItem[];
}

type ContextMenuType = 'category' | 'template';

interface ContextMenuState {
  x: number;
  y: number;
  uid: string;
  name: string;
  type: ContextMenuType;
  categoryId?: number;
}

const ToggleSwitch: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => {
  const trackWidth = 26; const trackHeight = 13; const knobSize = 11; const padding = (trackHeight - knobSize) / 2;
  return (
    <div onClick={(e) => { e.stopPropagation(); onChange(); }} style={{ width: trackWidth, height: trackHeight, borderRadius: trackHeight / 2, backgroundColor: value ? '#666EFE' : 'rgba(45, 64, 89, 0.44)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.3s ease' }}>
      <motion.div initial={false} animate={{ x: value ? trackWidth - knobSize - padding * 2 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }} style={{ width: knobSize, height: knobSize, borderRadius: '50%', backgroundColor: '#FFFFFF', position: 'absolute', top: padding, left: padding }} />
    </div>
  );
};

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { activeTabId } = useTabs();
  const tabIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'templates' | 'category'>('templates');
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showCopySelectPopup, setShowCopySelectPopup] = useState(false);
  const [showMoveSelectPopup, setShowMoveSelectPopup] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [renameUid, setRenameUid] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renameType, setRenameType] = useState<'category' | 'template'>('category');
  const [isRenaming, setIsRenaming] = useState(false);
  const contextMenuUidRef = useRef<string | null>(null);

  const [showCreateTemplatePopup, setShowCreateTemplatePopup] = useState(false);
  const [createTemplateName, setCreateTemplateName] = useState('');
  const [createTemplateCategoryId, setCreateTemplateCategoryId] = useState<number | null>(null);
  const [createTemplateCategoryName, setCreateTemplateCategoryName] = useState('');
  const [createTemplateModelUid, setCreateTemplateModelUid] = useState('');
  const [createTemplateModelName, setCreateTemplateModelName] = useState('');
  const [createTemplateConfigUid, setCreateTemplateConfigUid] = useState('');
  const [createTemplateConfigName, setCreateTemplateConfigName] = useState('');
  const [showCreateCategorySelect, setShowCreateCategorySelect] = useState(false);
  const [showCreateModelSelect, setShowCreateModelSelect] = useState(false);
  const [showCreateConfigSelect, setShowCreateConfigSelect] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [stationListData, setStationListData] = useState<{ isOpen: boolean; stationNames: string[]; templateName: string }>({ isOpen: false, stationNames: [], templateName: '' });

  const TABLE_WIDTH = 1720;
  const TABLE_HEIGHT = 638;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 10;

  // Колонки: НАИМЕНОВАНИЕ | КОД | КОНФИГУРАЦИЯ | МОДЕЛЬ | СТАНЦИЯ | СТАТУС | ДАТА
  const COL_NAME = 85;
  const COL_CODE = 380;
  const COL_CONFIG = 580;
  const COL_MODEL = 800;
  const COL_STATION = 1020;
  const COL_STATUS = 1370;
  const COL_DATE = 1511;

  useEffect(() => {
    tabIdRef.current = activeTabId;
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, tempsRes] = await Promise.all([
        AxiosService.get(ConstantInfo.restApiTemplatesCategories),
        AxiosService.get(ConstantInfo.restApiTemplates),
      ]);

      const cats: any[] = catsRes.data;
      const temps: TemplateItem[] = tempsRes.data;

      const catMap = new Map<number, TemplateItem[]>();
      const uncategorized: TemplateItem[] = [];

      temps.forEach((t: TemplateItem) => {
        if (t.categoryId != null) {
          if (!catMap.has(t.categoryId)) catMap.set(t.categoryId, []);
          catMap.get(t.categoryId)!.push(t);
        } else {
          uncategorized.push(t);
        }
      });

      const result: CategoryItem[] = cats.map((c: any) => ({
        id: c.id,
        uid: c.uid,
        name: c.name,
        templates: catMap.get(c.id) || [],
      }));

      if (uncategorized.length > 0) {
        result.push({
          id: 0,
          uid: 'uncategorized',
          name: 'Без категории',
          templates: uncategorized,
        });
      }

      setCategories(result);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTabId && activeTabId === tabIdRef.current && categories.length > 0) {
      fetchData();
    }
  }, [activeTabId]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const getFilteredCategories = (): CategoryItem[] => {
    if (!showActiveOnly) return categories;
    
    return categories.map(cat => ({
      ...cat,
      templates: cat.templates.filter(t => t.active)
    })).filter(cat => cat.templates.length > 0 || cat.id === 0);
  };

  const filteredCategories = getFilteredCategories();

  const currentCategory = currentCategoryId !== null
    ? filteredCategories.find(c => c.id === currentCategoryId) || null
    : null;

  const enterCategory = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    setSelectedIds(new Set());
  };

  const goBack = () => {
    setCurrentCategoryId(null);
    setSelectedIds(new Set());
  };

  const getCurrentLevelUids = (): string[] => {
    if (currentCategory) return currentCategory.templates.map(t => t.uid);
    return [];
  };

  const isHeaderSelected = (): boolean => {
    if (currentCategory) {
      const allUids = getCurrentLevelUids();
      if (allUids.length === 0) return false;
      return allUids.every(uid => selectedIds.has(uid));
    }
    return false;
  };

  const toggleSelectAll = () => {
    if (!currentCategory) return;
    const allUids = getCurrentLevelUids();
    if (allUids.length === 0) return;
    const allSelected = allUids.every(uid => selectedIds.has(uid));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) allUids.forEach(uid => next.delete(uid));
      else allUids.forEach(uid => next.add(uid));
      return next;
    });
  };

  const toggleSelectItem = (uid: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, uid: string, name: string, type: ContextMenuType, categoryId?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, uid, name, type, categoryId });
  };

  const isMultipleSelected = (uid: string): boolean => {
    return selectedIds.size > 1 && selectedIds.has(uid);
  };

  const handleContextMove = () => {
    if (!contextMenu) return;
    if (isMultipleSelected(contextMenu.uid)) {
      setContextMenu(null);
      setTimeout(() => setShowMoveSelectPopup(true), 50);
    } else {
      contextMenuUidRef.current = contextMenu.uid;
      setSelectedIds(prev => new Set(prev).add(contextMenu.uid));
      setContextMenu(null);
      setTimeout(() => setShowMoveSelectPopup(true), 50);
    }
  };

  const handleContextCopy = () => {
    if (!contextMenu) return;
    if (isMultipleSelected(contextMenu.uid)) {
      setContextMenu(null);
      setTimeout(() => setShowCopyPopup(true), 50);
    } else {
      contextMenuUidRef.current = contextMenu.uid;
      setSelectedIds(prev => new Set(prev).add(contextMenu.uid));
      setContextMenu(null);
      setTimeout(() => setShowCopyPopup(true), 50);
    }
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'category') {
      const cat = categories.find(c => c.uid === contextMenu.uid);
      if (cat) {
        setDeleteTarget('category');
        setDeleteCategoryId(cat.id);
        setContextMenu(null);
        setTimeout(() => setShowDeleteConfirm(true), 50);
        return;
      }
    }
    if (isMultipleSelected(contextMenu.uid)) {
      setDeleteTarget('templates');
      setDeleteCategoryId(null);
      setContextMenu(null);
      setTimeout(() => setShowDeleteConfirm(true), 50);
    } else {
      contextMenuUidRef.current = contextMenu.uid;
      setSelectedIds(prev => new Set(prev).add(contextMenu.uid));
      setDeleteTarget('templates');
      setDeleteCategoryId(null);
      setContextMenu(null);
      setTimeout(() => setShowDeleteConfirm(true), 50);
    }
  };

  const handleContextRename = () => {
    if (!contextMenu) return;
    const { uid, name, type } = contextMenu;
    setContextMenu(null);
    setRenameUid(uid);
    setRenameName(name);
    setRenameType(type);
    setShowRenamePopup(true);
  };

  const handleContextOpen = () => {
    if (!contextMenu) return;
    const { uid } = contextMenu;
    setContextMenu(null);
    navigate(`/documents/schablon/${uid}`);
  };

  const handleContextCreateTemplate = () => {
    if (!contextMenu) return;
    const { categoryId, name: categoryName } = contextMenu;
    setContextMenu(null);
    setCreateTemplateName('');
    setCreateTemplateCategoryId(categoryId || null);
    setCreateTemplateCategoryName(categoryId ? categoryName : '');
    setCreateTemplateModelUid('');
    setCreateTemplateModelName('');
    setCreateTemplateConfigUid('');
    setCreateTemplateConfigName('');
    setShowCreateTemplatePopup(true);
  };

  const handleCreateTemplateFromToolbar = () => {
    setCreateTemplateName('');
    setCreateTemplateCategoryId(currentCategoryId);
    setCreateTemplateCategoryName(currentCategory?.name || '');
    setCreateTemplateModelUid('');
    setCreateTemplateModelName('');
    setCreateTemplateConfigUid('');
    setCreateTemplateConfigName('');
    setShowCreateTemplatePopup(true);
  };

  const handleCreateTemplateSubmit = async () => {
    if (!createTemplateName.trim()) return;
    setIsCreatingTemplate(true);
    try {
      const body: any = { name: createTemplateName.trim(), configuration: '' };
      if (createTemplateCategoryId && createTemplateCategoryId !== 0) {
        body.categoryId = createTemplateCategoryId;
      }
      if (createTemplateConfigUid) {
        body.configurationUid = createTemplateConfigUid;
      }
      await AxiosService.post(ConstantInfo.restApiTemplates, body);
      await fetchData();
      setShowCreateTemplatePopup(false);
      setCreateTemplateName('');
      setCreateTemplateCategoryId(null);
      setCreateTemplateCategoryName('');
      setCreateTemplateModelUid('');
      setCreateTemplateModelName('');
      setCreateTemplateConfigUid('');
      setCreateTemplateConfigName('');
    } catch (error) {
      console.error('Ошибка создания шаблона:', error);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleCreateCategorySelect = (id: string, name: string) => {
    const numId = parseInt(id);
    setCreateTemplateCategoryId(isNaN(numId) || numId === 0 ? null : numId);
    setCreateTemplateCategoryName(name);
    setShowCreateCategorySelect(false);
  };

  const handleCreateModelSelect = (id: string, name: string) => {
    setCreateTemplateModelUid(id);
    setCreateTemplateModelName(name);
    setCreateTemplateConfigUid('');
    setCreateTemplateConfigName('');
    setShowCreateModelSelect(false);
  };

  const handleCreateConfigSelect = (id: string, name: string) => {
    setCreateTemplateConfigUid(id);
    setCreateTemplateConfigName(name);
    setShowCreateConfigSelect(false);
  };

  const handleRenameSubmit = async () => {
    if (!renameUid || !renameName.trim()) return;
    setIsRenaming(true);
    try {
      if (renameType === 'category') {
        const cat = categories.find(c => c.uid === renameUid);
        if (cat && cat.id !== 0) {
          await AxiosService.put(ConstantInfo.restApiTemplatesCategory(cat.id), { name: renameName.trim() });
        }
      } else {
        await AxiosService.put(ConstantInfo.restApiTemplate(renameUid), { name: renameName.trim() });
      }
      await fetchData();
      setShowRenamePopup(false);
      setRenameUid(null);
      setRenameName('');
    } catch (error) {
      console.error('Ошибка переименования:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCreateGroupClick = () => {
    setShowCreateGroup(true);
  };

  const handleCreateGroup = async (groupName: string) => {
    setIsCreatingGroup(true);
    try {
      await AxiosService.post(ConstantInfo.restApiTemplatesCategories, { name: groupName });
      await fetchData();
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Ошибка создания категории:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setDeleteTarget('templates');
    setDeleteCategoryId(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget === 'category' && deleteCategoryId) {
        await AxiosService.delete(ConstantInfo.restApiTemplatesCategory(deleteCategoryId));
      } else {
        const validUids = Array.from(selectedIds).filter(uid => uid !== 'uncategorized');
        for (const uid of validUids) {
          await AxiosService.delete(ConstantInfo.restApiTemplate(uid));
        }
      }
      await fetchData();
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      setDeleteTarget('templates');
      setDeleteCategoryId(null);
      contextMenuUidRef.current = null;
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleCopyClick = () => {
    if (selectedIds.size === 0) return;
    setShowCopyPopup(true);
  };

  const handleCopyToCurrent = async () => {
    try {
      for (const uid of selectedIds) {
        if (uid === 'uncategorized') continue;
        await AxiosService.post(ConstantInfo.restApiTemplateCopy, { sourceTemplateUid: uid, targetCategoryId: currentCategoryId });
      }
      await fetchData();
      setSelectedIds(new Set());
      setShowCopyPopup(false);
      contextMenuUidRef.current = null;
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const handleCopyToOther = () => {
    setShowCopyPopup(false);
    setShowCopySelectPopup(true);
  };

  const handleCopySelectGroup = async (categoryId: string, _categoryName: string) => {
    try {
      for (const uid of selectedIds) {
        if (uid === 'uncategorized') continue;
        const numId = parseInt(categoryId);
        await AxiosService.post(ConstantInfo.restApiTemplateCopy, {
          sourceTemplateUid: uid,
          targetCategoryId: isNaN(numId) || numId === 0 ? null : numId,
        });
      }
      await fetchData();
      setSelectedIds(new Set());
      setShowCopySelectPopup(false);
      contextMenuUidRef.current = null;
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const handleMoveClick = () => {
    if (selectedIds.size === 0) return;
    setShowMoveSelectPopup(true);
  };

  const handleMoveSelectGroup = async (categoryId: string, _categoryName: string) => {
    try {
      for (const uid of selectedIds) {
        if (uid === 'uncategorized') continue;
        const numId = parseInt(categoryId);
        await AxiosService.put(ConstantInfo.restApiTemplate(uid), {
          categoryId: isNaN(numId) || numId === 0 ? null : numId,
        });
      }
      await fetchData();
      setSelectedIds(new Set());
      setShowMoveSelectPopup(false);
      contextMenuUidRef.current = null;
    } catch (error) {
      console.error('Ошибка перемещения:', error);
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setHasVerticalScroll(container.scrollHeight > container.clientHeight);
    setHasHorizontalScroll(container.scrollWidth > container.clientWidth);
  };

  useEffect(() => { const timer = setTimeout(checkScroll, 350); return () => clearTimeout(timer); }, [currentCategoryId, filteredCategories]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll); ro.observe(container);
    return () => { container.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const smallButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const mediumButtonStyle: React.CSSProperties = { height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 };

  const EmptySquare = ({ isSelected = false, onClick, isHeader = false }: { isSelected?: boolean; onClick?: (e: React.MouseEvent) => void; isHeader?: boolean }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick?.(e); }} style={{ width: 18, height: 18, borderRadius: 2, border: isSelected ? 'none' : `2px solid ${isHeader ? '#FFFFFF' : '#2D4059'}`, opacity: isHeader && !isSelected ? 1 : isSelected ? 1 : 0.5, flexShrink: 0, boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isSelected && <img src={Icon19} alt="" style={{ width: 18, height: 18 }} />}
    </div>
  );

  const contextMenuButtonStyle: React.CSSProperties = { height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' };

  const cellTextStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059',
    position: 'absolute',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid rgba(102, 110, 254, 0.15)',
    paddingLeft: 12, paddingRight: 12,
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
    color: '#2D4059', outline: 'none', boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  };

  const selectFieldStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid rgba(102, 110, 254, 0.15)',
    backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center',
    paddingLeft: 12, paddingRight: 12, cursor: 'pointer', boxSizing: 'border-box',
  };

  const renderCategoryList = () => {
    return filteredCategories.map(cat => (
      <div key={cat.uid} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', cursor: 'pointer', userSelect: 'none', boxSizing: 'border-box', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5', paddingLeft: 20, position: 'relative' }} onClick={() => enterCategory(cat.id)} onContextMenu={(e) => handleContextMenu(e, cat.uid, cat.name, 'category', cat.id)}>
        <EmptySquare isSelected={false} onClick={(e) => { e.stopPropagation(); }} />
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 19 }}>
          <img src={PopupIcon4} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#2D4059', marginLeft: 10 }}>{cat.name}</span>
        </div>
      </div>
    ));
  };

  const renderTemplates = () => {
    if (!currentCategory) return null;
    const items: React.ReactNode[] = [];

    items.push(
      <div key="back" style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', userSelect: 'none', boxSizing: 'border-box', position: 'relative', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} onContextMenu={(e) => handleContextMenu(e, currentCategory.uid, currentCategory.name, 'category', currentCategory.id)}>
        <div style={{ paddingLeft: 20, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 18, height: 18, flexShrink: 0 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 19 }}>
          <img src={PopupIcon4} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#2D4059', marginLeft: 10, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentCategory.name}</span>
          <button onClick={(e) => { e.stopPropagation(); goBack(); }} style={{ marginLeft: 18, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, flexShrink: 0 }}><img src={Icon17} alt="Назад" style={{ width: 18, height: 18 }} /></button>
        </div>
      </div>
    );

    currentCategory.templates.forEach(template => {
      const isSelected = selectedIds.has(template.uid);
      items.push(
        <div key={template.uid} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: isSelected ? '#EDF6FF' : '#FFFFFF', position: 'relative', cursor: 'pointer', boxSizing: 'border-box', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} onDoubleClick={() => navigate(`/documents/schablon/${template.uid}`)} onContextMenu={(e) => handleContextMenu(e, template.uid, template.name, 'template', currentCategory.id)}>
          <div style={{ paddingLeft: 20, display: 'flex', alignItems: 'center' }}><EmptySquare isSelected={isSelected} onClick={() => toggleSelectItem(template.uid)} /></div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 39 }}>
            <img src={PopupIcon7} alt="" style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', marginLeft: 10, maxWidth: COL_CODE - 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.name}</span>
          </div>
          <span style={{ ...cellTextStyle, left: COL_CODE, maxWidth: COL_CONFIG - COL_CODE - 20 }}>{template.number || '—'}</span>
          <span style={{ ...cellTextStyle, left: COL_CONFIG, maxWidth: COL_MODEL - COL_CONFIG - 20 }}>{template.configurationName || '—'}</span>
          <span style={{ ...cellTextStyle, left: COL_MODEL, maxWidth: COL_STATION - COL_MODEL - 20 }}>{template.modelName || '—'}</span>
          <span style={{ ...cellTextStyle, left: COL_STATION, maxWidth: COL_STATUS - COL_STATION - 20, cursor: template.stationNames?.length > 0 ? 'pointer' : 'default', color: '#2D4059' }}
            onClick={(e) => {
              e.stopPropagation();
              if (template.stationNames?.length > 0) {
                setStationListData({ isOpen: true, stationNames: template.stationNames, templateName: template.name });
              }
            }}>
            {template.stationNames?.length === 1 ? template.stationNames[0] : template.stationNames?.length > 1 ? `Станций: ${template.stationNames.length}` : ''}
          </span>
          <span style={{ ...cellTextStyle, left: COL_STATUS, maxWidth: COL_DATE - COL_STATUS - 20, display: 'flex', alignItems: 'center' }}>
            {template.active && <img src={Iconn3} alt="" style={{ width: 84, height: 24 }} />}
          </span>
          <span style={{ ...cellTextStyle, left: COL_DATE, maxWidth: TABLE_WIDTH - COL_DATE - 60 }}>{formatDate(template.createdAt)}</span>
        </div>
      );
    });

    return items;
  };

  const isInCategory = currentCategoryId !== null;
  const totalItems = isInCategory ? 1 + (currentCategory?.templates?.length || 0) : filteredCategories.length;
  const emptyRows = Math.max(0, VISIBLE_ROWS - totalItems);

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
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 700, color: '#2D4059', margin: 0, lineHeight: '29px', height: 29 }}>Каталог шаблонов загрузки станции</h1>
      </div>

      <div style={{ position: 'absolute', top: 79, left: 60, right: 40, height: 17 }} />

      <div style={{ position: 'absolute', top: 105, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
          <button style={smallButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ width: 40, flexShrink: 0 }} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', whiteSpace: 'nowrap' }}>Активные</span>
        <div style={{ width: 9, flexShrink: 0 }} />
        <ToggleSwitch value={showActiveOnly} onChange={() => setShowActiveOnly(!showActiveOnly)} />
        <div style={{ position: 'absolute', left: 586, display: 'flex', gap: 15 }}>
          <button style={{ ...mediumButtonStyle, width: 124 }} onClick={handleCreateTemplateFromToolbar}><img src={Icon4} alt="" style={{ width: 16, height: 16, marginLeft: 12 }} /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 15 }}>Создать</span></button>
          <button style={{ ...mediumButtonStyle, width: 186 }} onClick={handleCreateGroupClick}><img src={Iconn2} alt="" style={{ width: 22, height: 20, marginLeft: 13 }} /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 15 }}>Создать группу</span></button>
          <button style={smallButtonStyle} onClick={handleMoveClick}><img src={Icon18} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle} onClick={handleCopyClick}><img src={Icon6} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle} onClick={handleDeleteClick}><img src={Icon7} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Icon8} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon9} alt="" style={{ width: 14, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon10} alt="" style={{ width: 18, height: 16 }} /></button>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 160, left: 40 }}>
        <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 20, paddingRight: 40, boxSizing: 'border-box' }}>
            <EmptySquare isSelected={isInCategory && isHeaderSelected()} onClick={toggleSelectAll} isHeader />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НАИМЕНОВАНИЕ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_CODE }}>КОД</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_CONFIG }}>КОНФИГУРАЦИЯ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_MODEL }}>МОДЕЛЬ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_STATION }}>СТАНЦИЯ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_STATUS }}>СТАТУС</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА</span>
          </div>
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div style={{ minWidth: TABLE_WIDTH - 40 }}>
              {isInCategory ? renderTemplates() : renderCategoryList()}
              {Array.from({ length: emptyRows }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 20, borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }}><EmptySquare /></div>
              ))}
            </div>
          </div>
        </div>
        {hasVerticalScroll && (<div style={{ position: 'absolute', right: -25, top: HEADER_HEIGHT, height: TABLE_HEIGHT - HEADER_HEIGHT, width: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>)}
        {hasHorizontalScroll && (<div style={{ position: 'absolute', bottom: -21, left: 0, width: TABLE_WIDTH, height: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="horizontal" trackSize={TABLE_WIDTH} /></div>)}
      </div>

      {showCreateTemplatePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreateTemplatePopup(false)}>
          <div style={{ width: 500, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Создание шаблона</h3>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название шаблона</label>
              <input type="text" value={createTemplateName} onChange={e => setCreateTemplateName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateTemplateSubmit(); else if (e.key === 'Escape') setShowCreateTemplatePopup(false); }} placeholder="Введите название" autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Модель</label>
              <div onClick={() => setShowCreateModelSelect(true)} style={{ ...selectFieldStyle, border: createTemplateModelUid ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)' }}>
                <img src={createTemplateModelUid ? Icon32 : Icon31} alt="" style={{ width: 14.5, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: createTemplateModelUid ? '#666EFE' : '#A0A3BD' }}>{createTemplateModelName || 'Выберите модель'}</span>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Конфигурация</label>
              <div onClick={() => setShowCreateConfigSelect(true)} style={{ ...selectFieldStyle, border: createTemplateConfigUid ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)' }}>
                <img src={createTemplateConfigUid ? Icon32 : Icon31} alt="" style={{ width: 14.5, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: createTemplateConfigUid ? '#666EFE' : '#A0A3BD' }}>{createTemplateConfigName || 'Выберите конфигурацию'}</span>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Каталог</label>
              <div onClick={() => setShowCreateCategorySelect(true)} style={{ ...selectFieldStyle, border: createTemplateCategoryId ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)' }}>
                <img src={PopupIcon4} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ marginLeft: 10, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: createTemplateCategoryId ? '#666EFE' : '#A0A3BD' }}>{createTemplateCategoryName || 'Выберите каталог'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleCreateTemplateSubmit} disabled={isCreatingTemplate || !createTemplateName.trim()} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: createTemplateName.trim() && !isCreatingTemplate ? '#666EFE' : '#BCC8FF', cursor: createTemplateName.trim() && !isCreatingTemplate ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isCreatingTemplate ? 'Создание...' : 'Создать'}</button>
              <button onClick={() => setShowCreateTemplatePopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <CatalogSelectPopup isOpen={showCreateCategorySelect} onClose={() => setShowCreateCategorySelect(false)} onSelect={handleCreateCategorySelect} popupType="templateCategory" />
      <CatalogSelectPopup isOpen={showCreateModelSelect} onClose={() => setShowCreateModelSelect(false)} onSelect={handleCreateModelSelect} popupType="stationModel" />
      <CatalogSelectPopup isOpen={showCreateConfigSelect} onClose={() => setShowCreateConfigSelect(false)} onSelect={handleCreateConfigSelect} popupType="stationConfiguration" filterParam={createTemplateModelUid || undefined} />

      <TemplateCreateGroupPopup isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} onSubmit={handleCreateGroup} isLoading={isCreatingGroup} />

      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: contextMenu.type === 'category' && !isMultipleSelected(contextMenu.uid) ? 244 : 200, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          {isMultipleSelected(contextMenu.uid) ? (
            <>
              <button style={contextMenuButtonStyle} onClick={handleContextMove}><img src={Icon22} alt="" style={{ width: 16, height: 14, marginRight: 17 }} />Переместить</button>
              <button style={contextMenuButtonStyle} onClick={handleContextCopy}><img src={Icon24} alt="" style={{ width: 16, height: 16, marginRight: 17 }} />Скопировать</button>
              <button style={contextMenuButtonStyle} onClick={handleContextDelete}><img src={Icon25} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />Удалить</button>
            </>
          ) : contextMenu.type === 'category' ? (
            <>
              <button style={{ ...contextMenuButtonStyle, width: 244 }} onClick={handleContextCreateTemplate}><img src={PopupIcon2} alt="" style={{ width: 14, height: 14, marginRight: 17 }} />Создать шаблон</button>
              <button style={{ ...contextMenuButtonStyle, width: 244 }} onClick={handleContextRename}><img src={Icon23} alt="" style={{ width: 16, height: 15, marginRight: 17 }} />Переименовать</button>
              <button style={{ ...contextMenuButtonStyle, width: 244 }} onClick={handleContextDelete}><img src={Icon25} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />Удалить</button>
            </>
          ) : (
            <>
              <button style={contextMenuButtonStyle} onClick={handleContextOpen}><img src={IconOpen} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />Открыть</button>
              <button style={contextMenuButtonStyle} onClick={handleContextMove}><img src={Icon22} alt="" style={{ width: 16, height: 14, marginRight: 17 }} />Переместить</button>
              <button style={contextMenuButtonStyle} onClick={handleContextCopy}><img src={Icon24} alt="" style={{ width: 16, height: 16, marginRight: 17 }} />Скопировать</button>
              <button style={contextMenuButtonStyle} onClick={handleContextDelete}><img src={Icon25} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />Удалить</button>
            </>
          )}
        </div>
      )}

      {showRenamePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowRenamePopup(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Переименование {renameType === 'category' ? 'группы' : 'шаблона'}</h3>
            <input type="text" value={renameName} onChange={(e) => setRenameName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); else if (e.key === 'Escape') setShowRenamePopup(false); }} placeholder="Введите новое название" autoFocus style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowRenamePopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
              <button onClick={handleRenameSubmit} disabled={isRenaming || !renameName.trim()} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: renameName.trim() && !isRenaming ? '#666EFE' : '#BCC8FF', cursor: renameName.trim() && !isRenaming ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isRenaming ? 'Сохранение...' : 'Переименовать'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Подтверждение удаления</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>
              {deleteTarget === 'category' ? 'Вы уверены, что хотите удалить группу и все шаблоны внутри?' : 'Вы уверены, что хотите удалить выбранные шаблоны?'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
              <button onClick={confirmDelete} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: '#FF3052', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {showCopyPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCopyPopup(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Копирование</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Выберите куда скопировать выбранные шаблоны</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleCopyToCurrent} style={{ height: 44, borderRadius: 10, border: 'none', backgroundColor: '#666EFE', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>В текущую группу</button>
              <button onClick={handleCopyToOther} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>В другую группу</button>
              <button onClick={() => setShowCopyPopup(false)} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <CatalogSelectPopup isOpen={showCopySelectPopup} onClose={() => setShowCopySelectPopup(false)} onSelect={handleCopySelectGroup} popupType="templateCategory" />
      <CatalogSelectPopup isOpen={showMoveSelectPopup} onClose={() => setShowMoveSelectPopup(false)} onSelect={handleMoveSelectGroup} popupType="templateCategory" />

      {stationListData.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setStationListData({ isOpen: false, stationNames: [], templateName: '' })}>
          <div style={{ width: 400, maxHeight: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 15 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Станции: {stationListData.templateName}</h3>
            <div style={{ overflowY: 'auto', maxHeight: 300 }}>
              {stationListData.stationNames.map((name, i) => (
                <div key={i} style={{ padding: '10px 0', borderTop: '0.5px solid #E5ECF5', fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2D4059' }}>{name}</div>
              ))}
            </div>
            <button onClick={() => setStationListData({ isOpen: false, stationNames: [], templateName: '' })} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', marginTop: 5 }}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;