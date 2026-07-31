// CatalogSelectPopup.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import { useTabs } from '../../../context/TabContext';
import CreateGroupPopup from './CreateGroupPopup';
import TemplateCreateGroupPopup from '../TemplatesPage/TemplateCreateGroupPopup';
import Icon1 from '../../../assets/References/Icon1.svg';
import Icon4 from '../../../assets/References/Icon4.svg';
import Icon11 from '../../../assets/References/Icon11.svg';
import Icon12 from '../../../assets/References/Icon12.svg';
import Icon13 from '../../../assets/References/Icon13.svg';
import Popup2 from '../../../assets/References/popup2.svg';
import Popup3 from '../../../assets/References/popup3.svg';
import Popup4 from '../../../assets/References/popup4.svg';
import Popup5 from '../../../assets/References/popup5.svg';
import Popup6 from '../../../assets/References/popup6.svg';
import Popup7 from '../../../assets/References/popup7.svg';
import Popup8 from '../../../assets/References/popup8.svg';
import Popup9 from '../../../assets/References/popup9.svg';
import Popup10 from '../../../assets/References/popup10.svg';
import Popup11 from '../../../assets/References/popup11.svg';

export interface Column {
  key: string;
  title: string;
  left?: number;
}

export interface TreeItem {
  id: string;
  name: string;
  children?: TreeItem[];
  materials?: TreeItem[];
  isMaterial?: boolean;
  [key: string]: any;
}

export type PopupType = 
  | 'catalog'
  | 'accountingGroup'
  | 'nomenclatureGroup'
  | 'nomenclatureType'
  | 'attributeType'
  | 'unit'
  | 'manufacturer'
  | 'brand'
  | 'model'
  | 'country'
  | 'supplier'
  | 'analogSelect'
  | 'shortDescription'
  | 'templateCategory'
  | 'stationType'
  | 'stationManufacturer'
  | 'stationModel'
  | 'stationConfiguration'
  | 'holding'
  | 'enterprise'
  | 'workshop'
  | 'section';

interface PopupConfig {
  title: string;
  columns: Column[];
  createButtonLabel?: string;
  isFlat?: boolean;
  hasCreateButton?: boolean;
}

const getPopupConfig = (type: PopupType): PopupConfig => {
  switch (type) {
    case 'catalog':
      return { title: 'Справочник: Номенклатура (выбор каталога)', columns: [{ key: 'groupCode', title: 'КОД ГРУППЫ', left: 500 }], createButtonLabel: 'Создать каталог', isFlat: false, hasCreateButton: true };
    case 'analogSelect':
      return { title: 'Выбор материала для аналога', columns: [], isFlat: false, hasCreateButton: false };
    case 'nomenclatureGroup':
      return { title: 'Справочник: Группы номенклатуры (Выбор)', columns: [{ key: 'typeMaterialName', title: 'ГРУППА УЧЕТА', left: 500 }], createButtonLabel: 'Создать группу номенклатуры', isFlat: true, hasCreateButton: true };
    case 'nomenclatureType':
      return { title: 'Справочник: Виды номенклатуры (Выбор)', columns: [{ key: 'typePurposeName', title: 'ГРУППА НОМЕНКЛАТУРЫ', left: 500 }], createButtonLabel: 'Создать вид номенклатуры', isFlat: true, hasCreateButton: true };
    case 'attributeType':
      return { title: 'Справочник: Виды характеристик (Выбор)', columns: [{ key: 'designation', title: 'ОБОЗНАЧЕНИЕ', left: 500 }], createButtonLabel: 'Создать вид характеристики', isFlat: true, hasCreateButton: true };
    case 'unit':
      return { title: 'Справочник: Единицы измерения (Выбор)', columns: [{ key: 'description', title: 'ОПИСАНИЕ', left: 500 }], createButtonLabel: 'Создать единицу измерения', isFlat: true, hasCreateButton: true };
    case 'manufacturer':
      return { title: 'Справочник: Производители (Выбор)', columns: [{ key: 'description', title: 'ОПИСАНИЕ', left: 500 }], createButtonLabel: 'Создать производителя', isFlat: true, hasCreateButton: true };
    case 'brand':
      return { title: 'Справочник: Бренды (Выбор)', columns: [{ key: 'manufacturerName', title: 'ПРОИЗВОДИТЕЛЬ', left: 500 }, { key: 'description', title: 'ОПИСАНИЕ', left: 700 }], createButtonLabel: 'Создать бренд', isFlat: true, hasCreateButton: true };
    case 'model':
      return { title: 'Справочник: Модели (Выбор)', columns: [{ key: 'brandName', title: 'БРЕНД', left: 450 }, { key: 'manufacturerName', title: 'ПРОИЗВОДИТЕЛЬ', left: 650 }, { key: 'description', title: 'ОПИСАНИЕ', left: 850 }], createButtonLabel: 'Создать модель', isFlat: true, hasCreateButton: true };
    case 'country':
      return { title: 'Справочник: Страны (Выбор)', columns: [], createButtonLabel: 'Создать страну', isFlat: true, hasCreateButton: true };
    case 'supplier':
      return { title: 'Справочник: Поставщики (Выбор)', columns: [], createButtonLabel: 'Создать поставщика', isFlat: true, hasCreateButton: true };
    case 'shortDescription':
      return { title: 'Справочник: Типы описаний (Выбор)', columns: [], createButtonLabel: 'Создать тип описания', isFlat: true, hasCreateButton: true };
    case 'templateCategory':
      return { title: 'Справочник: Шаблоны (выбор каталога)', columns: [], createButtonLabel: 'Создать каталог', isFlat: true, hasCreateButton: true };
    case 'stationType':
      return { title: 'Справочник: Типы станций (Выбор)', columns: [], createButtonLabel: 'Создать тип станции', isFlat: true, hasCreateButton: true };
    case 'stationManufacturer':
      return { title: 'Справочник: Производители станций (Выбор)', columns: [], createButtonLabel: 'Создать производителя', isFlat: true, hasCreateButton: true };
    case 'stationModel':
      return { title: 'Справочник: Модели станций (Выбор)', columns: [{ key: 'code', title: 'КОД', left: 400 }, { key: 'article', title: 'АРТИКУЛ', left: 600 }], createButtonLabel: 'Создать модель', isFlat: true, hasCreateButton: true };
    case 'stationConfiguration':
      return { title: 'Справочник: Конфигурации станций (Выбор)', columns: [{ key: 'modelName', title: 'МОДЕЛЬ', left: 500 }], createButtonLabel: 'Создать конфигурацию', isFlat: true, hasCreateButton: true };
    case 'holding':
      return { title: 'Справочник: Холдинги (Выбор)', columns: [], isFlat: true, hasCreateButton: false };
    case 'enterprise':
      return { title: 'Справочник: Предприятия (Выбор)', columns: [], isFlat: true, hasCreateButton: false };
    case 'workshop':
      return { title: 'Справочник: Цеха (Выбор)', columns: [{ key: 'enterpriseName', title: 'ПРЕДПРИЯТИЕ', left: 500 }], isFlat: true, hasCreateButton: false };
    case 'section':
      return { title: 'Справочник: Участки (Выбор)', columns: [{ key: 'workshopName', title: 'ЦЕХ', left: 500 }], isFlat: true, hasCreateButton: false };
    default:
      return { title: '', columns: [], isFlat: true, hasCreateButton: false };
  }
};

const getFlatPopupIcon = (type: PopupType): string | null => {
  switch (type) {
    case 'nomenclatureGroup': return Popup2;
    case 'nomenclatureType': return Popup3;
    case 'attributeType': return Popup4;
    case 'unit': return Popup5;
    case 'manufacturer': return Popup6;
    case 'brand': return Popup7;
    case 'model': return Popup8;
    case 'country': return Popup9;
    case 'supplier': return Popup10;
    case 'shortDescription': return Popup11;
    case 'templateCategory': return Icon11;
    case 'stationType': return Popup9;
    case 'stationManufacturer': return Popup6;
    case 'stationModel': return Popup9;
    case 'stationConfiguration': return Popup9;
    case 'holding': return Popup9;
    case 'enterprise': return Popup9;
    case 'workshop': return Popup9;
    case 'section': return Popup9;
    default: return null;
  }
};

interface BackendGroup {
  uid: string;
  name: string;
  children: BackendGroup[];
  materials: any[];
}

interface FlatReferenceItem {
  uid: string;
  typeName?: string;
  typeMaterialName?: string;
  typePurposeName?: string;
}

const convertBackendTree = (backendGroups: BackendGroup[]): TreeItem[] => {
  return backendGroups.map(g => ({
    id: g.uid, name: g.name, groupCode: '',
    children: g.children && g.children.length > 0 ? convertBackendTree(g.children) : undefined,
  }));
};

const convertBackendTreeWithMaterials = (backendGroups: BackendGroup[], excludeUids: string[] = []): TreeItem[] => {
  const excludeSet = new Set(excludeUids);
  return backendGroups.map(g => {
    const materialItems: TreeItem[] = (g.materials || [])
      .filter((m: any) => !excludeSet.has(m.uid))
      .map((m: any) => ({ id: m.uid, name: m.name || 'Без названия', isMaterial: true }));
    const childGroups = g.children && g.children.length > 0 ? convertBackendTreeWithMaterials(g.children, excludeUids) : [];
    return { id: g.uid, name: g.name, groupCode: '', children: [...childGroups, ...materialItems] };
  });
};

const convertFlatReference = (items: FlatReferenceItem[]): TreeItem[] => {
  return items.map(item => ({
    id: item.uid, name: item.typeName || '',
    typeMaterialName: item.typeMaterialName || '',
    typePurposeName: item.typePurposeName || '',
  }));
};

const convertGenericFlat = (items: any[]): TreeItem[] => {
  return items.map(item => ({
    id: item.uid, name: item.name,
    description: item.description || '',
    designation: item.designation || '',
    manufacturerName: item.manufacturerName || '',
    brandName: item.brandName || '',
    manufacturerUid: item.manufacturerUid || '',
  }));
};

const flattenGroups = (items: TreeItem[]): { uid: string; name: string }[] => {
  let result: { uid: string; name: string }[] = [];
  items.forEach(item => {
    if (!item.isMaterial) {
      result.push({ uid: item.id, name: item.name });
      if (item.children) result = result.concat(flattenGroups(item.children));
    }
  });
  return result;
};

interface CatalogSelectPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (id: string, name: string) => void;
  popupType: PopupType;
  filterParam?: string;
  excludeUids?: string[];
}

const ROW_HEIGHT = 54;
const HEADER_HEIGHT = 54;
const VISIBLE_ROWS = 7;
const TABLE_WIDTH = 992;
const TABLE_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS + HEADER_HEIGHT;

const CatalogSelectPopup: React.FC<CatalogSelectPopupProps> = ({
  isOpen, onClose, onSelect, popupType, filterParam, excludeUids = [],
}) => {
  const { openTab, activeTabId } = useTabs();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [data, setData] = useState<TreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [createFormName, setCreateFormName] = useState('');
  const [createFormDescription, setCreateFormDescription] = useState('');
  const [createFormDesignation, setCreateFormDesignation] = useState('');
  const [createFormTypeMaterialUid, setCreateFormTypeMaterialUid] = useState('');
  const [createFormTypePurposeUid, setCreateFormTypePurposeUid] = useState('');
  const [createFormManufacturerUid, setCreateFormManufacturerUid] = useState('');
  const [createFormBrandUid, setCreateFormBrandUid] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [typeMaterials, setTypeMaterials] = useState<any[]>([]);
  const [typePurposes, setTypePurposes] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => { if (isOpen) setInternalOpen(true); }, [isOpen]);

  const handleClose = () => { setInternalOpen(false); onClose(); };

  const config = getPopupConfig(popupType);
  const isCatalog = popupType === 'catalog';
  const isAnalogSelect = popupType === 'analogSelect';
  const isTemplateCategory = popupType === 'templateCategory';
  const flatIcon = getFlatPopupIcon(popupType);

  const loadReferenceData = async () => {
    try {
      if (popupType === 'nomenclatureGroup') {
        const res = await AxiosService.get(ConstantInfo.restApiNomenclatureTypeMaterials);
        setTypeMaterials(res.data || []);
      } else if (popupType === 'nomenclatureType') {
        const res = await AxiosService.get(ConstantInfo.restApiNomenclatureTypePurposes);
        setTypePurposes(res.data || []);
      } else if (popupType === 'brand') {
        const res = await AxiosService.get(ConstantInfo.restApiNomenclatureManufacturers);
        setManufacturers(res.data || []);
      } else if (popupType === 'model') {
        const [mRes, bRes] = await Promise.all([
          AxiosService.get(ConstantInfo.restApiNomenclatureManufacturers),
          AxiosService.get(ConstantInfo.restApiNomenclatureBrands),
        ]);
        setManufacturers(mRes.data || []);
        setAllBrands(bRes.data || []);
      }
    } catch (e) { console.error('Ошибка загрузки справочных данных:', e); }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isCatalog) {
        const response = await AxiosService.get(ConstantInfo.restApiNomenclatureTree);
        const converted = convertBackendTree(response.data);
        setData(converted);
        if (converted.length > 0) setOpenFolders(new Set([converted[0].id]));
      } else if (isAnalogSelect) {
        const response = await AxiosService.get(ConstantInfo.restApiNomenclatureTree);
        const converted = convertBackendTreeWithMaterials(response.data, excludeUids);
        setData(converted);
        if (converted.length > 0) setOpenFolders(new Set([converted[0].id]));
      } else if (isTemplateCategory) {
        const response = await AxiosService.get(ConstantInfo.restApiTemplatesCategories);
        setData((response.data || []).map((item: any) => ({ id: String(item.id), name: item.name })));
      } else if (popupType === 'nomenclatureGroup') {
        const url = filterParam ? `${ConstantInfo.restApiNomenclatureTypePurposes}?typeMaterialUid=${filterParam}` : ConstantInfo.restApiNomenclatureTypePurposes;
        setData(convertFlatReference((await AxiosService.get(url)).data));
      } else if (popupType === 'nomenclatureType') {
        const url = filterParam ? `${ConstantInfo.restApiNomenclatureTypeProducts}?typePurposeUid=${filterParam}` : ConstantInfo.restApiNomenclatureTypeProducts;
        setData(convertFlatReference((await AxiosService.get(url)).data));
      } else if (popupType === 'attributeType') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiNomenclatureTypeAttributes)).data));
      } else if (popupType === 'unit') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiNomenclatureMeasures)).data));
      } else if (popupType === 'supplier') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiSuppliersList)).data));
      } else if (popupType === 'shortDescription') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiSupplierDescriptionTypes)).data));
      } else if (popupType === 'manufacturer') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiNomenclatureManufacturers)).data));
      } else if (popupType === 'brand') {
        const url = filterParam ? `${ConstantInfo.restApiNomenclatureBrands}?manufacturerUid=${filterParam}` : ConstantInfo.restApiNomenclatureBrands;
        setData(convertGenericFlat((await AxiosService.get(url)).data));
      } else if (popupType === 'model') {
        const url = filterParam ? `${ConstantInfo.restApiNomenclatureModels}?brandUid=${filterParam}` : ConstantInfo.restApiNomenclatureModels;
        setData(convertGenericFlat((await AxiosService.get(url)).data));
      } else if (popupType === 'country') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiNomenclatureCountries)).data));
      } else if (popupType === 'stationType') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiStationTypes)).data));
      } else if (popupType === 'stationManufacturer') {
        setData(convertGenericFlat((await AxiosService.get(ConstantInfo.restApiStationManufacturers)).data));
      } else if (popupType === 'stationModel') {
        setData(((await AxiosService.get(ConstantInfo.restApiStationModels)).data || []).map((item: any) => ({
          id: item.uid, name: item.name,
          code: item.code ? String(item.code).padStart(4, '0') : '',
          article: item.article || '',
        })));
      } else if (popupType === 'stationConfiguration') {
        const url = filterParam 
          ? `${ConstantInfo.restApiStationConfigurations}?modelId=${filterParam}` 
          : ConstantInfo.restApiStationConfigurations;
        setData(((await AxiosService.get(url)).data || []).map((item: any) => ({
          id: item.uid, name: item.name, modelName: item.modelName || '',
        })));
      } else if (popupType === 'holding') {
        setData(((await AxiosService.get(ConstantInfo.restApiHoldings)).data || []).map((item: any) => ({
          id: String(item.id), name: item.name,
        })));
      } else if (popupType === 'enterprise') {
        setData(((await AxiosService.get(ConstantInfo.restApiEnterprises)).data || []).map((item: any) => ({
          id: String(item.id), name: item.name,
        })));
      } else if (popupType === 'workshop') {
        const url = filterParam ? `${ConstantInfo.restApiWorkshops}?enterpriseId=${filterParam}` : ConstantInfo.restApiWorkshops;
        setData(((await AxiosService.get(url)).data || []).map((item: any) => ({
          id: String(item.id), name: item.name, enterpriseName: item.enterpriseName || '',
        })));
      } else if (popupType === 'section') {
        const url = filterParam ? `${ConstantInfo.restApiSections}?workshopId=${filterParam}` : ConstantInfo.restApiSections;
        setData(((await AxiosService.get(url)).data || []).map((item: any) => ({
          id: String(item.id), name: item.name, workshopName: item.workshopName || '',
        })));
      }
    } catch (error) { console.error('Ошибка загрузки данных:', error); setData([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (internalOpen) {
      setOpenFolders(new Set());
      loadData();
      if (config.hasCreateButton && !isCatalog && !isTemplateCategory) loadReferenceData();
    }
  }, [internalOpen, popupType, filterParam, excludeUids.join(',')]);

  useEffect(() => {
    if (internalOpen) { loadData(); if (config.hasCreateButton && !isCatalog && !isTemplateCategory) loadReferenceData(); }
  }, [activeTabId]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => { const next = new Set(prev); next.has(folderId) ? next.delete(folderId) : next.add(folderId); return next; });
  };

  const checkScroll = () => { const c = scrollContainerRef.current; if (!c) return; setHasScroll(c.scrollHeight > c.clientHeight); };
  useEffect(() => { const t = setTimeout(checkScroll, 100); return () => clearTimeout(t); }, [openFolders, data]);
  useEffect(() => {
    const c = scrollContainerRef.current; if (!c) return;
    checkScroll(); c.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll); ro.observe(c);
    return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const handleItemClick = (id: string, name: string) => { onSelect?.(id, name); handleClose(); };

  const handleCreateGroup = async (groupName: string, parentUid: string | null) => {
    setIsCreatingGroup(true);
    try {
      await AxiosService.post('/api/nomenclature/groups', { name: groupName, parentUid: parentUid });
      const response = await AxiosService.get(ConstantInfo.restApiNomenclatureTree);
      setData(isAnalogSelect ? convertBackendTreeWithMaterials(response.data, excludeUids) : convertBackendTree(response.data));
      setShowCreateGroup(false);
    } catch (error) { console.error('Ошибка создания группы:', error); }
    finally { setIsCreatingGroup(false); }
  };

  const handleTemplateCreateGroup = async (groupName: string) => {
    setIsCreatingGroup(true);
    try {
      await AxiosService.post(ConstantInfo.restApiTemplatesCategories, { name: groupName });
      const response = await AxiosService.get(ConstantInfo.restApiTemplatesCategories);
      setData((response.data || []).map((item: any) => ({ id: String(item.id), name: item.name })));
      setShowCreateGroup(false);
    } catch (error) { console.error('Ошибка создания категории шаблонов:', error); }
    finally { setIsCreatingGroup(false); }
  };

  const handleCreateClick = () => {
    if (isCatalog) { setShowCreateGroup(true); return; }
    if (isTemplateCategory) { setShowCreateGroup(true); return; }
    if (popupType === 'supplier') {
      AxiosService.get(ConstantInfo.restApiSupplierGenerate).then(res => {
        openTab(`/references/suppliers/create/${res.data.uid}/${res.data.code}`, 'Поставщик (новый)', null);
      }).catch(() => {
        openTab(`/references/suppliers/create/${crypto.randomUUID()}/0`, 'Поставщик (новый)', null);
      });
      return;
    }
    if (popupType === 'stationModel') {
      const newUid = crypto.randomUUID();
      openTab(`/references/station-models/create/${newUid}`, 'Модель станции (новая)', null);
      return;
    }
    if (popupType === 'stationConfiguration') {
      const newUid = crypto.randomUUID();
      openTab(`/references/station-configurations/create/${newUid}`, 'Конфигурация станции (новая)', null);
      return;
    }
    setCreateFormName(''); setCreateFormDescription(''); setCreateFormDesignation('');
    setCreateFormTypeMaterialUid(''); setCreateFormTypePurposeUid('');
    setCreateFormManufacturerUid(''); setCreateFormBrandUid(''); setFilteredBrands([]);
    setShowCreatePopup(true);
  };

  const handleCreateSubmit = async () => {
    if (!createFormName.trim()) return;
    setIsCreating(true);
    try {
      let url = '';
      const body: any = { name: createFormName.trim() };
      switch (popupType) {
        case 'templateCategory': url = ConstantInfo.restApiTemplatesCategories; break;
        case 'nomenclatureGroup': url = ConstantInfo.restApiNomenclatureTypePurposes; body.typeMaterialUid = createFormTypeMaterialUid || null; break;
        case 'nomenclatureType': url = ConstantInfo.restApiNomenclatureTypeProducts; body.typePurposeUid = createFormTypePurposeUid || null; break;
        case 'attributeType': url = ConstantInfo.restApiNomenclatureTypeAttributes; body.designation = createFormDesignation.trim(); break;
        case 'unit': url = ConstantInfo.restApiNomenclatureMeasures; body.description = createFormDescription.trim(); break;
        case 'manufacturer': url = ConstantInfo.restApiNomenclatureManufacturers; body.description = createFormDescription.trim(); break;
        case 'brand': url = ConstantInfo.restApiNomenclatureBrands; body.description = createFormDescription.trim(); body.manufacturerUid = createFormManufacturerUid || null; break;
        case 'model': url = ConstantInfo.restApiNomenclatureModels; body.description = createFormDescription.trim(); body.brandUid = createFormBrandUid || null; break;
        case 'country': url = ConstantInfo.restApiNomenclatureCountries; break;
        case 'shortDescription': url = ConstantInfo.restApiSupplierDescriptionTypes; break;
        case 'stationType': url = ConstantInfo.restApiStationTypes; body.description = createFormDescription.trim(); break;
        case 'stationManufacturer': url = ConstantInfo.restApiStationManufacturers; body.description = createFormDescription.trim(); break;
      }
      if (url) {
        await AxiosService.post(url, body);
        await loadData();
        if (config.hasCreateButton && !isCatalog && !isTemplateCategory) loadReferenceData();
        setShowCreatePopup(false);
      }
    } catch (error) { console.error('Ошибка создания:', error); }
    finally { setIsCreating(false); }
  };

  const handleManufacturerChange = (uid: string) => {
    setCreateFormManufacturerUid(uid); setCreateFormBrandUid('');
    setFilteredBrands(uid ? allBrands.filter(b => (b as any).manufacturerUid === uid) : []);
  };

  const countRows = (items: TreeItem[]): number => {
    if (config.isFlat) return items.length;
    let count = 0;
    items.forEach(item => { count += 1; if (openFolders.has(item.id) && item.children) count += countRows(item.children); });
    return count;
  };

  const renderTree = (items: TreeItem[], depth: number = 0): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    items.forEach((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openFolders.has(item.id);
      const shift = depth * 20;
      const isMaterial = item.isMaterial === true;
      result.push(
        <div key={item.id}
          onClick={() => { if (isMaterial) handleItemClick(item.id, item.name); else if (hasChildren) toggleFolder(item.id); }}
          onDoubleClick={() => handleItemClick(item.id, item.name)}
          style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', cursor: 'pointer', userSelect: 'none', boxSizing: 'border-box', position: 'relative', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5', paddingLeft: 20 + shift, paddingRight: 40 }}
        >
          {isMaterial ? <img src={Icon13} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} /> : <img src={hasChildren ? (isOpen ? Icon12 : Icon11) : Icon11} alt="" style={{ width: hasChildren && isOpen ? 19 : 18, height: 16, flexShrink: 0 }} />}
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: isMaterial ? 400 : 700, color: '#2D4059', marginLeft: 10, maxWidth: isMaterial ? 600 : (400 - shift), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
          {!isAnalogSelect && config.columns.map(col => (
            <span key={col.key} style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: col.left }}>{item[col.key] || ''}</span>
          ))}
        </div>
      );
      if (isOpen && hasChildren) result.push(...renderTree(item.children!, depth + 1));
    });
    return result;
  };

  const renderFlatList = (items: TreeItem[]): React.ReactNode[] => {
    return items.map((item) => (
      <div key={item.id} onClick={() => handleItemClick(item.id, item.name)} onDoubleClick={() => handleItemClick(item.id, item.name)}
        style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', cursor: 'pointer', userSelect: 'none', boxSizing: 'border-box', position: 'relative', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5', paddingLeft: 22, paddingRight: 40 }}
      >
        {flatIcon && <img src={flatIcon} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />}
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: flatIcon ? 10 : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: (config.columns[0]?.left || 500) - 50 }}>{item.name}</span>
        {config.columns.map(col => (
          <span key={col.key} style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: col.left, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{item[col.key] || ''}</span>
        ))}
      </div>
    ));
  };

  const totalRows = countRows(data);
  const emptyRows = Math.max(0, VISIBLE_ROWS - totalRows);

  const inputStyle: React.CSSProperties = { width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' };
  const selectStyle: React.CSSProperties = { width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' };

  const getCreateTitle = (): string => {
    switch (popupType) {
      case 'templateCategory': return 'Создание каталога шаблонов';
      case 'nomenclatureGroup': return 'Создание группы номенклатуры';
      case 'nomenclatureType': return 'Создание вида номенклатуры';
      case 'attributeType': return 'Создание вида характеристики';
      case 'unit': return 'Создание единицы измерения';
      case 'manufacturer': return 'Создание производителя';
      case 'brand': return 'Создание бренда';
      case 'model': return 'Создание модели';
      case 'country': return 'Создание страны';
      case 'shortDescription': return 'Создание типа описания';
      case 'stationType': return 'Создание типа станции';
      case 'stationManufacturer': return 'Создание производителя станций';
      default: return 'Создание';
    }
  };

  if (!internalOpen) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        onClick={handleClose}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
          style={{ width: 1052, height: 680, backgroundColor: '#FFFFFF', borderRadius: 15, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10002 }}
        >
          <button onClick={handleClose} style={{ position: 'absolute', top: 20, right: 30, width: 14, height: 14, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="1.5" y1="1.5" x2="12.5" y2="12.5" stroke="#2D4059" strokeWidth="3" strokeLinecap="round" /><line x1="12.5" y1="1.5" x2="1.5" y2="12.5" stroke="#2D4059" strokeWidth="3" strokeLinecap="round" /></svg>
          </button>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 24, fontWeight: 500, color: '#2D4059', margin: '30px 0 0', textAlign: 'center' }}>{config.title}</h2>
          {config.hasCreateButton && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 30, paddingLeft: 45, paddingRight: 45 }}>
              <button style={{ width: 40, height: 40, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={handleCreateClick} style={{ height: 40, paddingLeft: 15, paddingRight: 15, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                  <img src={Icon4} alt="" style={{ width: 16, height: 16, marginLeft: 12 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 10, marginRight: 12 }}>{config.createButtonLabel || 'Создать'}</span>
                </button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', marginTop: config.hasCreateButton ? 15 : 60, alignSelf: 'center', position: 'relative', width: TABLE_WIDTH, height: TABLE_HEIGHT }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 40, boxSizing: 'border-box', position: 'relative' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>НАИМЕНОВАНИЕ</span>
                {config.columns.map(col => <span key={col.key} style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: col.left }}>{col.title}</span>)}
              </div>
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {isLoading ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9CA3AF' }}>Загрузка...</span></div> :
                  <>{config.isFlat ? renderFlatList(data) : renderTree(data)}
                    {Array.from({ length: emptyRows }).map((_, i) => <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} />)}
                  </>}
              </div>
            </div>
            {hasScroll && <div style={{ width: 10, height: TABLE_HEIGHT, paddingTop: HEADER_HEIGHT, marginLeft: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>}
          </div>
        </motion.div>
      </motion.div>
      {isCatalog && <CreateGroupPopup isOpen={showCreateGroup} currentParentName={null} currentParentUid={null} groups={flattenGroups(data)} onClose={() => setShowCreateGroup(false)} onSubmit={handleCreateGroup} isLoading={isCreatingGroup} />}
      {isTemplateCategory && <TemplateCreateGroupPopup isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} onSubmit={handleTemplateCreateGroup} isLoading={isCreatingGroup} />}
      {showCreatePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10003, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreatePopup(false)}>
          <div style={{ width: 450, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>{getCreateTitle()}</h3>
            <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Название</label><input type="text" value={createFormName} onChange={e => setCreateFormName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateSubmit(); else if (e.key === 'Escape') setShowCreatePopup(false); }} placeholder="Введите название" autoFocus style={inputStyle} /></div>
            {popupType === 'nomenclatureGroup' && <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Группа учета</label><select value={createFormTypeMaterialUid} onChange={e => setCreateFormTypeMaterialUid(e.target.value)} style={selectStyle}><option value="">Без группы учета</option>{typeMaterials.map((tm: any) => <option key={tm.uid} value={tm.uid}>{tm.typeName}</option>)}</select></div>}
            {popupType === 'nomenclatureType' && <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Группа номенклатуры</label><select value={createFormTypePurposeUid} onChange={e => setCreateFormTypePurposeUid(e.target.value)} style={selectStyle}><option value="">Без группы</option>{typePurposes.map((tp: any) => <option key={tp.uid} value={tp.uid}>{tp.typeName}</option>)}</select></div>}
            {popupType === 'attributeType' && <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Обозначение</label><input type="text" value={createFormDesignation} onChange={e => setCreateFormDesignation(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateSubmit(); else if (e.key === 'Escape') setShowCreatePopup(false); }} placeholder="Введите обозначение" style={inputStyle} /></div>}
            {(popupType === 'unit' || popupType === 'manufacturer' || popupType === 'brand' || popupType === 'model' || popupType === 'stationType' || popupType === 'stationManufacturer') && <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Описание</label><input type="text" value={createFormDescription} onChange={e => setCreateFormDescription(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateSubmit(); else if (e.key === 'Escape') setShowCreatePopup(false); }} placeholder="Введите описание" style={inputStyle} /></div>}
            {(popupType === 'brand' || popupType === 'model') && <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Производитель</label><select value={createFormManufacturerUid} onChange={e => popupType === 'model' ? handleManufacturerChange(e.target.value) : setCreateFormManufacturerUid(e.target.value)} style={selectStyle}><option value="">Выберите производителя</option>{manufacturers.map((m: any) => <option key={m.uid} value={m.uid}>{m.name}</option>)}</select></div>}
            {popupType === 'model' && <div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Бренд</label><select value={createFormBrandUid} onChange={e => setCreateFormBrandUid(e.target.value)} style={{ ...selectStyle, opacity: createFormManufacturerUid ? 1 : 0.5, cursor: createFormManufacturerUid ? 'pointer' : 'not-allowed' }} disabled={!createFormManufacturerUid}><option value="">{createFormManufacturerUid ? 'Выберите бренд' : 'Сначала выберите производителя'}</option>{filteredBrands.map((b: any) => <option key={b.uid} value={b.uid}>{b.name}</option>)}</select></div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={handleCreateSubmit} disabled={isCreating || !createFormName.trim()} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: createFormName.trim() && !isCreating ? '#666EFE' : '#BCC8FF', cursor: createFormName.trim() && !isCreating ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>{isCreating ? 'Сохранение...' : 'Создать'}</button><button onClick={() => setShowCreatePopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogSelectPopup;