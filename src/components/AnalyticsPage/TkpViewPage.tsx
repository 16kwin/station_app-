// TkpViewPage.tsx — ПОЛНЫЙ ФАЙЛ (AWMS) с WebSocket (исправлен localhost)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTabs } from '../../context/TabContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import FormField from '../../components/elements/FormField';
import CustomScrollbar from '../../components/CustomScrollbar';
import AxiosService from '../../services/AxiosService';
import ConstantInfo from '../../info/ConstantInfo';
import Icon7 from '../../assets/References/NomenclatureCreatePage/Icon7.svg';
import Icon1 from '../../assets/References/Icon1.svg';
import Icon2 from '../../assets/References/Icon2.svg';
import Icon3 from '../../assets/References/Icon3.svg';
import Icon11 from '../../assets/References/NomenclatureCreatePage/Icon11.svg';
import Icon12 from '../../assets/References/NomenclatureCreatePage/Icon12.svg';
import Icon21 from '../../assets/References/NomenclatureCreatePage/Icon21.svg';
import Icon22 from '../../assets/References/NomenclatureCreatePage/Icon22.svg';
import IconN31 from '../../assets/References/ICONN31.svg';
import IconN41 from '../../assets/References/TkpCreate/Icon3.svg';
import IconN42 from '../../assets/References/TkpCreate/Icon2.svg';
import IconN51 from '../../assets/References/SupplierCreatePage/Sup111.svg';
import IconN52 from '../../assets/References/SupplierCreatePage/Sup112.svg';
import TkpIcon from '../../assets/References/TkpCreate/Icon1.svg';
import IconBtn1 from '../../assets/References/OrderCreate/IconBtn1.svg';
import IconBtn2 from '../../assets/References/OrderCreate/IconBtn2.svg';
import IconBtn3 from '../../assets/References/OrderCreate/IconBtn3.svg';
import IconBtn4 from '../../assets/References/OrderCreate/IconBtn4.svg';
import IconBtn5 from '../../assets/References/OrderCreate/IconBtn5.svg';

interface TkpProduct {
  product_uid: string;
  zadel_product_uid?: string;
  product: string;
  article: string;
  quantity: number;
  price: number;
  cost: number;
  group?: string;
  type?: string;
  description?: string;
  manufacturer?: string;
  country?: string;
  brand?: string;
  model?: string;
  images?: string[];
  draws?: string[];
  barcode?: { code: string; codeimage: string };
  sku?: { code: string; image: string };
  specifications?: { characteristic: string; unit: string; value: string }[];
  analogues?: { uid: string; name: string; model: string }[];
}

interface BuyerProductInfo {
  product: string;
  article: string;
}

const ROW_HEIGHT = 54;
const HEADER_HEIGHT = 54;
const TABLE_WIDTH = 1720;
const TABLE_HEIGHT = 324;
const VISIBLE_ROWS = 5;

const TkpViewPage = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab, openTab } = useTabs();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [tkpData, setTkpData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [buyerInfoCache, setBuyerInfoCache] = useState<Record<string, BuyerProductInfo>>({});
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  const COL_NUMBER = 50;
  const COL_NAME_ZADEL = 140;
  const COL_ARTICLE_ZADEL = 420;
  const COL_NAME_BUYER = 680;
  const COL_ARTICLE_BUYER = 940;
  const COL_QUANTITY = 1180;
  const COL_PRICE = 1350;
  const COL_COST = 1530;

  useEffect(() => {
    if (!uid) return;
    loadTkpData(uid);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      const client = new Client({
        webSocketFactory: () => new SockJS('http://45.146.164.123:8084/ws-stations'),
        onConnect: () => {
          if (!active) { client.deactivate(); return; }
          client.subscribe('/topic/tkp/status', () => {
            if (uid) loadTkpData(uid);
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
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [uid]);

  const loadTkpData = async (tkpUid: string) => {
    setIsLoading(true);
    try {
      const res = await AxiosService.get(ConstantInfo.restApiTkpGet(tkpUid));
      const data = res.data;
      setTkpData(data);
      if (data.order_uid && data.products) {
        loadBuyerInfo(data.order_uid, data.products);
      }
    } catch (e) {
      console.error('Ошибка загрузки ТКП:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBuyerInfo = async (orderUid: string, products: TkpProduct[]) => {
    try {
      const orderRes = await AxiosService.get(ConstantInfo.restApiOrderGet(orderUid));
      const orderData = orderRes.data;
      const orderProducts: any[] = orderData.products || [];
      const cache: Record<string, BuyerProductInfo> = {};
      products.forEach(p => {
        const found = orderProducts.find((op: any) => op.product_uid === p.product_uid);
        cache[p.product_uid] = {
          product: found?.product || '—',
          article: found?.article || '—',
        };
      });
      setBuyerInfoCache(cache);
    } catch (e) {
      console.error('Ошибка загрузки данных покупателя:', e);
    }
  };

  const canConfirm = tkpData && (!tkpData.statusinvoice || tkpData.statusinvoice === 'unaccept');
  const canCancel = tkpData && (!tkpData.statusinvoice || tkpData.statusinvoice === 'unaccept');
  const isProcessed = tkpData && (
    tkpData.statusinvoice === 'accept' ||
    tkpData.statusinvoice === 'inrealise' ||
    tkpData.statusinvoice === 'paid' ||
    tkpData.statusinvoice === 'unpaid' ||
    tkpData.statusinvoice === 'cancelcustomer' ||
    tkpData.statusinvoice === 'cancelprovider'
  );

  const handleConfirm = async () => {
    if (!uid) return;
    setIsConfirming(true);
    try {
      await AxiosService.post(`${ConstantInfo.restApiTkpGet(uid)}/confirm`, { status: 'Подтверждён' });
      loadTkpData(uid);
    } catch (e) {
      console.error('Ошибка подтверждения ТКП:', e);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!uid) return;
    setIsConfirming(true);
    try {
      await AxiosService.post(`${ConstantInfo.restApiTkpGet(uid)}/cancel`);
      loadTkpData(uid);
    } catch (e) {
      console.error('Ошибка отклонения ТКП:', e);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    const t = tabs.find(tab => tab.id === activeTabId);
    if (t) closeTab(t.id);
  };

  const handleOpenOrder = () => {
    if (tkpData?.order_uid) {
      navigate(`/orders/${tkpData.order_uid}`);
    }
  };

  const handleOpenBuyerMaterial = (productUid?: string) => {
    if (productUid) {
      openTab(`/references/nomenclature/edit/${productUid}/0`, `Номенклатура AWMS`, null);
    }
  };

  const handleCellMouseEnter = (e: React.MouseEvent, text: string) => {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollWidth > el.clientWidth || el.offsetWidth < el.scrollWidth) {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      const rect = el.getBoundingClientRect();
      tooltipTimer.current = setTimeout(() => {
        setTooltip({ text, x: rect.left + rect.width / 2, y: rect.bottom + 6 });
      }, 500);
    }
  };

  const handleCellMouseLeave = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip(null);
  };

  const formatDeliveryDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  const formatCost = (value: number): string => {
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  };

  const getStatusInvoiceLabel = (statusinvoice?: string) => {
    switch (statusinvoice) {
      case 'unaccept': return 'Не принят';
      case 'accept': return 'Подтверждён';
      case 'inrealise': return 'В реализации';
      case 'paid': return 'Оплачен';
      case 'unpaid': return 'Не оплачен';
      case 'cancelcustomer': return 'Отменён заказчиком';
      case 'cancelprovider': return 'Отменён поставщиком';
      default: return 'Ожидает';
    }
  };

  const getStatusInvoiceColor = (statusinvoice?: string) => {
    switch (statusinvoice) {
      case 'unaccept': return '#6B7280';
      case 'accept': return '#10B981';
      case 'inrealise': return '#666EFE';
      case 'paid': return '#F59E0B';
      case 'unpaid': return '#EF4444';
      case 'cancelcustomer': return '#FF3052';
      case 'cancelprovider': return '#FF3052';
      default: return '#6B7280';
    }
  };

  const activeTabStyle: React.CSSProperties = {
    width: 151, height: 40, borderRadius: 10,
    backgroundColor: '#666EFE', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, flexShrink: 0,
    fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#FFFFFF',
  };

  const inactiveTabStyle: React.CSSProperties = {
    ...activeTabStyle,
    backgroundColor: '#FFFFFF', color: '#2D4059',
  };

  const mutedButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };

  const FIELD_WIDTH = 370;
  const FIELD_HEIGHT = 44;

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: '#2D4059',
    minWidth: 160,
    flexShrink: 0,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: '#2D4059',
    wordBreak: 'break-word',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#666EFE',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px solid rgba(102, 110, 254, 0.15)',
  };

  if (isLoading) {
    return (
      <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span>
      </div>
    );
  }

  if (!tkpData) {
    return (
      <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>ТКП не найден</span>
      </div>
    );
  }

  const products: TkpProduct[] = tkpData.products || [];
  const emptyRows = Math.max(0, VISIBLE_ROWS - products.length);
  const deliveryDate = tkpData.delivery_date || tkpData.deliverydate || '';
  const totalCost = products.reduce((sum, p) => sum + (p.cost || 0), 0);
  const statusInvoice = tkpData.statusinvoice || '';
  const totalRows = products.length + emptyRows;

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <h1 style={{ position: 'absolute', top: 35, left: 60, fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>
        Документ: ТКП {tkpData.tkp_number ? `(${tkpData.tkp_number})` : uid}
      </h1>

      {tkpData.order_uid && (
        <button onClick={handleOpenOrder} style={{ position: 'absolute', top: 32, right: 132, width: 200, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <img src={TkpIcon} alt="Заказ" style={{ width: 18, height: 20, marginLeft: 15 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059', marginLeft: 15 }}>Заказ на поставку</span>
        </button>
      )}

      <button onClick={handleClose} style={{ position: 'absolute', top: 40, right: 40, width: 18, height: 18, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
        <img src={Icon7} alt="Закрыть" style={{ width: 18, height: 18 }} />
      </button>

      <div style={{ position: 'absolute', top: 100, left: 60, display: 'flex', gap: 25, alignItems: 'center' }}>
        <button onClick={() => setActiveTab(0)} style={activeTab === 0 ? activeTabStyle : inactiveTabStyle}><span>Основное</span></button>
        <button onClick={() => setActiveTab(1)} style={activeTab === 1 ? activeTabStyle : inactiveTabStyle}><span>Детализация</span></button>
      </div>

      {activeTab === 0 ? (
        <>
          <div style={{ position: 'absolute', top: 165, left: 40, width: TABLE_WIDTH, height: 137, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' }}>
            <div style={{ position: 'absolute', top: 35, left: 30, display: 'flex', gap: 60 }}>
              <div style={{ pointerEvents: 'none' }}><FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Номер:" icon={Icon11} iconActive={Icon12} value={tkpData.tkp_number || uid} placeholder="Номер ТКП" type="input" onChange={() => {}} selectIconWidth={20} selectIconHeight={14} /></div>
              <div style={{ pointerEvents: 'none' }}><FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Дата:" icon={IconN31} iconActive={IconN31} value={tkpData.tkp_data || tkpData.orderdata || '—'} placeholder="Дата" type="input" onChange={() => {}} selectIconWidth={18} selectIconHeight={18} /></div>
              <div style={{ pointerEvents: 'none' }}><FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Получено через:" icon={IconN41} iconActive={IconN42} value="Динамика SAAS" placeholder="" type="input" onChange={() => {}} selectIconWidth={18} selectIconHeight={18} /></div>
              <div style={{ pointerEvents: 'none' }}><FormField width={FIELD_WIDTH} height={FIELD_HEIGHT} label="Поставщик:" icon={IconN51} iconActive={IconN52} value="Zadel" placeholder="Поставщик" type="input" onChange={() => {}} selectIconWidth={20} selectIconHeight={20} /></div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: 327, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 15 }}>
              <button style={mutedButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
              <button style={mutedButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
              <button style={mutedButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
            </div>
            <span style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#2D4059',
              marginLeft: 55,
              whiteSpace: 'nowrap',
            }}>
              Общий срок поставки (от заказа до фактической поставки): {formatDeliveryDate(deliveryDate)}
            </span>
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
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NUMBER }}>НОМЕР</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME_ZADEL }}>НАИМЕНОВАНИЕ (ZADEL)</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_ARTICLE_ZADEL }}>АРТИКУЛ (ZADEL)</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NAME_BUYER }}>НАИМЕНОВАНИЕ ПОКУПАТЕЛЯ</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_ARTICLE_BUYER }}>АРТИКУЛ ПОКУПАТЕЛЯ</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_QUANTITY }}>КОЛИЧЕСТВО</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_PRICE }}>ЦЕНА</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_COST }}>СТОИМОСТЬ</span>
              </div>
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div style={{ minWidth: TABLE_WIDTH - 40 }}>
                  {products.map((product, index) => {
                    const buyerInfo = buyerInfoCache[product.product_uid] || { product: '—', article: '—' };
                    const isLastProduct = index === products.length - 1 && emptyRows === 0;
                    const isLast = index === totalRows - 1;
                    return (
                      <div key={product.product_uid || index} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', position: 'relative', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_NUMBER, zIndex: 1 }}>{index + 1}</span>
                        <span 
                          onMouseEnter={(e) => handleCellMouseEnter(e, product.product || '')} onMouseLeave={handleCellMouseLeave}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_NAME_ZADEL, maxWidth: COL_ARTICLE_ZADEL - COL_NAME_ZADEL - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 1 }}>
                          {product.product || '—'}
                        </span>
                        <span onMouseEnter={(e) => handleCellMouseEnter(e, product.article || '')} onMouseLeave={handleCellMouseLeave}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_ARTICLE_ZADEL, maxWidth: COL_NAME_BUYER - COL_ARTICLE_ZADEL - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 1 }}>{product.article || '—'}</span>
                        <span onClick={() => handleOpenBuyerMaterial(product.product_uid)}
                          onMouseEnter={(e) => handleCellMouseEnter(e, buyerInfo.product)} onMouseLeave={handleCellMouseLeave}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#666EFE', position: 'absolute', left: COL_NAME_BUYER, maxWidth: COL_ARTICLE_BUYER - COL_NAME_BUYER - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline', zIndex: 1 }}>{buyerInfo.product}</span>
                        <span onMouseEnter={(e) => handleCellMouseEnter(e, buyerInfo.article)} onMouseLeave={handleCellMouseLeave}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_ARTICLE_BUYER, maxWidth: COL_QUANTITY - COL_ARTICLE_BUYER - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 1 }}>{buyerInfo.article}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_QUANTITY, zIndex: 1 }}>{product.quantity}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_PRICE, zIndex: 1 }}>{product.price?.toLocaleString()} ₽</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059', position: 'absolute', left: COL_COST, zIndex: 1 }}>{product.cost?.toLocaleString()} ₽</span>
                      </div>
                    );
                  })}
                  {Array.from({ length: emptyRows }).map((_, i) => {
                    const rowIndex = products.length + i;
                    const isLast = rowIndex === totalRows - 1;
                    return (
                      <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' }} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 30, left: 40, width: 418, height: 60, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>Количество номенклатур</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>{products.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>На сумму</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059' }}>{formatCost(totalCost)}</span>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 30, left: 40 + 418 + 203, width: 297, height: 60, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' }}>Статус ТКП:</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: getStatusInvoiceColor(statusInvoice), marginLeft: 9 }}>{getStatusInvoiceLabel(statusInvoice)}</span>
          </div>
        </>
      ) : (
        <div style={{ position: 'absolute', top: 165, left: 40, width: TABLE_WIDTH, bottom: 111 }}>
          <div ref={detailScrollRef} style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', padding: 30, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {products.length === 0 ? (
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9CA3AF' }}>Нет данных</span>
            ) : (
              products.map((product, idx) => (
                <div key={product.product_uid || idx} style={{ marginBottom: idx < products.length - 1 ? 40 : 0 }}>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: '#666EFE', marginBottom: 16 }}>Позиция {idx + 1}: {product.product || '—'}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>UID (Zadel):</span><span style={{ ...valueStyle, color: '#2D4059' }}>{product.zadel_product_uid || '—'}</span></div>
                    <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>UID (AWMS):</span><span onClick={() => handleOpenBuyerMaterial(product.product_uid)} style={{ ...valueStyle, color: '#666EFE', cursor: 'pointer', textDecoration: 'underline' }}>{product.product_uid || '—'}</span></div>
                    <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Артикул:</span><span style={valueStyle}>{product.article || '—'}</span></div>
                    <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Количество:</span><span style={valueStyle}>{product.quantity}</span></div>
                    <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Цена:</span><span style={valueStyle}>{product.price?.toLocaleString()} ₽</span></div>
                    <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Стоимость:</span><span style={valueStyle}>{product.cost?.toLocaleString()} ₽</span></div>
                    {product.group && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Группа:</span><span style={valueStyle}>{product.group}</span></div>}
                    {product.type && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Вид:</span><span style={valueStyle}>{product.type}</span></div>}
                    {product.manufacturer && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Производитель:</span><span style={valueStyle}>{product.manufacturer}</span></div>}
                    {product.country && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Страна:</span><span style={valueStyle}>{product.country}</span></div>}
                    {product.brand && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Бренд:</span><span style={valueStyle}>{product.brand}</span></div>}
                    {product.model && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Модель:</span><span style={valueStyle}>{product.model}</span></div>}
                    {product.description && <div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Описание:</span><span style={{ ...valueStyle, maxWidth: 1200 }}>{product.description}</span></div>}
                  </div>
                  {product.specifications && product.specifications.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Характеристики</div><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{product.specifications.map((spec, i) => <div key={i} style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>{spec.characteristic}:</span><span style={valueStyle}>{spec.value} {spec.unit}</span></div>)}</div></div>}
                  {product.barcode && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Штрихкод</div><div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Код:</span><span style={valueStyle}>{product.barcode.code || '—'}</span></div>{product.barcode.codeimage && <img src={`data:image/png;base64,${product.barcode.codeimage}`} alt="Штрихкод" style={{ maxWidth: 300, marginTop: 8, borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />}</div>}
                  {product.sku && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>SKU</div><div style={{ display: 'flex', gap: 10 }}><span style={labelStyle}>Код:</span><span style={valueStyle}>{product.sku.code || '—'}</span></div>{product.sku.image && <img src={`data:image/png;base64,${product.sku.image}`} alt="SKU" style={{ maxWidth: 150, marginTop: 8, borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />}</div>}
                  {product.images && product.images.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Изображения</div><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{product.images.map((img, i) => <img key={i} src={`data:image/png;base64,${img}`} alt="" style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />)}</div></div>}
                  {product.draws && product.draws.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Чертежи</div><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{product.draws.map((draw, i) => <img key={i} src={`data:image/png;base64,${draw}`} alt="" style={{ width: 200, height: 150, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)' }} />)}</div></div>}
                  {product.analogues && product.analogues.length > 0 && <div style={{ marginBottom: 16 }}><div style={sectionTitleStyle}>Аналоги</div>{product.analogues.map((analog, i) => <div key={i} style={{ display: 'flex', gap: 20, padding: '6px 0' }}><span style={valueStyle}>{analog.name}</span><span style={{ ...valueStyle, color: '#6B7280' }}>{analog.model}</span><span style={{ ...valueStyle, color: '#9CA3AF', fontSize: 12 }}>UID: {analog.uid}</span></div>)}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 30, right: 30, display: 'flex', alignItems: 'center', gap: 30 }}>
        {!isProcessed ? (
          <>
            {canConfirm && <button onClick={handleConfirm} disabled={isConfirming} style={{ width: 154, height: 50, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', backgroundColor: !isConfirming ? '#10B981' : '#BCC8FF', border: 'none', opacity: isConfirming ? 0.6 : 1, cursor: !isConfirming ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isConfirming ? 'Подтверждение...' : 'Подтвердить'}</button>}
            {canCancel && <button onClick={handleCancel} disabled={isConfirming} style={{ width: 154, height: 50, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', backgroundColor: !isConfirming ? '#FF3052' : '#BCC8FF', border: 'none', opacity: isConfirming ? 0.6 : 1, cursor: !isConfirming ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isConfirming ? 'Отклонение...' : 'Отклонить'}</button>}
          </>
        ) : (
          <button disabled style={{ width: 154, height: 50, borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', backgroundColor: '#10B981', border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓ Обработано</button>
        )}
        <button onClick={handleClose} style={{ width: 116, height: 50, borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059' }}>Закрыть</button>
      </div>

      {tooltip && <div style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)', backgroundColor: '#2D4059', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 6, whiteSpace: 'nowrap', zIndex: 9999, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{tooltip.text}</div>}
    </div>
  );
};

export default TkpViewPage;