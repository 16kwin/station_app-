// OrderCreatePage.tsx — ПОЛНЫЙ ФАЙЛ (AWMS) с поддержкой base64 изображений и исправленной логикой отмены
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTabs } from '../../context/TabContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import FormField from '../../components/elements/FormField';
import CustomScrollbar from '../../components/CustomScrollbar';
import AxiosService from '../../services/AxiosService';
import ConstantInfo from '../../info/ConstantInfo';
import CatalogSelectPopup from '../ReferencesPage/NomenclaturePage/CatalogSelectPopup';
import type { PopupType } from '../ReferencesPage/NomenclaturePage/CatalogSelectPopup';
import Icon7 from '../../assets/References/NomenclatureCreatePage/Icon7.svg';
import Icon1 from '../../assets/References/Icon1.svg';
import Icon2 from '../../assets/References/Icon2.svg';
import Icon3 from '../../assets/References/Icon3.svg';
import Icon31 from '../../assets/References/NomenclatureCreatePage/button4.svg';
import Icon11 from '../../assets/References/NomenclatureCreatePage/Icon11.svg';
import Icon12 from '../../assets/References/NomenclatureCreatePage/Icon12.svg';
import Icon21 from '../../assets/References/NomenclatureCreatePage/Icon21.svg';
import Icon22 from '../../assets/References/NomenclatureCreatePage/Icon22.svg';
import IconN31 from '../../assets/References/ICONN31.svg';
import IconN41 from '../../assets/References/ICONN41.svg';
import IconN42 from '../../assets/References/ICONN42.svg';
import IconN51 from '../../assets/References/SupplierCreatePage/Sup111.svg';
import IconN52 from '../../assets/References/SupplierCreatePage/Sup112.svg';
import TkpIcon from '../../assets/References/Tkp.svg';
import IconBtn1 from '../../assets/References/OrderCreate/IconBtn1.svg';
import IconBtn2 from '../../assets/References/OrderCreate/IconBtn2.svg';
import IconBtn3 from '../../assets/References/OrderCreate/IconBtn3.svg';
import IconBtn4 from '../../assets/References/OrderCreate/IconBtn4.svg';
import IconBtn5 from '../../assets/References/OrderCreate/IconBtn5.svg';
import TrackDoneIcon from '../../assets/References/OrderCreate/TrackDoneIcon.svg';
import TrackCurrentIcon from '../../assets/References/OrderCreate/TrackCurrentIcon.svg';
import TrackFutureIcon from '../../assets/References/OrderCreate/TrackFutureIcon.svg';
import OtmenaIcon from '../../assets/References/OrderCreate/Otmena.svg';

// Полифилл для crypto.randomUUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface OrderProduct {
  localId: string;
  productUid: string;
  productName: string;
  article: string;
  quantity: number;
  unit: string;
  country: string;
}

interface OrderDetailProduct {
  product_uid: string;
  article: string;
  product: string;
  quantity: number;
  group?: string;
  type?: string;
  description?: string;
  manufacturer?: string;
  country?: string;
  brand?: string;
  model?: string;
  images?: string[];
  draws?: string[];
  barcode?: { code: string; codeimage?: string };
  sku?: { code: string; image?: string };
  specifications?: { characteristic: string; unit: string; value: string }[];
  analogues?: { uid: string; name: string; model: string }[];
}

const ORDER_TRACK_STAGES = [
  { key: 'not_sent', label: 'Заказ проведён' },
  { key: 'inprocessing', label: 'Заказ отправлен' },
  { key: 'inworkprovider', label: 'Принят в работу' },
  { key: 'posttkpprovider', label: 'ТКП направлен' },
  { key: 'tkp_accepted', label: 'ТКП подтверждён' },
  { key: 'inrealise', label: 'Заказ в пути' },
  { key: 'done', label: 'Заказ выдан' },
];

const DELIVERY_TRACK_STAGES = [
  { key: 'notinwork', label: 'Не в работе' },
  { key: 'inwork', label: 'Принят в работу' },
  { key: 'intransitoutside', label: 'Транзит за РФ' },
  { key: 'customs', label: 'Таможня' },
  { key: 'intransitinside', label: 'Транзит по РФ' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'sorting', label: 'Сортировка' },
  { key: 'sent', label: 'Отправлен' },
  { key: 'courier', label: 'Курьер' },
  { key: 'done', label: 'Вручен' },
];

const ROW_HEIGHT = 54;
const HEADER_HEIGHT = 54;
const TABLE_WIDTH = 1720;
const TABLE_HEIGHT = 324;
const VISIBLE_ROWS = 5;

const getImageSrc = (img: string): string => {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')) return img;
  return `data:image/png;base64,${img}`;
};

const OrderCreatePage = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab, openTab, updateTabLabel } = useTabs();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const formedByRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [formedBy, setFormedBy] = useState('Вручную');
  const [issuedBy, setIssuedBy] = useState('');
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [detailProducts, setDetailProducts] = useState<OrderDetailProduct[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isConducted, setIsConducted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [actualOrderUid, setActualOrderUid] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
  const [hasTkp, setHasTkp] = useState(false);
  const [tkpUid, setTkpUid] = useState<string | null>(null);
  const [showTrack, setShowTrack] = useState(false);
  const [activeTrackTab, setActiveTrackTab] = useState<'order' | 'delivery'>('order');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderStatusReason, setOrderStatusReason] = useState('');
  const [orderTrackStatus, setOrderTrackStatus] = useState('');
  const [tkpStatusInvoice, setTkpStatusInvoice] = useState('');
  const [showFormedByDropdown, setShowFormedByDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [previousStatusReason, setPreviousStatusReason] = useState('');

  const COL_NUMBER = 60;
  const COL_NAME = 156;
  const COL_ARTICLE = 786;
  const COL_QUANTITY = 1000;
  const COL_UNIT = 1248;
  const COL_COUNTRY = 1500;

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setOrderDate(`${dd}.${mm}.${yyyy}`);
  }, []);

  useEffect(() => {
    if (!uid) return;
    const cp = window.location.pathname;
    const isCreate = cp.includes('/create/');
    setIsEdit(!isCreate);
    if (!isCreate) loadOrderData(uid);
  }, [uid]);

  useEffect(() => {
    if (!showFormedByDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (formedByRef.current && !formedByRef.current.contains(e.target as Node)) {
        setShowFormedByDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showFormedByDropdown]);

  useEffect(() => {
    if (!actualOrderUid) return;

    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      
      const client = new Client({
        webSocketFactory: () => new SockJS('http://45.146.164.123:8084/ws-stations'),
        onConnect: () => {
          if (!active) {
            client.deactivate();
            return;
          }
          
          client.subscribe('/topic/tkp/status', () => {
            if (actualOrderUid) loadOrderData(actualOrderUid);
          });
          client.subscribe('/topic/orders/refresh', () => {
            if (actualOrderUid) loadOrderData(actualOrderUid);
          });
          client.subscribe('/topic/tkp/new', () => {
            if (actualOrderUid) loadOrderData(actualOrderUid);
          });
          client.subscribe('/topic/orders/cancelled', () => {
            if (actualOrderUid) loadOrderData(actualOrderUid);
          });
        },
        onDisconnect: () => {},
        onStompError: () => {}
      });

      client.activate();
      stompClientRef.current = client;
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [actualOrderUid]);

  const getCurrentOrderTrackStage = (status: string, statusreason: string, statustrack: string, tkpInv: string, isCancelled?: boolean, prevReason?: string) => {
    if (status === 'closed' && !isCancelled) return 'done';
    if (tkpInv === 'inrealise' || statustrack === 'inwork' || statustrack === 'intransitoutside' ||
        statustrack === 'customs' || statustrack === 'intransitinside' || statustrack === 'warehouse' ||
        statustrack === 'sorting' || statustrack === 'sent' || statustrack === 'courier' || statustrack === 'done') return 'inrealise';
    
    if (isCancelled && prevReason === 'posttkpprovider') return 'posttkpprovider';
    if (isCancelled && prevReason === 'accept') return 'tkp_accepted';
    
    if (tkpInv === 'accept') return 'tkp_accepted';
    if (statusreason === 'posttkpprovider') return 'posttkpprovider';
    if (statusreason === 'inworkprovider') return 'inworkprovider';
    if (status === 'active' && statusreason === 'inprocessing') return 'inprocessing';
    if (status === 'not_sent') return 'not_sent';
    return 'not_sent';
  };

  const loadOrderData = async (orderUid: string) => {
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiOrderGet(orderUid));
      const data = res.data;
      if (data && Object.keys(data).length > 0) {
        setOrderNumber(data.ordernumber || '');
        setOrderDate(data.orderdata || '');
        setFormedBy(data.formedby || 'Вручную');
        setIssuedBy(data.contactperson || '');
        setOrderStatus(data.status || '');
        setOrderStatusReason(data.statusreason || '');
        setOrderTrackStatus(data.statustrack || '');
        setPreviousStatusReason(data.previous_statusreason || '');

        if (data.products) {
          setDetailProducts(data.products);
          const loadedProducts: OrderProduct[] = await Promise.all(
            data.products.map(async (p: any) => {
              let unit = ''; let country = '';
              if (p.product_uid) {
                try {
                  const matRes = await AxiosService.get(ConstantInfo.restApiNomenclatureGetMaterial(p.product_uid));
                  unit = matRes.data.measureName || '';
                  country = matRes.data.countryName || '';
                } catch (e) {}
              }
              return { localId: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, productUid: p.product_uid || '', productName: p.product || '', article: p.article || '', quantity: p.quantity || 1, unit, country };
            })
          );
          setProducts(loadedProducts);
        }
        setActualOrderUid(orderUid);

        const status = data.status || '';
        const statusreason = data.statusreason || '';
        if (status === 'not_sent') { setIsConducted(true); setCanSend(true); setCanCancel(false); }
        else if (status === 'active' && (statusreason === 'inprocessing' || statusreason === 'inworkprovider')) { 
          setIsConducted(true); 
          setCanSend(false); 
          setCanCancel(true); 
        }
        else { setIsConducted(true); setCanSend(false); setCanCancel(false); }

        checkTkpExists(orderUid);
      }
    } catch (e) { console.error('Ошибка загрузки заказа:', e); }
    finally { setIsLoading(false); }
  };

  const checkTkpExists = async (orderUid: string) => {
    try {
      const [activeRes, closedRes] = await Promise.all([
        AxiosService.get(ConstantInfo.restApiTkpActive),
        AxiosService.get(ConstantInfo.restApiTkpClosed),
      ]);
      const allTkp = [...(activeRes.data || []), ...(closedRes.data || [])];
      const tkp = allTkp.find((t: any) => t.order_uid === orderUid);
      if (tkp) { setHasTkp(true); setTkpUid(tkp.tkp_uid); setTkpStatusInvoice(tkp.statusinvoice || ''); }
    } catch (e) {}
  };

  const handleClose = () => { const t = tabs.find(tab => tab.id === activeTabId); if (t) closeTab(t.id); };
  const handleOpenTkp = () => { if (tkpUid) navigate(`/tkp/${tkpUid}`); };
  const handleToggleTrack = () => { setShowTrack(prev => !prev); setActiveTrackTab('order'); };
  const handleAddNomenclature = () => { if (isConducted) return; setPopupOpen(true); };

  const fetchMaterialImages = async (materialUid: string): Promise<string[]> => {
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureImages(materialUid));
      const imgs = res.data || [];
      return imgs.map((img: any) => {
        if (img.url) return ConstantInfo.fileDir + img.url.replace(/^\//, '');
        return '';
      }).filter((s: string) => s !== '');
    } catch (e) { return []; }
  };

  const fetchMaterialDraws = async (materialUid: string): Promise<string[]> => {
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureBlueprints(materialUid));
      const draws = res.data || [];
      return draws.map((d: any) => {
        if (d.url) return ConstantInfo.fileDir + d.url.replace(/^\//, '');
        return '';
      }).filter((s: string) => s !== '');
    } catch (e) { return []; }
  };

  const fetchMaterialBarcode = async (materialUid: string): Promise<{ code: string; codeimage?: string } | undefined> => {
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureCodes(materialUid));
      const codes = res.data || [];
      const barcode = codes.find((c: any) => c.codeKind === 'BARCODE');
      if (barcode) {
        let codeimage = '';
        if (barcode.url) codeimage = ConstantInfo.fileDir + barcode.url.replace(/^\//, '');
        return { code: barcode.codeValue || '', codeimage: codeimage || undefined };
      }
    } catch (e) {}
    return undefined;
  };

  const fetchMaterialSku = async (materialUid: string): Promise<{ code: string; image?: string } | undefined> => {
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureCodes(materialUid));
      const codes = res.data || [];
      const sku = codes.find((c: any) => c.codeKind === 'SKU');
      if (sku) {
        let image = '';
        if (sku.url) image = ConstantInfo.fileDir + sku.url.replace(/^\//, '');
        return { code: sku.codeValue || '', image: image || undefined };
      }
    } catch (e) {}
    return undefined;
  };

  const handlePopupSelect = async (id: string, nm: string) => {
    const existing = products.find(p => p.productUid === id);
    if (existing) return;
    try {
      const res = await AxiosService.get(ConstantInfo.restApiNomenclatureGetMaterial(id));
      const material = res.data;
      
      const [images, draws, barcode, sku] = await Promise.all([
        fetchMaterialImages(id),
        fetchMaterialDraws(id),
        fetchMaterialBarcode(id),
        fetchMaterialSku(id),
      ]);
      
      setProducts(prev => [...prev, { localId: `prod_${Date.now()}`, productUid: id, productName: nm, article: material.article || '', quantity: 1, unit: material.measureName || '', country: material.countryName || '' }]);
      
      const detailProduct: OrderDetailProduct = {
        product_uid: id,
        article: material.article || '',
        product: nm,
        quantity: 1,
        group: material.typeMainName || '',
        type: material.typeProductName || '',
        description: material.description || '',
        manufacturer: material.manufacturerName || '',
        country: material.countryName || '',
        brand: material.brandName || '',
        model: material.modelOfBrandName || '',
        images,
        draws,
        barcode,
        sku,
        specifications: [],
        analogues: [],
      };
      setDetailProducts(prev => [...prev, detailProduct]);
    } catch (e) {
      setProducts(prev => [...prev, { localId: `prod_${Date.now()}`, productUid: id, productName: nm, article: '', quantity: 1, unit: '', country: '' }]);
      setDetailProducts(prev => [...prev, { product_uid: id, article: '', product: nm, quantity: 1 }]);
    }
  };

  const handlePopupClose = () => setPopupOpen(false);
  const updateQuantity = (localId: string, value: number) => { 
    if (isConducted) return; 
    const qty = Math.max(1, value);
    setProducts(prev => prev.map(p => p.localId === localId ? { ...p, quantity: qty } : p));
    setDetailProducts(prev => prev.map(p => {
      const prod = products.find(pp => pp.localId === localId);
      return prod && p.product_uid === prod.productUid ? { ...p, quantity: qty } : p;
    }));
  };
  
  const handleProductDoubleClick = (productUid: string) => openTab(`/references/nomenclature/edit/${productUid}/0`, `Номенклатура`, null);

  const handleConduct = async () => {
    if (!uid || products.length === 0 || !issuedBy.trim()) return;
    setIsSending(true);
    try {
      const generatedUid = generateUUID(); 
      const generatedNumber = `ORD-${Date.now()}`;
      await AxiosService.post(ConstantInfo.restApiOrderConduct(generatedUid), { orderUid: generatedUid, orderNumber: generatedNumber, orderDate, formedBy, issuedBy, products: products.map(p => ({ productUid: p.productUid, quantity: p.quantity })) });
      
      setActualOrderUid(generatedUid); 
      setOrderNumber(generatedNumber);
      setIsConducted(true); 
      setCanSend(true); 
      setCanCancel(false);
      setOrderStatus('not_sent'); 
      setOrderStatusReason('draft');
      setIsEdit(true);
      
      const newPath = `/orders/${generatedUid}`;
      const currentTab = tabs.find(tab => tab.id === activeTabId);
      if (currentTab) {
        updateTabLabel(currentTab.id, `Заказ ${generatedNumber}`);
        window.history.replaceState(null, '', newPath);
      }
      
    } catch (e) { console.error('Ошибка проведения заказа:', e); }
    finally { setIsSending(false); }
  };

  const handleSend = async () => {
    if (!actualOrderUid) return;
    setIsSending(true);
    try {
      await AxiosService.post(ConstantInfo.restApiOrderSend(actualOrderUid));
      await loadOrderData(actualOrderUid);
    } catch (e) { console.error('Ошибка отправки заказа:', e); }
    finally { setIsSending(false); }
  };

  const handleCancelOrder = async () => {
    if (!actualOrderUid) return;
    setIsCancelling(true);
    try { 
      await AxiosService.post(`${ConstantInfo.restApiOrderCreate(actualOrderUid)}/cancel`); 
      await loadOrderData(actualOrderUid);
    }
    catch (e) { console.error('Ошибка отмены заказа:', e); }
    finally { setIsCancelling(false); }
  };

  const handleFormedByClick = () => {
    if (isConducted) return;
    if (!showFormedByDropdown && formedByRef.current) {
      const rect = formedByRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setShowFormedByDropdown(prev => !prev);
  };

  const handleFormedBySelect = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    e.preventDefault();
    setFormedBy(value);
    setShowFormedByDropdown(false);
  };

  const formedByOptions = ['Вручную', 'Контроль уровней остатка (автоматический)'];

  const activeTabStyle: React.CSSProperties = { width: 151, height: 40, borderRadius: 10, backgroundColor: '#666EFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF' };
  const inactiveTabStyle: React.CSSProperties = { ...activeTabStyle, backgroundColor: '#FFFFFF', color: '#2D4059' };
  const mutedButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };

  const FIELD_WIDTH = 370; const FIELD_HEIGHT = 44;
  const emptyRows = Math.max(0, VISIBLE_ROWS - products.length);
  const totalRows = products.length + emptyRows;

  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059', minWidth: 160, flexShrink: 0 };
  const valueStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', wordBreak: 'break-word' };
  const sectionTitleStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#666EFE', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(102, 110, 254, 0.15)' };

  if (isLoading) {
    return <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>;
  }

  const isReadOnly = isConducted;
  
  const isCancelled = orderStatus === 'closed' && (orderStatusReason === 'cancelcustomer' || orderStatusReason === 'cancelprovider');
  
  const effectiveStatusReason = isCancelled && previousStatusReason 
    ? previousStatusReason
    : orderStatusReason;
  
  const currentOrderStage = getCurrentOrderTrackStage(
    isCancelled ? 'active' : orderStatus, 
    effectiveStatusReason, 
    orderTrackStatus, 
    tkpStatusInvoice,
    isCancelled,
    previousStatusReason
  );
  
  const isDeliveryAvailable = (effectiveStatusReason === 'posttkpprovider' || currentOrderStage === 'tkp_accepted' || currentOrderStage === 'inrealise' || currentOrderStage === 'done') && !isCancelled;
  
  const currentStageIndex = ORDER_TRACK_STAGES.findIndex(s => s.key === currentOrderStage);
  const effectiveIndex = currentOrderStage === 'posttkpprovider' ? currentStageIndex + 1 : currentStageIndex;
  const deliveryStageIndex = DELIVERY_TRACK_STAGES.findIndex(s => s.key === orderTrackStatus);
  const lastOrderIndex = ORDER_TRACK_STAGES.length - 1;
  const lastDeliveryIndex = DELIVERY_TRACK_STAGES.length - 1;
  
  const cancelledAtIndex = isCancelled 
    ? (previousStatusReason === 'posttkpprovider' 
        ? ORDER_TRACK_STAGES.findIndex(s => s.key === 'tkp_accepted')
        : effectiveIndex + 1)
    : -1;
  const cancelLabel = orderStatusReason === 'cancelcustomer' ? 'Заказ отменён заказчиком' : 'Заказ отменён поставщиком';

  const showCancelOrder = orderStatus !== 'closed' && 
    (orderStatusReason === 'inprocessing' || orderStatusReason === 'inworkprovider');

  const getOrderStageColor = (idx: number, currentIdx: number) => {
    if (isCancelled && idx === cancelledAtIndex) return '#FF3052';
    if (isCancelled && idx > cancelledAtIndex) return 'rgba(45, 64, 89, 0.35)';
    if (isCancelled && idx <= currentIdx) return '#666EFE';
    if (idx === lastOrderIndex && idx <= currentIdx) return '#07E098';
    if (idx < currentIdx) return '#666EFE';
    if (idx === currentIdx) return 'linear-gradient(to right, #666EFE, #07E098)';
    return 'rgba(45, 64, 89, 0.35)';
  };

  const getOrderLineBg = (idx: number, currentIdx: number) => {
    if (isCancelled && idx === cancelledAtIndex) return 'linear-gradient(to right, #666EFE, #FF3052)';
    if (isCancelled && idx > cancelledAtIndex) return 'rgba(45, 64, 89, 0.35)';
    if (isCancelled && idx <= currentIdx) return '#666EFE';
    if (idx === lastOrderIndex && idx <= currentIdx) return 'linear-gradient(to right, #666EFE, #07E098)';
    if (idx <= currentIdx) return '#666EFE';
    if (idx === currentIdx + 1) return 'linear-gradient(to right, #07E098, rgba(45, 64, 89, 0.35))';
    return 'rgba(45, 64, 89, 0.35)';
  };

  const getDeliveryStageColor = (idx: number, currentIdx: number) => {
    if (idx === lastDeliveryIndex && idx <= currentIdx) return '#07E098';
    if (idx < currentIdx) return '#666EFE';
    if (idx === currentIdx) return 'linear-gradient(to right, #666EFE, #07E098)';
    return 'rgba(45, 64, 89, 0.35)';
  };

  const getDeliveryLineBg = (idx: number, currentIdx: number) => {
    if (idx === lastDeliveryIndex && idx <= currentIdx) return 'linear-gradient(to right, #666EFE, #07E098)';
    if (idx <= currentIdx) return '#666EFE';
    if (idx === currentIdx + 1) return 'linear-gradient(to right, #07E098, rgba(45, 64, 89, 0.35))';
    return 'rgba(45, 64, 89, 0.35)';
  };

  const renderOrderTrack = () => {
    const circleSize = 40;
    const lineHeight = 6;
    const gap = 7;
    const rowHeight = circleSize;
    
    return (
      <div style={{ flex: 1, padding: '0 80px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: rowHeight }}>
          {ORDER_TRACK_STAGES.map((stage, idx) => {
            const isFirst = idx === 0;
            const isCancelledStage = isCancelled && idx === cancelledAtIndex;
            const isAfterCancelled = isCancelled && idx > cancelledAtIndex;
            const isDone = isCancelled ? (idx <= effectiveIndex) : (idx < effectiveIndex || (idx === lastOrderIndex && effectiveIndex >= lastOrderIndex));
            const isCurrent = !isCancelled && idx === effectiveIndex && idx !== lastOrderIndex;
            const isFuture = !isCancelled && idx > effectiveIndex;
            const color = getOrderStageColor(idx, effectiveIndex);
            
            let icon;
            if (isCancelledStage) {
              icon = OtmenaIcon;
            } else if (isAfterCancelled) {
              icon = TrackFutureIcon;
            } else if (isDone) {
              icon = TrackDoneIcon;
            } else if (isCurrent) {
              icon = TrackCurrentIcon;
            } else {
              icon = TrackFutureIcon;
            }
            
            const iconSize = isCancelledStage ? 22 : 20;
            const iconFilter = (isDone || isCurrent) ? 'brightness(0) invert(1)' : 'none';
            const iconOpacity = (isFuture || isAfterCancelled) ? 0.5 : 1;
            
            const labelText = isCancelledStage ? cancelLabel : stage.label;
            const labelColor = isCancelledStage ? '#FF3052' : (isAfterCancelled ? 'rgba(45, 64, 89, 0.35)' : ((isDone || isCurrent) ? '#2D4059' : 'rgba(45, 64, 89, 0.35)'));

            return (
              <React.Fragment key={stage.key}>
                {!isFirst && (
                  <div style={{
                    flex: 1, height: lineHeight, minWidth: 20,
                    background: getOrderLineBg(idx, effectiveIndex),
                    borderRadius: lineHeight / 2,
                    marginLeft: gap, marginRight: gap,
                  }} />
                )}
                <div style={{ position: 'relative', width: circleSize, height: circleSize, flexShrink: 0 }}>
                  <div style={{
                    width: circleSize, height: circleSize, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={icon} alt="" style={{ width: iconSize, height: iconSize, filter: iconFilter, opacity: iconOpacity }} />
                  </div>
                  <span style={{
                    position: 'absolute', top: circleSize + gap, left: '50%', transform: 'translateX(-50%)',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
                    color: labelColor,
                    textAlign: 'center', lineHeight: '16px',
                    whiteSpace: 'nowrap',
                  }}>
                    {labelText}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ height: 16 + gap + 4 }} />
      </div>
    );
  };

  const renderDeliveryTrack = () => {
    const circleSize = 20;
    const lineHeight = 3;
    const gap = 3.5;
    const rowHeight = circleSize;
    const iconSize = 10;
    
    return (
      <div style={{ flex: 1, padding: '0 30px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: rowHeight }}>
          {DELIVERY_TRACK_STAGES.map((stage, idx) => {
            const isFirst = idx === 0;
            const isDone = idx < deliveryStageIndex || (idx === lastDeliveryIndex && deliveryStageIndex >= lastDeliveryIndex);
            const isCurrent = idx === deliveryStageIndex && idx !== lastDeliveryIndex;
            const isFuture = idx > deliveryStageIndex;
            const color = getDeliveryStageColor(idx, deliveryStageIndex);
            const icon = isDone ? TrackDoneIcon : (isCurrent ? TrackCurrentIcon : TrackFutureIcon);
            const iconFilter = isDone || isCurrent ? 'brightness(0) invert(1)' : 'none';
            const iconOpacity = isFuture ? 0.5 : 1;
            
            return (
              <React.Fragment key={stage.key}>
                {!isFirst && (
                  <div style={{
                    flex: 1, height: lineHeight, minWidth: 8,
                    background: getDeliveryLineBg(idx, deliveryStageIndex),
                    borderRadius: lineHeight / 2,
                    marginLeft: gap, marginRight: gap,
                  }} />
                )}
                <div style={{ position: 'relative', width: circleSize, height: circleSize, flexShrink: 0 }}>
                  <div style={{
                    width: circleSize, height: circleSize, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={icon} alt="" style={{ width: iconSize, height: iconSize, filter: iconFilter, opacity: iconOpacity }} />
                  </div>
                  <span style={{
                    position: 'absolute', top: circleSize + gap, left: '50%', transform: 'translateX(-50%)',
                    fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 500,
                    color: idx <= deliveryStageIndex ? '#2D4059' : 'rgba(45, 64, 89, 0.35)',
                    textAlign: 'center', lineHeight: '10px',
                    whiteSpace: 'nowrap',
                  }}>
                    {stage.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ height: 10 + gap + 2 }} />
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>Документ: Заказ на поставку {orderNumber ? `(${orderNumber})` : '(Новый)'}</h1>

      {hasTkp && (
        <button onClick={handleOpenTkp} style={{ position: 'absolute', top: 32, right: 132, width: 104, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <img src={TkpIcon} alt="ТКП" style={{ width: 17, height: 22, marginLeft: 15 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059', marginLeft: 15 }}>ТКП</span>
        </button>
      )}
      <button onClick={handleClose} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}><img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} /></button>

      <div style={{ position: 'absolute', top: 100, left: 60, display: 'flex', gap: 25, alignItems: 'center' }}>
        <button onClick={() => setActiveTab(0)} style={activeTab === 0 ? activeTabStyle : inactiveTabStyle}><span>Основное</span></button>
        <button onClick={() => setActiveTab(1)} style={activeTab === 1 ? activeTabStyle : inactiveTabStyle}><span>Детализация</span></button>
      </div>

      {activeTab === 0 ? (
        <>
          <div style={{ position: 'absolute', top: 165, left: 40, width: TABLE_WIDTH, height: 137, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', width: '200%', height: '100%', transform: showTrack ? 'translateX(-50%)' : 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <div style={{ width: '50%', height: '100%', position: 'relative', flexShrink: 0 }}>
                <button onClick={handleToggleTrack} style={{ position: 'absolute', top: 12, right: 16, height: 32, paddingLeft: 16, paddingRight: 16, borderRadius: 8, backgroundColor: '#666EFE', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#FFFFFF', zIndex: 1 }}>Трек</button>
                <div style={{ position: 'absolute', top: 35, left: 30, display: 'flex', gap: 60 }}>
                  <div style={{ pointerEvents: 'none' }}>
                    <FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Номер:" icon={Icon11} iconActive={Icon12} value={orderNumber} placeholder="Номер заказа" type="input" onChange={() => {}} selectIconWidth={20} selectIconHeight={14} />
                  </div>
                  <div style={{ pointerEvents: 'none' }}>
                    <FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Дата:" icon={IconN31} iconActive={IconN31} value={orderDate} placeholder="Дата" type="input" onChange={() => {}} selectIconWidth={18} selectIconHeight={18} />
                  </div>
                  <div ref={formedByRef} style={{ position: 'relative', pointerEvents: isReadOnly ? 'none' : 'auto' }}>
                    <FormField 
                      width={FIELD_WIDTH} height={FIELD_HEIGHT} 
                      label="Сформировано:" 
                      icon={IconN41} iconActive={IconN42} 
                      value={formedBy} 
                      placeholder="Выберите" 
                      type="select" 
                      onClick={handleFormedByClick} 
                      selectIconWidth={18} selectIconHeight={18} 
                    />
                  </div>
                  <div style={{ pointerEvents: isReadOnly ? 'none' : 'auto' }}>
                    <FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Выписал:" icon={IconN51} iconActive={IconN52} value={issuedBy} placeholder="ФИО" type="input" onChange={isReadOnly ? () => {} : (e) => setIssuedBy(e.target.value)} onClear={!isReadOnly ? () => setIssuedBy('') : undefined} selectIconWidth={20} selectIconHeight={20} />
                  </div>
                </div>
              </div>

              <div style={{ width: '50%', height: '100%', position: 'relative', flexShrink: 0 }}>
                <button onClick={handleToggleTrack} style={{ position: 'absolute', top: 8, left: 14, height: 30, paddingLeft: 14, paddingRight: 14, borderRadius: 8, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#666EFE', zIndex: 2 }}>← Вернуться к данным</button>
                {isDeliveryAvailable && (
                  <button onClick={() => setActiveTrackTab(prev => prev === 'order' ? 'delivery' : 'order')} style={{ position: 'absolute', top: 8, right: 14, height: 30, paddingLeft: 14, paddingRight: 14, borderRadius: 8, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#666EFE', zIndex: 2 }}>
                    {activeTrackTab === 'order' ? 'Трек поставки →' : '← Трек заказа'}
                  </button>
                )}

                <div style={{ display: 'flex', width: '200%', height: '100%', paddingTop: 20, transform: activeTrackTab === 'delivery' ? 'translateX(-50%)' : 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div style={{ width: '50%', height: '100%', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {renderOrderTrack()}
                  </div>
                  <div style={{ width: '50%', height: '100%', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {renderDeliveryTrack()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 327, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 15 }}>
              <button style={mutedButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
              <button style={mutedButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
              <button style={mutedButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
              <button onClick={handleAddNomenclature} disabled={isReadOnly} style={{ width: 240, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: isReadOnly ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, gap: 10, opacity: isReadOnly ? 0.4 : 1 }}><img src={Icon31} alt="" style={{ width: 14.5, height: 18 }} /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>Добавить номенклатуру</span></button>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
              <button style={mutedButtonStyle}><img src={IconBtn1} alt="" style={{ width: 18, height: 18 }} /></button>
              <button style={mutedButtonStyle}><img src={IconBtn2} alt="" style={{ width: 18, height: 18 }} /></button>
              <button style={mutedButtonStyle}><img src={IconBtn3} alt="" style={{ width: 14, height: 18 }} /></button>
              <button style={mutedButtonStyle}><img src={IconBtn4} alt="" style={{ width: 18, height: 16 }} /></button>
              <button style={mutedButtonStyle}><img src={IconBtn5} alt="" style={{ width: 18, height: 18 }} /></button>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 377, left: 40 }}>
            <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingRight: 40, boxSizing: 'border-box' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NUMBER }}>НОМЕР</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME }}>НОМЕНКЛАТУРА</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_ARTICLE }}>АРТИКУЛ</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_QUANTITY }}>КОЛИЧЕСТВО</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_UNIT }}>ЕД.ИЗМ</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_COUNTRY }}>СТРАНА</span>
              </div>
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div style={{ minWidth: TABLE_WIDTH - 40 }}>
                  {products.map((product, index) => (
                    <div key={product.localId} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', position: 'relative', borderBottom: index === totalRows - 1 ? 'none' : '0.5px solid #E5ECF5' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF' }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_NUMBER, zIndex: 1 }}>{index + 1}</span>
                      <span onDoubleClick={() => handleProductDoubleClick(product.productUid)} style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#666EFE', position: 'absolute', left: COL_NAME, maxWidth: COL_ARTICLE - COL_NAME - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline', zIndex: 1 }}>{product.productName}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_ARTICLE, maxWidth: COL_QUANTITY - COL_ARTICLE - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 1 }}>{product.article || '—'}</span>
                      <input type="number" value={product.quantity} onChange={e => updateQuantity(product.localId, parseInt(e.target.value) || 1)} min="1" disabled={isReadOnly} style={{ position: 'absolute', left: COL_QUANTITY, width: 80, height: 36, borderRadius: 8, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: isReadOnly ? '#F5F6FA' : '#FFFFFF', zIndex: 1 }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_UNIT, maxWidth: COL_COUNTRY - COL_UNIT - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 1 }}>{product.unit || '—'}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_COUNTRY, zIndex: 1 }}>{product.country || '—'}</span>
                    </div>
                  ))}
                  {Array.from({ length: emptyRows }).map((_, i) => {
                    const rowIndex = products.length + i;
                    const isLast = rowIndex === totalRows - 1;
                    return <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' }} />;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 30, left: 40, width: 217, height: 60, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>Всего номенклатур:</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>{products.length}</span>
          </div>
        </>
      ) : (
        <div style={{ position: 'absolute', top: 165, left: 40, width: TABLE_WIDTH, bottom: 111 }}>
          <div ref={detailScrollRef} style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', padding: 30, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {detailProducts.length === 0 ? <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9CA3AF' }}>Нет данных</span> : detailProducts.map((product, idx) => (
              <div key={product.product_uid || idx} style={{ marginBottom: idx < detailProducts.length - 1 ? 40 : 0 }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: '#666EFE', marginBottom: 16 }}>Позиция {idx + 1}: {product.product || '—'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>UID:</span><span style={valueStyle}>{product.product_uid || '—'}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Артикул:</span><span style={valueStyle}>{product.article || '—'}</span></div>
                  <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Количество:</span><span style={valueStyle}>{product.quantity}</span></div>
                  {product.group && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Группа:</span><span style={valueStyle}>{product.group}</span></div>}
                  {product.type && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Вид:</span><span style={valueStyle}>{product.type}</span></div>}
                  {product.manufacturer && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Производитель:</span><span style={valueStyle}>{product.manufacturer}</span></div>}
                  {product.country && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Страна:</span><span style={valueStyle}>{product.country}</span></div>}
                  {product.brand && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Бренд:</span><span style={valueStyle}>{product.brand}</span></div>}
                  {product.model && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Модель:</span><span style={valueStyle}>{product.model}</span></div>}
                  {product.description && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Описание:</span><span style={{ ...valueStyle, maxWidth: 1200 }}>{product.description}</span></div>}
                </div>
                {product.specifications && product.specifications.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Характеристики</div><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{product.specifications.map((spec, i) => <div key={i} style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>{spec.characteristic}:</span><span style={valueStyle}>{spec.value} {spec.unit}</span></div>)}</div></div>}
                {product.barcode && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Штрихкод</div><div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Код:</span><span style={valueStyle}>{product.barcode.code || '—'}</span></div>{product.barcode.codeimage && <img src={getImageSrc(product.barcode.codeimage)} alt="Штрихкод" style={{ maxWidth: 300, marginTop: 8, borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />}</div>}
                {product.sku && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>SKU</div><div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Код:</span><span style={valueStyle}>{product.sku.code || '—'}</span></div>{product.sku.image && <img src={getImageSrc(product.sku.image)} alt="SKU" style={{ maxWidth: 150, marginTop: 8, borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />}</div>}
                {product.images && product.images.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Изображения</div><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{product.images.map((img, i) => <img key={i} src={getImageSrc(img)} alt="" style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />)}</div></div>}
                {product.draws && product.draws.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Чертежи</div><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{product.draws.map((draw, i) => <img key={i} src={getImageSrc(draw)} alt="" style={{ width: 200, height: 150, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />)}</div></div>}
                {product.analogues && product.analogues.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Аналоги</div>{product.analogues.map((analog, i) => <div key={i} style={{ display: 'flex', gap: 20, padding: '6px 0' }}><span style={valueStyle}>{analog.name}</span><span style={{ ...valueStyle, color: '#6B7280' }}>{analog.model}</span><span style={{ ...valueStyle, color: '#9CA3AF', fontSize: 12 }}>UID: {analog.uid}</span></div>)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEdit && !isConducted && <CatalogSelectPopup isOpen={popupOpen} onClose={handlePopupClose} onSelect={handlePopupSelect} popupType="analogSelect" filterParam={undefined} />}

      {showFormedByDropdown && (
        <div style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid rgba(102, 110, 254, 0.15)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {formedByOptions.map((option, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => handleFormedBySelect(e, option)}
              style={{
                padding: '10px 14px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: formedBy === option ? '#666EFE' : '#2D4059',
                backgroundColor: formedBy === option ? 'rgba(102, 110, 254, 0.08)' : '#FFFFFF',
                cursor: 'pointer',
                lineHeight: '20px',
                borderBottom: idx < formedByOptions.length - 1 ? '1px solid rgba(102, 110, 254, 0.08)' : 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(102, 110, 254, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formedBy === option ? 'rgba(102, 110, 254, 0.08)' : '#FFFFFF'}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', alignItems: 'center', gap: 30 }}>
        {!isEdit && !isConducted ? (
          <button onClick={handleConduct} disabled={isSending || products.length === 0 || !issuedBy.trim()} style={{ width: 154, height: 50, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', backgroundColor: products.length > 0 && issuedBy.trim() && !isSending ? '#666EFE' : '#BCC8FF', border: 'none', opacity: isSending ? 0.6 : 1, cursor: products.length > 0 && issuedBy.trim() && !isSending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSending ? 'Проведение...' : 'Провести'}
          </button>
        ) : canSend ? (
          <button onClick={handleSend} disabled={isSending} style={{ width: 154, height: 50, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', backgroundColor: !isSending ? '#666EFE' : '#BCC8FF', border: 'none', opacity: isSending ? 0.6 : 1, cursor: !isSending ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSending ? 'Отправка...' : 'Отправить'}
          </button>
        ) : showCancelOrder ? (
          <button onClick={handleCancelOrder} disabled={isCancelling} style={{ width: 154, height: 50, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', backgroundColor: !isCancelling ? '#FF3052' : '#BCC8FF', border: 'none', opacity: isCancelling ? 0.6 : 1, cursor: !isCancelling ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isCancelling ? 'Отмена...' : 'Отменить заказ'}
          </button>
        ) : null}
        <button onClick={handleClose} style={{ width: 116, height: 50, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059' }}>Закрыть</button>
      </div>
    </div>
  );
};

export default OrderCreatePage;