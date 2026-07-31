// SupplierCreatePage.tsx — read-only версия для клона (только Основное и Реквизиты, Закрыть без попапа)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTabs } from '../../../context/TabContext';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import CatalogSelectPopup from '../NomenclaturePage/CatalogSelectPopup';
import type { PopupType } from '../NomenclaturePage/CatalogSelectPopup';
import SupplierMainTab from './SupplierMainTab';
import SupplierRequisitesTab from './SupplierRequisitesTab';
import SupplierDocumentsTab from './SupplierDocumentsTab';
import SupplierDeliveriesTab from './SupplierDeliveriesTab';
import SupplierAssortmentTab from './SupplierAssortmentTab';
import SupplierRatingTab from './SupplierRatingTab';
import SupplierIntegrationTab from './SupplierIntegrationTab';
import SupplierEventLogTab from './SupplierEventLogTab';
import Icon7 from '../../../assets/References/NomenclatureCreatePage/Icon7.svg';
import IconArrow from '../../../assets/References/NomenclatureCreatePage/IconArrow.svg';
import IconArrow2 from '../../../assets/References/NomenclatureCreatePage/IconArrow2.svg';
import IconOne from '../../../assets/References/NomenclatureCreatePage/IconOne.svg';
import IconTwo from '../../../assets/References/NomenclatureCreatePage/IconTwo.svg';

export interface ImageItem { uid: string; url: string; originalName: string; }
export interface DocumentItem { uid: string; supplierUid: string; documentName: string; filePath: string; originalName: string; url: string; createdAt: string; }
export interface LocalDocument { localId: string; documentName: string; file: File; }
export interface LocalImageItem { file: File; url: string; }

export interface CommonSupplierProps {
  uid?: string; name: string; isEdit: boolean; isSaving: boolean;
  images: ImageItem[]; documents: DocumentItem[];
  nameFocused: boolean; code?: number;
  isLoading: boolean;
  selectedCountry: string; selectedCountryId: string;
  address: string; selectedShortDescription: string; selectedShortDescriptionId: string;
  description: string; email: string; website: string; phone: string;
  selectedBrand: string; selectedBrandId: string;
  inn: string; ogrn: string; kpp: string;
  contactPerson: string; contactPosition: string; contactPhone: string;
  director: string; directorPosition: string;
  bankName: string; bik: string; correspondentAccount: string; settlementAccount: string;
  fileInputRef: React.RefObject<HTMLInputElement>; documentInputRef: React.RefObject<HTMLInputElement>;
  localDocuments: LocalDocument[]; setLocalDocuments: React.Dispatch<React.SetStateAction<LocalDocument[]>>;
  localImages: LocalImageItem[]; setLocalImages: React.Dispatch<React.SetStateAction<LocalImageItem[]>>;
  setName: (v: string) => void; setNameFocused: (v: boolean) => void;
  setSelectedCountry: (v: string) => void; setSelectedCountryId: (v: string) => void;
  setAddress: (v: string) => void; setSelectedShortDescription: (v: string) => void; setSelectedShortDescriptionId: (v: string) => void;
  setDescription: (v: string) => void; setEmail: (v: string) => void; setWebsite: (v: string) => void; setPhone: (v: string) => void;
  setSelectedBrand: (v: string) => void; setSelectedBrandId: (v: string) => void;
  setInn: (v: string) => void; setOgrn: (v: string) => void; setKpp: (v: string) => void;
  setContactPerson: (v: string) => void; setContactPosition: (v: string) => void; setContactPhone: (v: string) => void;
  setDirector: (v: string) => void; setDirectorPosition: (v: string) => void;
  setBankName: (v: string) => void; setBik: (v: string) => void; setCorrespondentAccount: (v: string) => void; setSettlementAccount: (v: string) => void;
  setImages: (v: ImageItem[]) => void; setDocuments: (v: DocumentItem[]) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; handleDeleteImage: (uid: string) => void;
  handleDocumentUpload: (documentName: string, file: File) => void; handleDeleteDocument: (uid: string) => void;
  openPopup: (type: string) => void;
  isDataSaved: boolean;
  validationErrors: Set<string>;
  setValidationErrors: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchAverageRating?: () => void;
  averageRating?: number;
}

const SupplierCreatePage = () => {
  const { uid, code: codeParam } = useParams<{ uid: string; code: string }>();
  const { tabs, activeTabId, closeTab } = useTabs();

  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(''); const [code, setCode] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false); const [isEdit, setIsEdit] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(''); const [selectedCountryId, setSelectedCountryId] = useState('');
  const [address, setAddress] = useState('');
  const [selectedShortDescription, setSelectedShortDescription] = useState(''); const [selectedShortDescriptionId, setSelectedShortDescriptionId] = useState('');
  const [description, setDescription] = useState(''); const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); const [phone, setPhone] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(''); const [selectedBrandId, setSelectedBrandId] = useState('');

  const [inn, setInn] = useState(''); const [ogrn, setOgrn] = useState(''); const [kpp, setKpp] = useState('');
  const [contactPerson, setContactPerson] = useState(''); const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [director, setDirector] = useState(''); const [directorPosition, setDirectorPosition] = useState('');
  const [bankName, setBankName] = useState(''); const [bik, setBik] = useState('');
  const [correspondentAccount, setCorrespondentAccount] = useState(''); const [settlementAccount, setSettlementAccount] = useState('');

  const [localDocuments, setLocalDocuments] = useState<LocalDocument[]>([]);
  const [localImages, setLocalImages] = useState<LocalImageItem[]>([]);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const tabs_list = ['Основное', 'Реквизиты', 'Документы', 'Поставки', 'Ассортимент', 'Рейтинг', 'Интеграции'];

  useEffect(() => {
    if (!uid) return;
    const cp = window.location.pathname;
    const isEditMode = cp.includes('/edit/');
    setIsEdit(isEditMode);
    if (isEditMode) {
      loadSupplierData(uid);
      fetchImages(); fetchDocuments(); fetchAverageRating();
    }
  }, [uid]);

  const fetchAverageRating = async () => { if (!uid) return; try { const res = await AxiosService.get(ConstantInfo.restApiSupplierRatingsAverage(uid)); setAverageRating(Math.round((res.data || 0) * 10) / 10); } catch (e) { console.error(e); } };
  const fetchImages = async () => { if (!uid) return; try { const res = await AxiosService.get(ConstantInfo.restApiSupplierImages(uid)); setImages((res.data || []).map((img: any) => ({ uid: img.uid, url: img.fileUrl ? ConstantInfo.fileDir + img.fileUrl.replace(/^\//, '') : '', originalName: img.originalName || '' }))); } catch (e) { console.error(e); } };
  const fetchDocuments = async () => { if (!uid) return; try { const res = await AxiosService.get(ConstantInfo.restApiSupplierDocuments(uid)); setDocuments((res.data || []).map((doc: any) => ({ ...doc, url: doc.fileUrl ? ConstantInfo.fileDir + doc.fileUrl.replace(/^\//, '') : '' }))); } catch (e) { console.error(e); } };

  const loadSupplierData = async (suid: string): Promise<void> => { 
    setIsLoading(true); 
    try { 
      const d = (await AxiosService.get(ConstantInfo.restApiSupplierGet(suid))).data; 
      setName(d.name || ''); setCode(d.code); 
      if (d.countryUid) { setSelectedCountryId(d.countryUid); setSelectedCountry(d.countryName || ''); }
      setAddress(d.address || ''); 
      if (d.shortDescriptionUid) { setSelectedShortDescriptionId(d.shortDescriptionUid); setSelectedShortDescription(d.shortDescriptionName || ''); }
      setDescription(d.description || ''); setEmail(d.email || ''); setWebsite(d.website || ''); setPhone(d.phone || ''); 
      if (d.brandUid) { setSelectedBrandId(d.brandUid); setSelectedBrand(d.brandName || ''); }
      setInn(d.inn || ''); setOgrn(d.ogrn || ''); setKpp(d.kpp || ''); 
      setContactPerson(d.contactPerson || ''); setContactPosition(d.contactPosition || ''); setContactPhone(d.contactPhone || ''); 
      setDirector(d.director || ''); setDirectorPosition(d.directorPosition || ''); 
      setBankName(d.bankName || ''); setBik(d.bik || ''); setCorrespondentAccount(d.correspondentAccount || ''); setSettlementAccount(d.settlementAccount || ''); 
    } catch (e) { console.error(e); } finally { setIsLoading(false); } 
  };

  const handleClose = () => { const t = tabs.find(tab => tab.id === activeTabId); if (t) closeTab(t.id); };

  const noop = () => {};
  const noopStr = (v: string) => {};

  const activeTabStyle: React.CSSProperties = { width: 151, height: 40, borderRadius: 10, backgroundColor: '#666EFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF' };
  const mutedTabStyle: React.CSSProperties = { width: 151, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: 'none', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#BCC8FF', opacity: 0.5, pointerEvents: 'none' };
  const bottomButtonStyle: React.CSSProperties = { height: 51, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const mutedBottomStyle: React.CSSProperties = { ...bottomButtonStyle, opacity: 0.4, cursor: 'default' };
  const mutedIconStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };

  const commonProps: CommonSupplierProps = {
    uid, name, isEdit, isSaving: false, images, documents, nameFocused, code, isLoading,
    selectedCountry, selectedCountryId, address, selectedShortDescription, selectedShortDescriptionId,
    description, email, website, phone, selectedBrand, selectedBrandId,
    inn, ogrn, kpp, contactPerson, contactPosition, contactPhone,
    director, directorPosition, bankName, bik, correspondentAccount, settlementAccount,
    fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>,
    documentInputRef: documentInputRef as React.RefObject<HTMLInputElement>,
    localDocuments, setLocalDocuments: noop as any,
    localImages, setLocalImages: noop as any,
    setName: noopStr, setNameFocused: noop,
    setSelectedCountry: noopStr, setSelectedCountryId: noopStr,
    setAddress: noopStr, setSelectedShortDescription: noopStr, setSelectedShortDescriptionId: noopStr,
    setDescription: noopStr, setEmail: noopStr, setWebsite: noopStr, setPhone: noopStr,
    setSelectedBrand: noopStr, setSelectedBrandId: noopStr,
    setInn: noopStr, setOgrn: noopStr, setKpp: noopStr,
    setContactPerson: noopStr, setContactPosition: noopStr, setContactPhone: noopStr,
    setDirector: noopStr, setDirectorPosition: noopStr,
    setBankName: noopStr, setBik: noopStr, setCorrespondentAccount: noopStr, setSettlementAccount: noopStr,
    setImages: noop as any, setDocuments: noop as any,
    handleImageUpload: noop as any, handleDeleteImage: noop as any,
    handleDocumentUpload: noop as any, handleDeleteDocument: noop as any,
    openPopup: noop as any,
    isDataSaved: true,
    validationErrors, setValidationErrors,
    fetchAverageRating, averageRating,
  };

  if (isLoading) return (<div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>);

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>{isEdit ? name || 'Поставщик' : 'Справочник: Поставщики'}</h1>
      <button onClick={handleClose} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} /></button>
      
      <div style={{ position: 'absolute', top: 99, left: 60, right: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 25, alignItems: 'center' }}>
          <button onClick={() => setActiveTab(0)} style={activeTab === 0 ? activeTabStyle : { ...activeTabStyle, backgroundColor: '#FFFFFF', color: '#2D4059' }}>
            <span>Основное</span>
          </button>
          <button onClick={() => setActiveTab(1)} style={activeTab === 1 ? activeTabStyle : { ...activeTabStyle, backgroundColor: '#FFFFFF', color: '#2D4059' }}>
            <span>Реквизиты</span>
          </button>
          {tabs_list.slice(2).map((tab) => (
            <button key={tab} style={mutedTabStyle}><span>{tab}</span></button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <button style={mutedIconStyle}><img src={IconOne} alt="" style={{ width: 20, height: 20 }} /></button>
          <button style={mutedIconStyle}><img src={IconTwo} alt="" style={{ width: 20, height: 20 }} /></button>
        </div>
      </div>

      {activeTab === 0 ? <SupplierMainTab {...commonProps} /> : <SupplierRequisitesTab {...commonProps} />}

      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', alignItems: 'center', gap: 30 }}>
        <button style={{ ...mutedBottomStyle, width: 234, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059' }}>Синхронизировать</button>
        <button style={{ ...mutedBottomStyle, width: 121, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#BCC8FF', border: 'none', backgroundColor: '#BCC8FF' }}>Записать</button>
        <button style={{ ...bottomButtonStyle, width: 116, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }} onClick={handleClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default SupplierCreatePage;