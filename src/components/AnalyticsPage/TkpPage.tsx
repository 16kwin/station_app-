// TkpPage.tsx (AWMS) — журнал ТКП с номерами вместо UID
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import CustomScrollbar from '../../components/CustomScrollbar';
import AxiosService from '../../services/AxiosService';
import ConstantInfo from '../../info/ConstantInfo';
import { useTabs } from '../../context/TabContext';
import Icon1 from '../../assets/References/Icon1.svg';
import Icon2 from '../../assets/References/Icon2.svg';
import Icon3 from '../../assets/References/Icon3.svg';
import CalendarIcon from '../../assets/References/ICONN3.svg';
import Icon8 from '../../assets/References/Icon8.svg';
import Icon9 from '../../assets/References/Icon9.svg';
import Icon10 from '../../assets/References/Icon10.svg';
import Icon2Row from '../../assets/ICON2.svg';

interface TkpItem {
  tkp_uid: string;
  order_uid: string;
  customer_id: string;
  order_number: string;
  order_datetime: string;
  total_cost: number;
  delivery_date: string;
  status?: string;
  statusinvoice?: string;
  tkp_number?: string;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

const TkpPage = () => {
  const navigate = useNavigate();
  const { activeTabId, openTab } = useTabs();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<any>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unaccept' | 'accept' | 'cancelled'>('all');
  const activeFilterRef = useRef(activeFilter);
  const [tkpList, setTkpList] = useState<TkpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const TABLE_WIDTH = 1720;
  const TABLE_HEIGHT = 638;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 10;

  const COL_ICON = 30;
  const COL_NUMBER_TKP = 60;
  const COL_NUMBER_ORDER = 384;
  const COL_CUSTOMER = 719;
  const COL_COST = 919;
  const COL_DELIVERY = 1119;
  const COL_PAYMENT = 1319;
  const COL_STATUS = 1519;

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    if (!tooltip) return;
    const handleMove = () => setTooltip(null);
    const timer = setTimeout(handleMove, 3000);
    window.addEventListener('scroll', handleMove, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleMove, true);
    };
  }, [tooltip]);

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

  const getPaymentLabel = (item: TkpItem) => {
    const statusinvoice = item.statusinvoice;
    if (statusinvoice === 'paid') return 'Оплачен';
    if (statusinvoice === 'unpaid') return 'Не оплачен';
    if (statusinvoice === 'inrealise') return 'Ожидается';
    if (statusinvoice === 'accept') return 'Ожидается';
    if (statusinvoice === 'unaccept') return '—';
    if (statusinvoice === 'cancelcustomer' || statusinvoice === 'cancelprovider') return '—';
    return 'Ожидается';
  };

  const getPaymentColor = (item: TkpItem) => {
    const statusinvoice = item.statusinvoice;
    if (statusinvoice === 'paid') return '#10B981';
    if (statusinvoice === 'unpaid') return '#FF3052';
    return '#6B7280';
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${dd}.${mm}.${yy}`;
    } catch {
      return dateStr;
    }
  };

  const fetchTkp = async () => {
    try {
      const [activeRes, closedRes] = await Promise.all([
        AxiosService.get(ConstantInfo.restApiTkpActive),
        AxiosService.get(ConstantInfo.restApiTkpClosed)
      ]);
      const all = [...(activeRes.data || []), ...(closedRes.data || [])];
      
      let filtered = all;
      if (activeFilter === 'unaccept') {
        filtered = all.filter((t: TkpItem) => t.statusinvoice === 'unaccept' || !t.statusinvoice);
      } else if (activeFilter === 'accept') {
        filtered = all.filter((t: TkpItem) => t.statusinvoice === 'accept' || t.statusinvoice === 'inrealise');
      } else if (activeFilter === 'cancelled') {
        filtered = all.filter((t: TkpItem) => 
          t.statusinvoice === 'cancelcustomer' || t.statusinvoice === 'cancelprovider' ||
          t.statusinvoice === 'paid' || t.statusinvoice === 'unpaid'
        );
      }
      
      setTkpList(filtered);
    } catch (error) {
      console.error('Ошибка загрузки ТКП:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTkp();
  }, [activeFilter]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      const client = new Client({
        webSocketFactory: () => new SockJS('http://45.146.164.123:8084/ws-stations'),
        onConnect: () => {
          if (!active) { client.deactivate(); return; }
          const refresh = () => {
            const filter = activeFilterRef.current;
            Promise.all([
              AxiosService.get(ConstantInfo.restApiTkpActive),
              AxiosService.get(ConstantInfo.restApiTkpClosed)
            ]).then(([activeRes, closedRes]) => {
              const all = [...(activeRes.data || []), ...(closedRes.data || [])];
              let filtered = all;
              if (filter === 'unaccept') {
                filtered = all.filter((t: TkpItem) => t.statusinvoice === 'unaccept' || !t.statusinvoice);
              } else if (filter === 'accept') {
                filtered = all.filter((t: TkpItem) => t.statusinvoice === 'accept' || t.statusinvoice === 'inrealise');
              } else if (filter === 'cancelled') {
                filtered = all.filter((t: TkpItem) => 
                  t.statusinvoice === 'cancelcustomer' || t.statusinvoice === 'cancelprovider' ||
                  t.statusinvoice === 'paid' || t.statusinvoice === 'unpaid'
                );
              }
              if (active) setTkpList(filtered);
            }).catch(console.error).finally(() => { if (active) setIsLoading(false); });
          };
          
          client.subscribe('/topic/tkp/new', refresh);
          client.subscribe('/topic/tkp/status', refresh);
          client.subscribe('/topic/orders/refresh', refresh);
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
  }, []);

  const handleTkpClick = (tkpUid: string) => {
    openTab(`/tkp/${tkpUid}`, `ТКП ${tkpUid.slice(0, 8)}`, null);
  };

  const handleViewOrder = (e: React.MouseEvent, orderUid: string) => {
    e.stopPropagation();
    if (orderUid) openTab(`/orders/${orderUid}`, `Заказ ${orderUid.slice(0, 8)}`, null);
  };

  const handleCellMouseEnter = (e: React.MouseEvent, text: string) => {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
      const rect = el.getBoundingClientRect();
      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.bottom + 4 });
    }
  };

  const handleCellMouseLeave = () => {
    setTooltip(null);
  };

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setHasVerticalScroll(container.scrollHeight > container.clientHeight);
    setHasHorizontalScroll(container.scrollWidth > container.clientWidth);
  };

  useEffect(() => { const timer = setTimeout(checkScroll, 350); return () => clearTimeout(timer); }, [tkpList]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll); ro.observe(container);
    return () => { container.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const mutedButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };

  const emptyRows = Math.max(0, VISIBLE_ROWS - tkpList.length);

  const filterOptions = [
    { key: 'all' as const, label: 'Все', width: 58 },
    { key: 'unaccept' as const, label: 'Не подтверждён', width: 156 },
    { key: 'accept' as const, label: 'Подтверждён', width: 134 },
    { key: 'cancelled' as const, label: 'Завершён', width: 104 },
  ];

  const filterBlockWidth = 452;
  const filterBlockLeft = 405;
  const periodBlockLeft = filterBlockLeft + filterBlockWidth + 20;
  const periodBlockWidth = 187;

  const filterButtonStyle = (isActive: boolean, width: number, position: 'left' | 'center' | 'right'): React.CSSProperties => ({
    width,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: position === 'left' ? '8px 0 0 8px' : position === 'right' ? '0 8px 8px 0' : '0',
    backgroundColor: isActive ? '#666EFE' : 'transparent',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  });

  const filterTextStyle = (isActive: boolean): React.CSSProperties => ({
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    fontWeight: 500,
    color: isActive ? '#FFFFFF' : '#2D4059',
  });

  const dividerStyle: React.CSSProperties = {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(45, 64, 89, 0.5)',
    flexShrink: 0,
  };

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
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 700, color: '#2D4059', margin: 0, lineHeight: '29px', height: 29 }}>Журнал документов: ТКП</h1>
      </div>

      <div style={{ position: 'absolute', top: 110, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <button style={mutedButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>

        <div style={{ position: 'absolute', left: `${filterBlockLeft}px`, width: filterBlockWidth, height: 40, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {filterOptions.map((opt, i) => (
            <React.Fragment key={opt.key}>
              {i > 0 && <div style={dividerStyle} />}
              <div
                onClick={() => setActiveFilter(opt.key)}
                style={filterButtonStyle(activeFilter === opt.key, opt.width, i === 0 ? 'left' : i === 3 ? 'right' : 'center')}
              >
                <span style={filterTextStyle(activeFilter === opt.key)}>{opt.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ position: 'absolute', left: `${periodBlockLeft}px`, width: periodBlockWidth, height: 40, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowDatePicker(!showDatePicker)}>
          <img src={CalendarIcon} alt="" style={{ width: 18, height: 18, marginLeft: 12, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 12 }}>Период выборки</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
          <button style={mutedButtonStyle}><img src={Icon8} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon9} alt="" style={{ width: 14, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon10} alt="" style={{ width: 18, height: 16 }} /></button>
        </div>
      </div>

      {showDatePicker && (
        <div style={{ position: 'absolute', top: 155, left: `${periodBlockLeft + 55}px`, width: 320, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 20, zIndex: 100 }}>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 15 }}>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>С</div>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 130, height: 36, borderRadius: 8, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>По</div>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 130, height: 36, borderRadius: 8, border: '1px solid rgba(102, 110, 254, 0.15)', paddingLeft: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { setDateFrom(''); setDateTo(''); setShowDatePicker(false); }} style={{ height: 36, paddingLeft: 16, paddingRight: 16, borderRadius: 8, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059' }}>Сбросить</button>
            <button onClick={() => setShowDatePicker(false)} style={{ height: 36, paddingLeft: 16, paddingRight: 16, borderRadius: 8, border: 'none', backgroundColor: '#666EFE', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Применить</button>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', top: 162, left: 40 }}>
        <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingRight: 40, boxSizing: 'border-box' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NUMBER_TKP }}>НОМЕР ТКП</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NUMBER_ORDER }}>НОМЕР ЗАКАЗА</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_CUSTOMER }}>ЗАКАЗЧИК</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_COST }}>СТОИМОСТЬ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DELIVERY }}>ПОСТАВКА</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_PAYMENT }}>ОПЛАТА</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_STATUS }}>СТАТУС</span>
          </div>
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div style={{ minWidth: TABLE_WIDTH - 40 }}>
              {tkpList.map((item, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === tkpList.length - 1;
                const tkpNumberText = item.tkp_number || item.order_number || '—';
                const orderNumberText = item.order_number || '—';
                const customerText = item.customer_id || '—';
                const costText = item.total_cost ? `${Number(item.total_cost).toLocaleString()} ₽` : '—';
                const deliveryText = formatDateTime(item.delivery_date);
                const paymentText = getPaymentLabel(item);
                const paymentColor = getPaymentColor(item);
                const statusText = getStatusInvoiceLabel(item.statusinvoice);
                const statusColor = getStatusInvoiceColor(item.statusinvoice);

                return (
                  <div key={item.tkp_uid || idx} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', position: 'relative', cursor: 'pointer', boxSizing: 'border-box', borderTop: isFirst ? 'none' : '0.5px solid #E5ECF5', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' }}
                    onDoubleClick={() => handleTkpClick(item.tkp_uid)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8F9FC'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}>
                    <img src={Icon2Row} alt="" style={{ position: 'absolute', left: COL_ICON, width: 18, height: 22 }} />
                    <span
                      onMouseEnter={(e) => handleCellMouseEnter(e, tkpNumberText)}
                      onMouseLeave={handleCellMouseLeave}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_NUMBER_TKP, maxWidth: COL_NUMBER_ORDER - COL_NUMBER_TKP - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >{tkpNumberText}</span>
                    <span
                      onClick={(e) => handleViewOrder(e, item.order_uid)}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#666EFE', position: 'absolute', left: COL_NUMBER_ORDER, maxWidth: COL_CUSTOMER - COL_NUMBER_ORDER - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline' }}
                    >{orderNumberText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_CUSTOMER, maxWidth: COL_COST - COL_CUSTOMER - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#2D4059', position: 'absolute', left: COL_COST }}>{costText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_DELIVERY }}>{deliveryText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: paymentColor, position: 'absolute', left: COL_PAYMENT }}>{paymentText}</span>
                    <span
                      onMouseEnter={(e) => handleCellMouseEnter(e, statusText)}
                      onMouseLeave={handleCellMouseLeave}
                      style={{
                        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: statusColor,
                        position: 'absolute', left: COL_STATUS,
                        maxWidth: 180, overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: '20px', maxHeight: 40,
                      } as React.CSSProperties}
                    >{statusText}</span>
                  </div>
                );
              })}
              {Array.from({ length: emptyRows }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} />
              ))}
            </div>
          </div>
        </div>
        {hasVerticalScroll && (<div style={{ position: 'absolute', right: -25, top: HEADER_HEIGHT, height: TABLE_HEIGHT - HEADER_HEIGHT, width: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>)}
        {hasHorizontalScroll && (<div style={{ position: 'absolute', bottom: -21, left: 0, width: TABLE_WIDTH, height: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="horizontal" trackSize={TABLE_WIDTH} /></div>)}
      </div>

      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y,
          transform: 'translateX(-50%)',
          backgroundColor: '#2D4059', color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
          padding: '6px 12px', borderRadius: 6, whiteSpace: 'nowrap',
          zIndex: 9999, pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default TkpPage;