// NomenclatureCreatePage.tsx — read-only версия для клона
// Основное и Характеристики активны, поля read-only, Закрыть без попапа
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTabs } from '../../../context/TabContext';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import CatalogSelectPopup from './CatalogSelectPopup';
import ProgressBar from './ProgressBar';
import type { PopupType } from './CatalogSelectPopup';
import MainTab from './MainTab';
import CharacteristicsTab from './CharacteristicsTab';
import Icon7 from '../../../assets/References/NomenclatureCreatePage/Icon7.svg';
import IconArrow from '../../../assets/References/NomenclatureCreatePage/IconArrow.svg';
import IconArrow2 from '../../../assets/References/NomenclatureCreatePage/IconArrow2.svg';
import IconOne from '../../../assets/References/NomenclatureCreatePage/IconOne.svg';
import IconTwo from '../../../assets/References/NomenclatureCreatePage/IconTwo.svg';

export interface Folder { id: number; name: string; isOpen: boolean; items: FolderItem[]; }
export interface FolderItem { id: number; characteristic?: string; designation?: string; unit?: string; value?: string; name?: string; status?: string; date?: string; }
export interface TypeMaterialOption { uid: string; typeName: string; }
export interface ImageItem { uid: string; url: string; originalName: string; }
export interface PriceItem { uid: string; price: number; priceDate: string; supplierName: string; previousPrice: number | null; priceChange: number | null; }
export interface SupplierOption { uid: string; name: string; }
export interface DocumentItem { uid: string; materialUid: string; documentName: string; filePath: string; originalName: string; url: string; createdAt: string; }
export interface LocalDocument { localId: string; documentName: string; file: File; }
export interface LocalSupply { localId: string; supplierUid: string; supplierName: string; supplyDate: string; documentName: string; file: File | null; }
export interface LocalCharacteristic { localId: string; uid: string | null; attributeTypeUid: string | null; attributeName: string | null; customName: string | null; value: string; measureUid: string | null; measureName: string | null; isCustom: boolean; isRequired: boolean; }
export interface LocalImageItem { file: File; url: string; }
export interface LocalCode { codeType: string; codeValue: string; codeKind: string; file: File | null; preview: string | null; }
export interface ServerCode { uid: string; codeType: string; codeValue: string; codeKind: string; fileUrl: string | null; originalName: string | null; }

export interface CommonProps {
  uid?: string; code?: string; name: string; article: string; description: string; isEdit: boolean; isSaving: boolean; isUploading: boolean; isUploadingBlueprint: boolean;
  images: ImageItem[]; blueprints: ImageItem[]; documents: DocumentItem[]; prices: PriceItem[]; suppliers: SupplierOption[];
  selectedImageIndex: number; selectedBlueprintIndex: number; selectedCatalog: string; selectedCatalogId: string;
  selectedAccountingGroup: string; selectedAccountingGroupId: string; accountingGroupOpen: boolean;
  selectedNomenclatureGroup: string; selectedNomenclatureGroupId: string; selectedNomenclatureType: string; selectedNomenclatureTypeId: string;
  selectedUnit: string; selectedUnitId: string; selectedManufacturer: string; selectedManufacturerId: string;
  selectedBrand: string; selectedBrandId: string; selectedModel: string; selectedModelId: string; selectedCountry: string; selectedCountryId: string;
  usage: boolean; wasteMaterial: boolean; recycleMaterial: boolean; nameFocused: boolean; articleFocused: boolean; descriptionFocused: boolean;
  showAddPricePopup: boolean; newPrice: string; newPriceDate: string; newPriceSupplierUid: string; fullscreenImage: boolean; fullscreenBlueprint: boolean;
  isLoading: boolean; isLoadingPrices: boolean; typeMaterials: TypeMaterialOption[];
  fileInputRef: React.RefObject<HTMLInputElement>; blueprintInputRef: React.RefObject<HTMLInputElement>; documentInputRef: React.RefObject<HTMLInputElement>;
  localCharacteristics: LocalCharacteristic[]; setLocalCharacteristics: React.Dispatch<React.SetStateAction<LocalCharacteristic[]>>;
  localDocuments: LocalDocument[]; setLocalDocuments: React.Dispatch<React.SetStateAction<LocalDocument[]>>;
  localSupplies: LocalSupply[]; setLocalSupplies: React.Dispatch<React.SetStateAction<LocalSupply[]>>;
  localImages: LocalImageItem[]; setLocalImages: React.Dispatch<React.SetStateAction<LocalImageItem[]>>;
  localBlueprints: LocalImageItem[]; setLocalBlueprints: React.Dispatch<React.SetStateAction<LocalImageItem[]>>;
  localBarcodes: LocalCode[]; setLocalBarcodes: React.Dispatch<React.SetStateAction<LocalCode[]>>;
  localSkus: LocalCode[]; setLocalSkus: React.Dispatch<React.SetStateAction<LocalCode[]>>;
  localQrCodes: LocalCode[]; setLocalQrCodes: React.Dispatch<React.SetStateAction<LocalCode[]>>;
  serverBarcodes: ServerCode[]; serverSkus: ServerCode[];
  setName: (v: string) => void; setArticle: (v: string) => void; setDescription: (v: string) => void;
  setNameFocused: (v: boolean) => void; setArticleFocused: (v: boolean) => void; setDescriptionFocused: (v: boolean) => void;
  toggleUsage: () => void; toggleWasteMaterial: () => void; toggleRecycleMaterial: () => void;
  setSelectedCatalog: (v: string) => void; setSelectedCatalogId: (v: string) => void;
  setSelectedAccountingGroup: (v: string) => void; setSelectedAccountingGroupId: (v: string) => void; setAccountingGroupOpen: (v: boolean) => void;
  setSelectedNomenclatureGroup: (v: string) => void; setSelectedNomenclatureGroupId: (v: string) => void;
  setSelectedNomenclatureType: (v: string) => void; setSelectedNomenclatureTypeId: (v: string) => void;
  setSelectedUnit: (v: string) => void; setSelectedUnitId: (v: string) => void;
  setSelectedManufacturer: (v: string) => void; setSelectedManufacturerId: (v: string) => void;
  setSelectedBrand: (v: string) => void; setSelectedBrandId: (v: string) => void;
  setSelectedModel: (v: string) => void; setSelectedModelId: (v: string) => void;
  setSelectedCountry: (v: string) => void; setSelectedCountryId: (v: string) => void;
  setImages: (v: ImageItem[]) => void; setSelectedImageIndex: (v: number | ((p: number) => number)) => void; setIsUploading: (v: boolean) => void; setFullscreenImage: (v: boolean) => void;
  setBlueprints: (v: ImageItem[]) => void; setSelectedBlueprintIndex: (v: number | ((p: number) => number)) => void; setIsUploadingBlueprint: (v: boolean) => void; setFullscreenBlueprint: (v: boolean) => void;
  setDocuments: (v: DocumentItem[]) => void; setPrices: (v: PriceItem[]) => void; setShowAddPricePopup: (v: boolean) => void; setNewPrice: (v: string) => void; setNewPriceDate: (v: string) => void; setNewPriceSupplierUid: (v: string) => void; setSuppliers: (v: SupplierOption[]) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; handleDeleteImage: (uid: string) => void;
  handleBlueprintUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; handleDeleteBlueprint: (uid: string) => void;
  handleDocumentUpload: (documentName: string, file: File) => void; handleDeleteDocument: (uid: string) => void;
  fetchPrices: () => void; handleAddPrice: () => void; handleDeletePrice: (uid: string) => void; fetchSuppliers: () => void;
  openPopup: (type: PopupType) => void; handleAccountingGroupSelect: (o: TypeMaterialOption) => void;
  isDataSaved: boolean;
  validationErrors: Set<string>;
  setValidationErrors: React.Dispatch<React.SetStateAction<Set<string>>>;
  isFinishedProduct: boolean;
  isReadOnly?: boolean;
}

const REQUIRED_ATTRIBUTES = ['Длина', 'Ширина', 'Высота', 'Масса'];

const NomenclatureCreatePage = () => {
  const { uid, code } = useParams<{ uid: string; code: string }>();
  const { tabs, activeTabId, closeTab } = useTabs();

  const [activeTab, setActiveTab] = useState(0);
  const [tabsCollapsed, setTabsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blueprintInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(''); const [article, setArticle] = useState(''); const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false); const [isEdit, setIsEdit] = useState(false);
  const [nameFocused, setNameFocused] = useState(false); const [articleFocused, setArticleFocused] = useState(false); const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [usage, setUsage] = useState(false); const [wasteMaterial, setWasteMaterial] = useState(false); const [recycleMaterial, setRecycleMaterial] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(''); const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [typeMaterials, setTypeMaterials] = useState<TypeMaterialOption[]>([]);
  const [selectedAccountingGroup, setSelectedAccountingGroup] = useState(''); const [selectedAccountingGroupId, setSelectedAccountingGroupId] = useState(''); const [accountingGroupOpen, setAccountingGroupOpen] = useState(false);
  const [selectedNomenclatureGroup, setSelectedNomenclatureGroup] = useState(''); const [selectedNomenclatureGroupId, setSelectedNomenclatureGroupId] = useState('');
  const [selectedNomenclatureType, setSelectedNomenclatureType] = useState(''); const [selectedNomenclatureTypeId, setSelectedNomenclatureTypeId] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(''); const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState(''); const [selectedManufacturerId, setSelectedManufacturerId] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(''); const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModel, setSelectedModel] = useState(''); const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(''); const [selectedCountryId, setSelectedCountryId] = useState('');
  const [localCharacteristics, setLocalCharacteristics] = useState<LocalCharacteristic[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]); const [selectedImageIndex, setSelectedImageIndex] = useState(0); const [fullscreenImage, setFullscreenImage] = useState(false);
  const [blueprints, setBlueprints] = useState<ImageItem[]>([]); const [selectedBlueprintIndex, setSelectedBlueprintIndex] = useState(0); const [fullscreenBlueprint, setFullscreenBlueprint] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const isReadOnly = true;
  const isFinishedProduct = selectedAccountingGroup === 'Готовая деталь';

  const allTabs = ['Основное', 'Характеристики', 'Документы', 'Остатки', 'Поставщики', 'История цен', 'Аналоги', 'Рейтинг', 'Интеграция'];
  const tabs_list = isFinishedProduct 
    ? ['Основное', 'Характеристики', 'Документы', 'На складе', 'Интеграция']
    : allTabs;

  useEffect(() => {
    (async () => { try { setTypeMaterials((await AxiosService.get(ConstantInfo.restApiNomenclatureTypeMaterials)).data || []); } catch (e) { console.error(e); } })();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const cp = window.location.pathname;
    const isEditMode = cp.includes('/edit/');
    setIsEdit(isEditMode);
    if (isEditMode) {
      loadMaterialData(uid);
      fetchCharacteristics();
      fetchImages();
      fetchBlueprints();
    }
  }, [uid]);

  const fetchImages = async () => { if (!uid) return; try { setImages(((await AxiosService.get(ConstantInfo.restApiNomenclatureImages(uid))).data || []).map((img: any) => ({ uid: img.uid, url: img.url ? ConstantInfo.fileDir + img.url.replace(/^\//, '') : '', originalName: img.originalName || '' }))); } catch (e) { console.error(e); } };
  const fetchBlueprints = async () => { if (!uid) return; try { setBlueprints(((await AxiosService.get(ConstantInfo.restApiNomenclatureBlueprints(uid))).data || []).map((bp: any) => ({ uid: bp.uid, url: bp.url ? ConstantInfo.fileDir + bp.url.replace(/^\//, '') : '', originalName: bp.originalName || '' }))); } catch (e) { console.error(e); } };

  const fetchCharacteristics = async () => { 
    if (!uid) return; 
    try { 
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureCharacteristics(uid));
      const serverChars = res.data || [];
      setLocalCharacteristics(serverChars.map((c: any) => ({
        localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        uid: c.uid, attributeTypeUid: c.attributeTypeUid, attributeName: c.attributeName,
        customName: c.customName, value: c.value || '', measureUid: c.measureUid, measureName: c.measureName,
        isCustom: c.isCustom, isRequired: c.attributeName && REQUIRED_ATTRIBUTES.includes(c.attributeName),
      })));
    } catch (e) { console.error(e); } 
  };
  
  const loadMaterialData = async (muid: string): Promise<void> => { 
    setIsLoading(true); 
    try { 
      const d = (await AxiosService.get(ConstantInfo.restApiNomenclatureGetMaterial(muid))).data; 
      setName(d.name || ''); setArticle(d.article || ''); setDescription(d.description || ''); 
      setUsage(d.usage || false); setWasteMaterial(d.wasteMaterial || false); setRecycleMaterial(d.recycleMaterial || false); 
      if (d.groupUid) { setSelectedCatalogId(d.groupUid); setSelectedCatalog(d.groupName || ''); }
      if (d.typeMainUid) { setSelectedAccountingGroupId(d.typeMainUid); setSelectedAccountingGroup(d.typeMainName || ''); }
      if (d.typePurposeUid) { setSelectedNomenclatureGroupId(d.typePurposeUid); setSelectedNomenclatureGroup(d.typePurposeName || ''); }
      if (d.typeProductUid) { setSelectedNomenclatureTypeId(d.typeProductUid); setSelectedNomenclatureType(d.typeProductName || ''); }
      if (d.measureUid) { setSelectedUnitId(d.measureUid); setSelectedUnit(d.measureName || ''); }
      if (d.manufacturerUid) { setSelectedManufacturerId(d.manufacturerUid); setSelectedManufacturer(d.manufacturerName || ''); }
      if (d.brandUid) { setSelectedBrandId(d.brandUid); setSelectedBrand(d.brandName || ''); }
      if (d.modelOfBrandUid) { setSelectedModelId(d.modelOfBrandUid); setSelectedModel(d.modelOfBrandName || ''); }
      if (d.countryUid) { setSelectedCountryId(d.countryUid); setSelectedCountry(d.countryName || ''); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); } 
  };

  const getProgressStep = useCallback((): number => { return 3; }, []);

  const handleClose = () => { 
    const t = tabs.find(tab => tab.id === activeTabId); 
    if (t) closeTab(t.id); 
  };

  const noop = () => {};
  const noopStr = (v: string) => {};
  const noopBool = (v: boolean) => {};

  const activeTabStyle: React.CSSProperties = { width: 151, height: 40, borderRadius: 10, backgroundColor: '#666EFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF' };
  const mutedTabStyle: React.CSSProperties = { width: 151, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: 'none', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#BCC8FF', opacity: 0.5, pointerEvents: 'none' };
  const bottomButtonStyle: React.CSSProperties = { height: 51, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const mutedBottomStyle: React.CSSProperties = { ...bottomButtonStyle, opacity: 0.4, cursor: 'default' };
  const mutedIconStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };

  const commonProps: CommonProps = {
    uid, code, name, article, description, isEdit, isSaving: false, isUploading: false, isUploadingBlueprint: false,
    images, blueprints, documents: [], prices: [], suppliers: [],
    selectedImageIndex, selectedBlueprintIndex, selectedCatalog, selectedCatalogId,
    selectedAccountingGroup, selectedAccountingGroupId, accountingGroupOpen,
    selectedNomenclatureGroup, selectedNomenclatureGroupId, selectedNomenclatureType, selectedNomenclatureTypeId,
    selectedUnit, selectedUnitId, selectedManufacturer, selectedManufacturerId,
    selectedBrand, selectedBrandId, selectedModel, selectedModelId, selectedCountry, selectedCountryId,
    usage, wasteMaterial, recycleMaterial, nameFocused, articleFocused, descriptionFocused,
    showAddPricePopup: false, newPrice: '', newPriceDate: '', newPriceSupplierUid: '', fullscreenImage, fullscreenBlueprint,
    isLoading, isLoadingPrices: false, typeMaterials,
    fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>,
    blueprintInputRef: blueprintInputRef as React.RefObject<HTMLInputElement>,
    documentInputRef: documentInputRef as React.RefObject<HTMLInputElement>,
    localCharacteristics, setLocalCharacteristics,
    localDocuments: [], setLocalDocuments: noop as any,
    localSupplies: [], setLocalSupplies: noop as any,
    localImages: [], setLocalImages: noop as any,
    localBlueprints: [], setLocalBlueprints: noop as any,
    localBarcodes: [], setLocalBarcodes: noop as any,
    localSkus: [], setLocalSkus: noop as any,
    localQrCodes: [], setLocalQrCodes: noop as any,
    serverBarcodes: [], serverSkus: [],
    setName: noopStr, setArticle: noopStr, setDescription: noopStr,
    setNameFocused: noopBool, setArticleFocused: noopBool, setDescriptionFocused: noopBool,
    toggleUsage: noop, toggleWasteMaterial: noop, toggleRecycleMaterial: noop,
    setSelectedCatalog: noopStr, setSelectedCatalogId: noopStr,
    setSelectedAccountingGroup: noopStr, setSelectedAccountingGroupId: noopStr, setAccountingGroupOpen: noopBool,
    setSelectedNomenclatureGroup: noopStr, setSelectedNomenclatureGroupId: noopStr,
    setSelectedNomenclatureType: noopStr, setSelectedNomenclatureTypeId: noopStr,
    setSelectedUnit: noopStr, setSelectedUnitId: noopStr,
    setSelectedManufacturer: noopStr, setSelectedManufacturerId: noopStr,
    setSelectedBrand: noopStr, setSelectedBrandId: noopStr,
    setSelectedModel: noopStr, setSelectedModelId: noopStr,
    setSelectedCountry: noopStr, setSelectedCountryId: noopStr,
    setImages, setSelectedImageIndex, setIsUploading: noopBool, setFullscreenImage,
    setBlueprints, setSelectedBlueprintIndex, setIsUploadingBlueprint: noopBool, setFullscreenBlueprint,
    setDocuments: noop as any, setPrices: noop as any,
    setShowAddPricePopup: noopBool, setNewPrice: noopStr, setNewPriceDate: noopStr, setNewPriceSupplierUid: noopStr,
    setSuppliers: noop as any,
    handleImageUpload: noop as any, handleDeleteImage: noop as any,
    handleBlueprintUpload: noop as any, handleDeleteBlueprint: noop as any,
    handleDocumentUpload: noop as any, handleDeleteDocument: noop as any,
    fetchPrices: noop, handleAddPrice: noop, handleDeletePrice: noop as any, fetchSuppliers: noop,
    openPopup: noop as any, handleAccountingGroupSelect: noop as any,
    isDataSaved: true,
    validationErrors,
    setValidationErrors,
    isFinishedProduct,
    isReadOnly,
  };

  if (isLoading) return (<div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>);

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>{isEdit ? name || 'Номенклатура' : 'Справочник: Номенклатура'}</h1>
      <button onClick={handleClose} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} /></button>
      
      <div style={{ position: 'absolute', top: 99, left: 60, right: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 25, alignItems: 'center' }}>
          <button onClick={() => setActiveTab(0)} style={activeTab === 0 ? activeTabStyle : { ...activeTabStyle, backgroundColor: '#FFFFFF', color: '#2D4059' }}>
            <span>Основное</span>
          </button>
          <button onClick={() => setActiveTab(1)} style={activeTab === 1 ? activeTabStyle : { ...activeTabStyle, backgroundColor: '#FFFFFF', color: '#2D4059' }}>
            <span>Характеристики</span>
          </button>
          {tabs_list.slice(2).map((tab, i) => (
            <button key={tab} style={mutedTabStyle}>
              <span>{tab}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <button style={mutedIconStyle}><img src={IconOne} alt="" style={{ width: 20, height: 20 }} /></button>
          <button style={mutedIconStyle}><img src={IconTwo} alt="" style={{ width: 20, height: 20 }} /></button>
        </div>
      </div>

      {activeTab === 0 ? <MainTab {...commonProps} /> : <CharacteristicsTab {...commonProps} />}

      <div style={{ position: 'absolute', bottom: 25, left: 45, display: 'flex', alignItems: 'flex-end' }}><ProgressBar currentStep={getProgressStep()} /></div>
      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', alignItems: 'center', gap: 30 }}>
        <button style={{ ...mutedBottomStyle, width: 234, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059' }}>Синхронизировать</button>
        <button style={{ ...mutedBottomStyle, width: 121, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#BCC8FF', border: 'none', backgroundColor: '#BCC8FF' }}>Записать</button>
        <button style={{ ...bottomButtonStyle, width: 116, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }} onClick={handleClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default NomenclatureCreatePage;