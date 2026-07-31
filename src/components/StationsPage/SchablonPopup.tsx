// SchablonPopup.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CustomScrollbar from '../../components/CustomScrollbar';
import AxiosService from '../../services/AxiosService';
import ConstantInfo from '../../info/ConstantInfo';
import TemplateCreateGroupPopup from '../ReferencesPage/TemplatesPage/TemplateCreateGroupPopup';
import CatalogSelectPopup from '../ReferencesPage/NomenclaturePage/CatalogSelectPopup';
import PopupIcon1 from '../../assets/Station/PopupIcon1.svg';
import PopupIcon2 from '../../assets/Station/PopupIcon2.svg';
import Iconn from '../../assets/Station/Iconn.svg';
import Iconn3 from '../../assets/Station/Iconn3.svg';
import Iconn4 from '../../assets/Station/Iconn4.svg';
import PopupIcon4 from '../../assets/Station/PopupIcon4.svg';
import PopupIcon5 from '../../assets/Station/PopupIcon5.svg';
import PopupIcon7 from '../../assets/Station/PopupIcon7.svg';
import IconOpen from '../../assets/References/IconOpen.svg';
import IconSet from '../../assets/References/IconSet.svg';
import Icon22 from '../../assets/References/Icon22.svg';
import Icon23 from '../../assets/References/Icon23.svg';
import Icon24 from '../../assets/References/Icon24.svg';
import Icon25 from '../../assets/References/Icon25.svg';
import Icon31 from '../../assets/References/NomenclatureCreatePage/Icon31.svg';
import Icon32 from '../../assets/References/NomenclatureCreatePage/Icon32.svg';

interface TemplateItem {
  uid: string;
  name: string;
  number: number | null;
  categoryId: number | null;
  categoryName: string | null;
  configuration: string | null;
  configurationUid: string | null;
  configurationName: string | null;
  totalCells: number;
  filledCells: number;
  freeCells: number;
  createdAt: string;
}

interface CategoryItem {
  id: number;
  uid: string;
  name: string;
  templates: TemplateItem[];
  isOpen: boolean;
}

interface CategoryContextMenu {
  x: number;
  y: number;
  categoryId: number;
  categoryName: string;
}

interface TemplateContextMenu {
  x: number;
  y: number;
  templateUid: string;
  templateName: string;
}

interface SchablonPopupProps {
  isOpen: boolean;
  onClose: () => void;
  uid?: string;
  name?: string;
  workshop?: string;
  section?: string;
  status?: string;
  configurationUid?: string;
  onTemplateAssigned?: (templateUid: string) => void;
}

const ROW_HEIGHT = 54;
const HEADER_HEIGHT = 54;
const TABLE_WIDTH = 992;
const TABLE_HEIGHT = 378;
const VISIBLE_ROWS = 6;

const SchablonPopup: React.FC<SchablonPopupProps> = ({
  isOpen,
  onClose,
  uid,
  name,
  workshop,
  section,
  status,
  configurationUid,
  onTemplateAssigned,
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showCreateTemplatePopup, setShowCreateTemplatePopup] = useState(false);
  const [createTemplateName, setCreateTemplateName] = useState('');
  const [createTemplateCategoryId, setCreateTemplateCategoryId] = useState<number | null>(null);
  const [createTemplateCategoryName, setCreateTemplateCategoryName] = useState('');
  const [createTemplateConfigUid, setCreateTemplateConfigUid] = useState('');
  const [createTemplateConfigName, setCreateTemplateConfigName] = useState('');
  const [showCreateCategorySelect, setShowCreateCategorySelect] = useState(false);
  const [showCreateConfigSelect, setShowCreateConfigSelect] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [categoryContextMenu, setCategoryContextMenu] = useState<CategoryContextMenu | null>(null);
  const [templateContextMenu, setTemplateContextMenu] = useState<TemplateContextMenu | null>(null);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [renameCategoryId, setRenameCategoryId] = useState<number | null>(null);
  const [renameName, setRenameName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [activeTemplateUid, setActiveTemplateUid] = useState<string>('');
  const [activeTemplateName, setActiveTemplateName] = useState<string>('');
  const [newlyCreatedUid, setNewlyCreatedUid] = useState<string>('');
  const [stationConfUid, setStationConfUid] = useState<string>('');

  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showCopySelectPopup, setShowCopySelectPopup] = useState(false);
  const [showMoveSelectPopup, setShowMoveSelectPopup] = useState(false);
  const [operationTemplateUid, setOperationTemplateUid] = useState<string>('');

  const [internalOpen, setInternalOpen] = useState(false);

  const COL_STATUS = 551;
  const COL_NUMBER = 727;
  const COL_DATE = 828;

  useEffect(() => {
    if (isOpen) {
      setInternalOpen(true);
      setNewlyCreatedUid('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose();
  };

  const openCategoriesRef = useRef<Set<number>>(new Set());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, tempsRes, stationRes] = await Promise.all([
        AxiosService.get(ConstantInfo.restApiTemplatesCategories),
        AxiosService.get(ConstantInfo.restApiTemplates),
        uid ? AxiosService.get(`/api/stations/static/${uid}`).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);

      const cats: any[] = catsRes.data;
      const allTemps: TemplateItem[] = tempsRes.data;

      const stationData = stationRes?.data;
      let confUid = configurationUid || '';
      if (stationData?.activeTemplateUid) {
        setActiveTemplateUid(stationData.activeTemplateUid);
        const found = allTemps.find((t: TemplateItem) => t.uid === stationData.activeTemplateUid);
        setActiveTemplateName(found?.name || '');
      } else {
        setActiveTemplateUid('');
        setActiveTemplateName('');
      }

      if (!confUid && stationData?.configurationUid) {
        confUid = stationData.configurationUid;
      }
      setStationConfUid(confUid);

      let temps: TemplateItem[];
      if (confUid) {
        temps = allTemps.filter((t: TemplateItem) => 
          t.configurationUid === confUid
        );
      } else {
        temps = [];
      }

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

      const result: CategoryItem[] = cats
        .filter((c: any) => (catMap.get(c.id) || []).length > 0)
        .map((c: any) => ({
          id: c.id,
          uid: c.uid,
          name: c.name,
          templates: catMap.get(c.id) || [],
          isOpen: openCategoriesRef.current.has(c.id),
        }));

      if (uncategorized.length > 0) {
        result.push({
          id: 0,
          uid: 'uncategorized',
          name: 'Без категории',
          templates: uncategorized,
          isOpen: openCategoriesRef.current.has(0),
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
    if (internalOpen) {
      openCategoriesRef.current = new Set();
      fetchData();
    }
  }, [internalOpen]);

  useEffect(() => {
    if (!categoryContextMenu && !templateContextMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-context-menu]')) return;
      setCategoryContextMenu(null);
      setTemplateContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [categoryContextMenu, templateContextMenu]);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setHasScroll(container.scrollHeight > container.clientHeight);
  };

  const getTargetTotalRows = (): number => {
    let count = 0;
    categories.forEach(cat => {
      count += 1;
      if (cat.isOpen) count += cat.templates.length;
    });
    return count;
  };

  const targetTotalRows = getTargetTotalRows();
  const emptyRows = Math.max(0, VISIBLE_ROWS - targetTotalRows);

  const toggleFolder = (categoryId: number) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id === categoryId) {
          const newIsOpen = !c.isOpen;
          if (newIsOpen) {
            openCategoriesRef.current.add(categoryId);
          } else {
            openCategoriesRef.current.delete(categoryId);
          }
          return { ...c, isOpen: newIsOpen };
        }
        return c;
      })
    );
    setTimeout(checkScroll, 350);
  };

  const handleSetActive = async (template: TemplateItem) => {
    if (uid) {
      try {
        await AxiosService.put(`/api/stations/${uid}`, { activeTemplateUid: template.uid });
        setActiveTemplateUid(template.uid);
        setActiveTemplateName(template.name);
        onTemplateAssigned?.(template.uid);
      } catch (error) {
        console.error('Ошибка привязки шаблона:', error);
      }
    }
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
      } else if (configurationUid) {
        body.configurationUid = configurationUid;
      }
      const response = await AxiosService.post(ConstantInfo.restApiTemplates, body);
      setNewlyCreatedUid(response.data.uid);
      if (createTemplateCategoryId) {
        openCategoriesRef.current.add(createTemplateCategoryId);
      } else {
        openCategoriesRef.current.add(0);
      }
      await fetchData();
      setShowCreateTemplatePopup(false);
      setCreateTemplateName('');
      setCreateTemplateCategoryId(null);
      setCreateTemplateCategoryName('');
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

  const handleCreateConfigSelect = (id: string, name: string) => {
    setCreateTemplateConfigUid(id);
    setCreateTemplateConfigName(name);
    setShowCreateConfigSelect(false);
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

  const handleCategoryContextMenu = (e: React.MouseEvent, categoryId: number, categoryName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCategoryContextMenu({ x: e.clientX, y: e.clientY, categoryId, categoryName });
  };

  const handleTemplateContextMenu = (e: React.MouseEvent, templateUid: string, templateName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateContextMenu({ x: e.clientX, y: e.clientY, templateUid, templateName });
  };

  const handleCategoryContextCreateTemplate = () => {
    if (!categoryContextMenu) return;
    setCreateTemplateName('');
    setCreateTemplateCategoryId(categoryContextMenu.categoryId);
    setCreateTemplateCategoryName(categoryContextMenu.categoryName);
    setCreateTemplateConfigUid('');
    setCreateTemplateConfigName('');
    setCategoryContextMenu(null);
    setShowCreateTemplatePopup(true);
  };

  const handleCategoryContextRename = () => {
    if (!categoryContextMenu) return;
    setRenameCategoryId(categoryContextMenu.categoryId);
    setRenameName(categoryContextMenu.categoryName);
    setCategoryContextMenu(null);
    setShowRenamePopup(true);
  };

  const handleCategoryContextDelete = async () => {
    if (!categoryContextMenu) return;
    try {
      await AxiosService.delete(ConstantInfo.restApiTemplatesCategory(categoryContextMenu.categoryId));
      setCategoryContextMenu(null);
      await fetchData();
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
    }
  };

  const handleTemplateContextOpen = () => {
    if (!templateContextMenu) return;
    const { templateUid } = templateContextMenu;
    setTemplateContextMenu(null);
    const params = new URLSearchParams();
    if (uid) params.set('stationUid', uid);
    if (name) params.set('stationName', name);
    const queryString = params.toString();
    const url = `/documents/schablon/${templateUid}${queryString ? `?${queryString}` : ''}`;
    navigate(url);
  };

  const handleTemplateContextSetActive = () => {
    if (!templateContextMenu) return;
    const template = categories.flatMap(c => c.templates).find(t => t.uid === templateContextMenu.templateUid);
    if (template) {
      handleSetActive(template);
      setTemplateContextMenu(null);
    }
  };

  const handleTemplateContextCopy = () => {
    if (!templateContextMenu) return;
    setOperationTemplateUid(templateContextMenu.templateUid);
    setTemplateContextMenu(null);
    setShowCopyPopup(true);
  };

  const handleTemplateContextMove = () => {
    if (!templateContextMenu) return;
    setOperationTemplateUid(templateContextMenu.templateUid);
    setTemplateContextMenu(null);
    setShowMoveSelectPopup(true);
  };

  const handleTemplateContextDelete = async () => {
    if (!templateContextMenu) return;
    try {
      await AxiosService.delete(ConstantInfo.restApiTemplate(templateContextMenu.templateUid));
      setTemplateContextMenu(null);
      await fetchData();
    } catch (error) {
      console.error('Ошибка удаления шаблона:', error);
    }
  };

  const handleCopyToCurrent = async () => {
    const template = categories.flatMap(c => c.templates).find(t => t.uid === operationTemplateUid);
    const catId = template?.categoryId || null;
    try {
      await AxiosService.post(ConstantInfo.restApiTemplateCopy, {
        sourceTemplateUid: operationTemplateUid,
        targetCategoryId: catId,
      });
      await fetchData();
      setShowCopyPopup(false);
      setOperationTemplateUid('');
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const handleCopyToOther = () => {
    setShowCopyPopup(false);
    setShowCopySelectPopup(true);
  };

  const handleCopySelectGroup = async (categoryId: string, _categoryName: string) => {
    const numId = parseInt(categoryId);
    try {
      await AxiosService.post(ConstantInfo.restApiTemplateCopy, {
        sourceTemplateUid: operationTemplateUid,
        targetCategoryId: isNaN(numId) || numId === 0 ? null : numId,
      });
      await fetchData();
      setShowCopySelectPopup(false);
      setOperationTemplateUid('');
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const handleMoveSelectGroup = async (categoryId: string, _categoryName: string) => {
    const numId = parseInt(categoryId);
    try {
      await AxiosService.put(ConstantInfo.restApiTemplate(operationTemplateUid), {
        categoryId: isNaN(numId) || numId === 0 ? null : numId,
      });
      await fetchData();
      setShowMoveSelectPopup(false);
      setOperationTemplateUid('');
    } catch (error) {
      console.error('Ошибка перемещения:', error);
    }
  };

  const handleTemplateDoubleClick = async (template: TemplateItem) => {
    await handleSetActive(template);
  };

  const handleRenameSubmit = async () => {
    if (!renameCategoryId || !renameName.trim()) return;
    setIsRenaming(true);
    try {
      await AxiosService.put(ConstantInfo.restApiTemplatesCategory(renameCategoryId), { name: renameName.trim() });
      await fetchData();
      setShowRenamePopup(false);
      setRenameCategoryId(null);
      setRenameName('');
    } catch (error) {
      console.error('Ошибка переименования:', error);
    } finally {
      setIsRenaming(false);
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

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [categories]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);
    const mutationObserver = new MutationObserver(checkScroll);
    mutationObserver.observe(container, { childList: true, subtree: true });
    return () => {
      container.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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

  const contextMenuButtonStyle: React.CSSProperties = {
    height: 40, border: 'none', background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', paddingLeft: 20,
    fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059',
    width: '100%',
  };

  const handleToolbarCreate = () => {
    setCreateTemplateName('');
    setCreateTemplateCategoryId(null);
    setCreateTemplateCategoryName('');
    setCreateTemplateConfigUid('');
    setCreateTemplateConfigName('');
    setShowCreateTemplatePopup(true);
  };

  if (!internalOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '1052px', height: '602px',
            backgroundColor: '#FFFFFF', borderRadius: '15px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            display: 'flex', flexDirection: 'column', position: 'relative',
          }}
        >
          <button onClick={handleClose} style={{ position: 'absolute', top: '33px', right: '33px', width: '14px', height: '14px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', zIndex: 10 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1.5" y1="1.5" x2="12.5" y2="12.5" stroke="#2D4059" strokeWidth="3" strokeLinecap="round" />
              <line x1="12.5" y1="1.5" x2="1.5" y2="12.5" stroke="#2D4059" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>

          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '17px', fontWeight: 600,
            color: '#2D4059', margin: 0, position: 'absolute', top: '30px', left: 0, right: 0, textAlign: 'center',
          }}>
            Каталог шаблонов загрузки станции
          </h2>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600,
            color: '#2D4059', margin: 0, position: 'absolute', top: '81px', left: '60px',
          }}>
            Текущий шаблон станции: {activeTemplateName || 'Не назначен'}
          </p>

          <div style={{ position: 'absolute', top: '144px', left: '45px', right: '53px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{
              width: '40px', height: '40px',
              backgroundColor: '#FFFFFF', border: 'none', borderRadius: '10px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}>
              <img src={PopupIcon1} alt="" style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleToolbarCreate} style={{
                width: '122px', height: '40px',
                backgroundColor: '#FFFFFF', border: 'none', borderRadius: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                padding: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}>
                <img src={PopupIcon2} alt="" style={{ width: '14px', height: '14px', marginLeft: '15px' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: '#2D4059', marginLeft: '15px' }}>Создать</span>
              </button>

              <button onClick={() => setShowCreateGroup(true)} style={{
                width: '185px', height: '40px',
                backgroundColor: '#FFFFFF', border: 'none', borderRadius: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                padding: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}>
                <img src={Iconn} alt="" style={{ width: '22px', height: '20px', marginLeft: '13px' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, color: '#2D4059', marginLeft: '15px' }}>Создать группу</span>
              </button>
            </div>
          </div>

          <div style={{ position: 'absolute', top: '194px', left: '30px', display: 'flex' }}>
            <div style={{ position: 'relative', width: `${TABLE_WIDTH}px`, height: `${TABLE_HEIGHT}px` }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#F5F6FA', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: `${HEADER_HEIGHT}px`, minHeight: `${HEADER_HEIGHT}px`, backgroundColor: '#666EFE', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: '20px', paddingRight: '40px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: '50px' }}>НАИМЕНОВАНИЕ</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: `${COL_STATUS}px` }}>СТАТУС</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: `${COL_NUMBER}px` }}>НОМЕР</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', position: 'absolute', left: `${COL_DATE}px` }}>ДАТА</span>
                </div>

                <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div style={{ minHeight: `${VISIBLE_ROWS * ROW_HEIGHT}px` }}>
                    {isLoading ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9CA3AF' }}>Загрузка...</span>
                      </div>
                    ) : categories.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9CA3AF' }}>
                          {stationConfUid ? 'Нет шаблонов для данной конфигурации' : 'Конфигурация станции не задана'}
                        </span>
                      </div>
                    ) : (
                      <>
                        {categories.map((category) => (
                          <React.Fragment key={category.uid}>
                            <div
                              onClick={() => toggleFolder(category.id)}
                              onContextMenu={(e) => handleCategoryContextMenu(e, category.id, category.name)}
                              style={{
                                height: `${ROW_HEIGHT}px`, display: 'flex', alignItems: 'center',
                                paddingLeft: '20px', paddingRight: '20px',
                                borderTop: '0.5px solid #E5ECF5',
                                borderBottom: '0.5px solid #E5ECF5',
                                backgroundColor: '#FFFFFF', cursor: 'pointer',
                                userSelect: 'none', boxSizing: 'border-box',
                              }}
                            >
                              <img src={PopupIcon4} alt="" style={{ width: '14.5px', height: '18px', flexShrink: 0 }} />
                              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#2D4059', marginLeft: '17.5px' }}>{category.name}</span>
                              <motion.img
                                src={PopupIcon5} alt=""
                                animate={{ rotate: category.isOpen ? 90 : 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ width: '12px', height: '8px', flexShrink: 0, marginLeft: '10px' }}
                              />
                            </div>

                            <AnimatePresence>
                              {category.isOpen && category.templates.map((template) => (
                                <motion.div
                                  key={template.uid}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: `${ROW_HEIGHT}px`, opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div
                                    onDoubleClick={() => handleTemplateDoubleClick(template)}
                                    onContextMenu={(e) => handleTemplateContextMenu(e, template.uid, template.name)}
                                    style={{
                                      height: `${ROW_HEIGHT}px`, display: 'flex', alignItems: 'center',
                                      paddingLeft: '40px', paddingRight: '40px',
                                      borderTop: '0.5px solid #E5ECF5',
                                      borderBottom: '0.5px solid #E5ECF5',
                                      backgroundColor: '#FFFFFF', cursor: 'pointer',
                                      userSelect: 'none', boxSizing: 'border-box', position: 'relative',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDF6FF'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                  >
                                    <img src={PopupIcon7} alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 400, color: '#2D4059', marginLeft: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: `${COL_STATUS - 80}px` }}>{template.name}</span>
                                    <span style={{ position: 'absolute', left: '540px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      {activeTemplateUid === template.uid && (
                                        <img src={Iconn3} alt="" style={{ width: 84, height: 24 }} />
                                      )}
                                      {newlyCreatedUid === template.uid && (
                                        <img src={Iconn4} alt="" style={{ width: 64, height: 24 }} />
                                      )}
                                    </span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#2D4059', position: 'absolute', left: `${COL_NUMBER}px` }}>
                                      {template.number || '—'}
                                    </span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#2D4059', position: 'absolute', left: `${COL_DATE}px` }}>{formatDate(template.createdAt)}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                        {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, i) => (
                          <div key={`empty-${i}`} style={{
                            height: `${ROW_HEIGHT}px`,
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                            borderTop: '0.5px solid #E5ECF5',
                            borderBottom: '0.5px solid #E5ECF5',
                          }} />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {hasScroll && (
                <div style={{ position: 'absolute', right: '-20px', top: `${HEADER_HEIGHT}px`, bottom: 0, width: '10px' }}>
                  <CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showCreateTemplatePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreateTemplatePopup(false)}>
          <div style={{ width: 500, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Создание шаблона</h3>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название шаблона</label>
              <input type="text" value={createTemplateName} onChange={e => setCreateTemplateName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateTemplateSubmit(); else if (e.key === 'Escape') setShowCreateTemplatePopup(false); }} placeholder="Введите название" autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Конфигурация</label>
              <div onClick={() => setShowCreateConfigSelect(true)} style={{ ...selectFieldStyle, border: createTemplateConfigUid ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)' }}>
                <img src={createTemplateConfigUid ? Icon32 : Icon31} alt="" style={{ width: '14.5px', height: '18px', flexShrink: 0 }} />
                <span style={{ marginLeft: 10, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: createTemplateConfigUid ? '#666EFE' : '#A0A3BD' }}>{createTemplateConfigName || 'Выберите конфигурацию'}</span>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Группа</label>
              <div onClick={() => setShowCreateCategorySelect(true)} style={{ ...selectFieldStyle, border: createTemplateCategoryId ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)' }}>
                <img src={PopupIcon4} alt="" style={{ width: '14.5px', height: '18px', flexShrink: 0 }} />
                <span style={{ marginLeft: 10, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: createTemplateCategoryId ? '#666EFE' : '#A0A3BD' }}>{createTemplateCategoryName || 'Выберите группу'}</span>
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
      <CatalogSelectPopup isOpen={showCreateConfigSelect} onClose={() => setShowCreateConfigSelect(false)} onSelect={handleCreateConfigSelect} popupType="stationConfiguration" />

      <TemplateCreateGroupPopup isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} onSubmit={handleCreateGroup} isLoading={isCreatingGroup} />

      {showCopyPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCopyPopup(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Копирование</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Выберите куда скопировать шаблон</p>
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

      {categoryContextMenu && (
        <div data-context-menu style={{ position: 'fixed', top: categoryContextMenu.y, left: categoryContextMenu.x, width: 244, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          <button onClick={handleCategoryContextCreateTemplate} style={{ ...contextMenuButtonStyle, width: 244 }}>
            <img src={PopupIcon2} alt="" style={{ width: 14, height: 14, marginRight: 17 }} />
            Создать шаблон
          </button>
          <button onClick={handleCategoryContextRename} style={{ ...contextMenuButtonStyle, width: 244 }}>
            <img src={Icon23} alt="" style={{ width: 16, height: 15, marginRight: 17 }} />
            Переименовать
          </button>
          <button onClick={handleCategoryContextDelete} style={{ ...contextMenuButtonStyle, width: 244 }}>
            <img src={Icon25} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />
            Удалить
          </button>
        </div>
      )}

      {templateContextMenu && (
        <div data-context-menu style={{ position: 'fixed', top: templateContextMenu.y, left: templateContextMenu.x, width: 200, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          <button onClick={handleTemplateContextOpen} style={contextMenuButtonStyle}>
            <img src={IconOpen} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />
            Открыть
          </button>
          <button onClick={handleTemplateContextSetActive} style={contextMenuButtonStyle}>
            <img src={IconSet} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />
            Установить
          </button>
          <button onClick={handleTemplateContextMove} style={contextMenuButtonStyle}>
            <img src={Icon22} alt="" style={{ width: 16, height: 14, marginRight: 17 }} />
            Переместить
          </button>
          <button onClick={handleTemplateContextCopy} style={contextMenuButtonStyle}>
            <img src={Icon24} alt="" style={{ width: 16, height: 16, marginRight: 17 }} />
            Скопировать
          </button>
          <button onClick={handleTemplateContextDelete} style={contextMenuButtonStyle}>
            <img src={Icon25} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />
            Удалить
          </button>
        </div>
      )}

      {showRenamePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowRenamePopup(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Переименование группы</h3>
            <input type="text" value={renameName} onChange={(e) => setRenameName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); else if (e.key === 'Escape') setShowRenamePopup(false); }} placeholder="Введите новое название" autoFocus style={inputStyle} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowRenamePopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
              <button onClick={handleRenameSubmit} disabled={isRenaming || !renameName.trim()} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: renameName.trim() && !isRenaming ? '#666EFE' : '#BCC8FF', cursor: renameName.trim() && !isRenaming ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isRenaming ? 'Сохранение...' : 'Переименовать'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchablonPopup;