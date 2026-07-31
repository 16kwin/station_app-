// StationCreatePage.tsx — ПОЛНЫЙ ФАЙЛ (холдинг подтягивается автоматом при выборе предприятия)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTabs } from '../../../context/TabContext';
import { motion, AnimatePresence } from 'framer-motion';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import CatalogSelectPopup from '../NomenclaturePage/CatalogSelectPopup';
import type { PopupType } from '../NomenclaturePage/CatalogSelectPopup';
import StationMainTab from './StationMainTab';
import StationConfigurationTab from './StationConfigurationTab';
import StationFilesTab from './StationFilesTab';
import Icon7 from '../../../assets/References/NomenclatureCreatePage/Icon7.svg';
import IconArrow from '../../../assets/References/NomenclatureCreatePage/IconArrow.svg';
import IconArrow2 from '../../../assets/References/NomenclatureCreatePage/IconArrow2.svg';

const StationCreatePage = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab } = useTabs();

  const [activeTab, setActiveTab] = useState(0);
  const [tabsCollapsed, setTabsCollapsed] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [status, setStatus] = useState('WORKING');
  const [ipAddress, setIpAddress] = useState('');
  const [networkPort, setNetworkPort] = useState<number | ''>('');
  const [parentUid, setParentUid] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isTmc, setIsTmc] = useState(false);
  const [isSgd, setIsSgd] = useState(false);
  const [isOk, setIsOk] = useState(false);
  const [isAdditionalModule, setIsAdditionalModule] = useState(false);
  const [hasAdditionalModule, setHasAdditionalModule] = useState(false);
  const [modelId, setModelId] = useState('');
  const [modelName, setModelName] = useState('');
  const [article, setArticle] = useState('');
  const [typeName, setTypeName] = useState('');
  const [revision, setRevision] = useState('');
  const [modelImageUrl, setModelImageUrl] = useState('');
  const [configurationUid, setConfigurationUid] = useState('');
  const [configurationName, setConfigurationName] = useState('');
  const [holdingId, setHoldingId] = useState<number | null>(null);
  const [holdingName, setHoldingName] = useState('');
  const [enterpriseId, setEnterpriseId] = useState<number | null>(null);
  const [enterpriseName, setEnterpriseName] = useState('');
  const [workshopId, setWorkshopId] = useState<number | null>(null);
  const [workshopName, setWorkshopName] = useState('');
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [sectionName, setSectionName] = useState('');

  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);

  const getPopupOpenKey = () => `station_create_popup_open_${uid}`;
  const [popupOpen, setPopupOpen] = useState(() => sessionStorage.getItem(getPopupOpenKey()) === 'true');
  const [popupType, setPopupType] = useState<PopupType>('stationModel');
  const [popupFilterParam, setPopupFilterParam] = useState<string | undefined>(undefined);

  const tabs_list = ['Основное', 'Конфигурация', 'Файлы'];

  useEffect(() => {
    if (!uid) return;
    const cp = window.location.pathname;
    setIsEdit(cp.includes('/edit/'));
    if (cp.includes('/edit/')) loadStationData(uid);
  }, [uid]);

  const loadStationData = async (stationUid: string) => {
    setIsLoading(true);
    try {
      const d = (await AxiosService.get(ConstantInfo.restApiStationCrud(stationUid))).data;
      setName(d.name || ''); setCode(d.code || 0); setDescription(d.description || '');
      setSerialNumber(d.serialNumber || ''); setProductionDate(d.productionDate || '');
      setStatus(d.status || 'WORKING'); setIpAddress(d.ipAddress || ''); setNetworkPort(d.networkPort || '');
      setParentUid(d.parentUid || '');
      setHasError(d.hasError || false); setIsTmc(d.isTmc || false); setIsSgd(d.isSgd || false);
      setIsOk(d.isOk || false); setIsAdditionalModule(d.isAdditionalModule || false);
      setHasAdditionalModule(d.hasAdditionalModule || false);
      if (d.modelId) {
        setModelId(d.modelId); setModelName(d.modelName || '');
        setArticle(d.article || ''); setTypeName(d.stationType || ''); setRevision(d.revision || '');
        if (d.stationType) setTypeName(d.stationType);
        await loadModelInfo(d.modelId);
      }
      if (d.configurationUid) { setConfigurationUid(d.configurationUid); setConfigurationName(d.configurationName || ''); }
      if (d.holdingId) { setHoldingId(d.holdingId); setHoldingName(d.holdingName || ''); }
      if (d.enterpriseId) { setEnterpriseId(d.enterpriseId); setEnterpriseName(d.enterpriseName || ''); }
      if (d.workshopId) { setWorkshopId(d.workshopId); setWorkshopName(d.workshopName || ''); }
      if (d.sectionId) { setSectionId(d.sectionId); setSectionName(d.sectionName || ''); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const loadModelInfo = async (modelUid: string) => {
    try {
      const d = (await AxiosService.get(ConstantInfo.restApiStationModel(modelUid))).data;
      setArticle(d.article || '');
      setRevision(d.revision || '');
      if (d.typeName) setTypeName(d.typeName);
      const imgRes = await AxiosService.get(ConstantInfo.restApiStationModelImages(modelUid));
      if (imgRes.data && imgRes.data.length > 0) {
        setModelImageUrl(imgRes.data[0].url ? ConstantInfo.fileDir + imgRes.data[0].url.replace(/^\//, '') : '');
      } else {
        setModelImageUrl('');
      }
      setConfigurationUid('');
      setConfigurationName('');
    } catch (e) { console.error(e); }
  };

  const fetchEnterpriseHolding = async (entId: number) => {
    try {
      const res = await AxiosService.get(`${ConstantInfo.restApiEnterprises}/${entId}`);
      const ent = res.data;
      if (ent.holdingId) {
        setHoldingId(ent.holdingId);
        setHoldingName(ent.holdingName || '');
      } else {
        setHoldingId(null);
        setHoldingName('');
      }
    } catch (e) {
      console.error('Ошибка загрузки холдинга предприятия:', e);
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    setIsSaving(true);
    try {
      const body: any = {
        uid, name: name.trim(), description: description.trim(),
        serialNumber: serialNumber.trim(), productionDate: productionDate || null,
        status, ipAddress: ipAddress.trim(), networkPort: networkPort || null,
        parentUid: parentUid || null,
        hasError, isTmc, isSgd, isOk, isAdditionalModule, hasAdditionalModule,
        modelId: modelId || null, configurationUid: configurationUid || null,
        holdingId: holdingId || null,
        enterpriseId: enterpriseId || null, workshopId: workshopId || null, sectionId: sectionId || null,
      };
      if (isEdit) {
        await AxiosService.patch(`${ConstantInfo.restApiStationsCrud}/${uid}`, body);
      } else {
        await AxiosService.post(ConstantInfo.restApiStationsCrud, body);
      }
      if (uid) sessionStorage.removeItem(getPopupOpenKey());
      if (!isEdit) { setIsEdit(true); navigate(`/references/stations/edit/${uid}`, { replace: true }); }
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleClose = () => { const t = tabs.find(tab => tab.id === activeTabId); if (t) closeTab(t.id); if (uid) sessionStorage.removeItem(getPopupOpenKey()); };
  const handleCloseWithoutSaving = () => { if (uid) sessionStorage.removeItem(getPopupOpenKey()); handleClose(); };
  const handleSaveAndClose = async () => { await handleSave(); handleClose(); };
  const handleToggleCollapse = () => { if (!tabsCollapsed) setActiveTab(0); setTabsCollapsed(prev => !prev); };

  const openPopup = (type: PopupType, filter?: string) => {
    setPopupType(type); setPopupFilterParam(filter || undefined);
    setPopupOpen(true); if (uid) sessionStorage.setItem(getPopupOpenKey(), 'true');
  };

  const handlePopupSelect = (id: string, nm: string) => {
    switch (popupType) {
      case 'stationModel':
        setModelId(id); setModelName(nm);
        loadModelInfo(id);
        break;
      case 'stationConfiguration': setConfigurationUid(id); setConfigurationName(nm); break;
      case 'enterprise':
        const entId = Number(id);
        setEnterpriseId(entId); setEnterpriseName(nm);
        setWorkshopId(null); setWorkshopName(''); setSectionId(null); setSectionName('');
        fetchEnterpriseHolding(entId);
        break;
      case 'workshop': setWorkshopId(Number(id)); setWorkshopName(nm); setSectionId(null); setSectionName(''); break;
      case 'section': setSectionId(Number(id)); setSectionName(nm); break;
    }
  };

  const handlePopupClose = () => { setPopupOpen(false); if (uid) sessionStorage.removeItem(getPopupOpenKey()); };

  const canSave = name.trim().length > 0;

  const mainButtonStyle = (isActive: boolean): React.CSSProperties => ({
    width: 151, height: 40, borderRadius: 10,
    backgroundColor: isActive ? '#666EFE' : '#FFFFFF',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0,
    fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400,
    color: isActive ? '#FFFFFF' : '#2D4059',
    transition: 'all 0.3s ease', position: 'relative', paddingLeft: 21,
  });
  const bottomButtonStyle: React.CSSProperties = { height: 51, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };

  if (isLoading) return (<div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>);

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>
        {isEdit ? 'Справочник: Станции (Редактирование)' : 'Справочник: Станции (Создание)'}
      </h1>
      <button onClick={() => setShowClosePopup(true)} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
        <img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} />
      </button>

      <div style={{ position: 'absolute', top: 99, left: 60, right: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 25, alignItems: 'center' }}>
          <button onClick={() => setActiveTab(0)} style={mainButtonStyle(activeTab === 0)}>
            <span>Основное</span>
            <button onClick={(e) => { e.stopPropagation(); handleToggleCollapse(); }} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', width: 6, height: 10, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
              <motion.img src={activeTab === 0 ? IconArrow : IconArrow2} alt="" style={{ width: 6, height: 10 }} animate={{ rotate: tabsCollapsed ? 0 : 180 }} transition={{ duration: 0.3 }} />
            </button>
          </button>
          <AnimatePresence>
            {!tabsCollapsed && tabs_list.slice(1).map((tab, i) => (
              <motion.button key={tab} onClick={() => setActiveTab(i + 1)} style={mainButtonStyle(activeTab === i + 1)} initial={{ width: 0, opacity: 0, marginRight: -25 }} animate={{ width: 151, opacity: 1, marginRight: 0 }} exit={{ width: 0, opacity: 0, marginRight: -25 }} transition={{ duration: 0.3 }}>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{tab}</motion.span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {activeTab === 0 && (
        <StationMainTab
          uid={uid} code={code} name={name}
          modelId={modelId} modelName={modelName}
          article={article} typeName={typeName} revision={revision}
          modelImageUrl={modelImageUrl}
          serialNumber={serialNumber} productionDate={productionDate}
          holdingId={holdingId} holdingName={holdingName}
          enterpriseId={enterpriseId} enterpriseName={enterpriseName}
          workshopId={workshopId} workshopName={workshopName}
          sectionId={sectionId} sectionName={sectionName}
          setHoldingId={setHoldingId} setHoldingName={setHoldingName}
          setEnterpriseId={setEnterpriseId} setEnterpriseName={setEnterpriseName}
          setWorkshopId={setWorkshopId} setWorkshopName={setWorkshopName}
          setSectionId={setSectionId} setSectionName={setSectionName}
          hasError={hasError} setHasError={setHasError}
          isTmc={isTmc} setIsTmc={setIsTmc}
          isSgd={isSgd} setIsSgd={setIsSgd}
          isOk={isOk} setIsOk={setIsOk}
          isAdditionalModule={isAdditionalModule} setIsAdditionalModule={setIsAdditionalModule}
          hasAdditionalModule={hasAdditionalModule} setHasAdditionalModule={setHasAdditionalModule}
          status={status} setStatus={setStatus}
          description={description} setDescription={setDescription}
          ipAddress={ipAddress} setIpAddress={setIpAddress}
          networkPort={networkPort} setNetworkPort={setNetworkPort}
          parentUid={parentUid} setParentUid={setParentUid}
          setName={setName} setSerialNumber={setSerialNumber}
          setProductionDate={setProductionDate}
          openPopup={openPopup} isEdit={isEdit}
        />
      )}
      {activeTab === 1 && (
        <StationConfigurationTab
          configurationUid={configurationUid}
          configurationName={configurationName}
          modelId={modelId}
          ipAddress={ipAddress}
          networkPort={networkPort}
          setConfigurationUid={setConfigurationUid}
          setConfigurationName={setConfigurationName}
          setIpAddress={setIpAddress}
          setNetworkPort={setNetworkPort}
          openPopup={openPopup}
        />
      )}
      {activeTab === 2 && (
        <StationFilesTab
          stationUid={uid || ''}
          isEdit={isEdit}
        />
      )}

      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', alignItems: 'center', gap: 30 }}>
        <button style={{ ...bottomButtonStyle, width: 234, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059' }}>Синхронизировать</button>
        <button onClick={canSave ? handleSave : undefined} disabled={!canSave || isSaving} style={{ ...bottomButtonStyle, width: 121, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF', backgroundColor: canSave && !isSaving ? '#666EFE' : '#BCC8FF', border: 'none', opacity: isSaving ? 0.6 : 1, cursor: canSave && !isSaving ? 'pointer' : 'not-allowed' }}>{isSaving ? 'Сохранение...' : 'Записать'}</button>
        <button onClick={() => setShowClosePopup(true)} style={{ ...bottomButtonStyle, width: 116, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть</button>
      </div>

      <CatalogSelectPopup isOpen={popupOpen} onClose={handlePopupClose} onSelect={handlePopupSelect} popupType={popupType} filterParam={popupFilterParam} />

      {showClosePopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowClosePopup(false)}>
          <div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Закрыть вкладку</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>{canSave ? 'Сохранить изменения перед закрытием?' : 'Не все обязательные поля заполнены.'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {canSave && <button onClick={handleSaveAndClose} style={{ height: 44, borderRadius: 10, border: 'none', backgroundColor: '#666EFE', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Сохранить и закрыть</button>}
              <button onClick={handleCloseWithoutSaving} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Закрыть без сохранения</button>
              <button onClick={() => setShowClosePopup(false)} style={{ height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationCreatePage;