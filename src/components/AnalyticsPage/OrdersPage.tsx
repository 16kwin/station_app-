// OrdersPage.tsx — ПОЛНЫЙ ФАЙЛ (номер вместо UID, колонки перераспределены)
import React, { useRef, useState, useEffect } from 'react';
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
import Icon4 from '../../assets/References/Icon4.svg';
import Icon6 from '../../assets/References/Icon6.svg';
import Icon7 from '../../assets/References/Icon7.svg';
import Icon8 from '../../assets/References/Icon8.svg';
import Icon9 from '../../assets/References/Icon9.svg';
import Icon10 from '../../assets/References/Icon10.svg';
import Icon20 from '../../assets/References/Icon20.svg';
import Popup1 from '../../assets/References/popup1.svg';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface OrderItem {
  order_uid: string;
  customer_id: string;
  order_number: string;
  order_datetime: string;
  status?: string;
  statusreason?: string;
  statustrack?: string;
}

type ContextMenuType = 'order';

interface ContextMenuState {
  x: number;
  y: number;
  uid: string;
  type: ContextMenuType;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

const OrdersPage = () => {
  const { activeTabId, openTab } = useTabs();
  const tabIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<any>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'not_sent' | 'closed'>('all');
  const activeFilterRef = useRef(activeFilter);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
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
  const COL_NUMBER = 62;
  const COL_CUSTOMER = 282;
  const COL_SOURCE = 582;
  const COL_DATE = 882;
  const COL_STATUS = 1182;
  const COL_STATE = 1482;

  useEffect(() => {
    tabIdRef.current = activeTabId;
  }, []);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

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

  const fetchOrders = async () => {
    try {
      if (activeFilter === 'all') {
        const [activeRes, closedRes, notSentRes] = await Promise.all([
          AxiosService.get(ConstantInfo.restApiOrdersActive),
          AxiosService.get(ConstantInfo.restApiOrdersClosed),
          AxiosService.get(ConstantInfo.restApiOrdersNotSent)
        ]);
        setOrders([...(activeRes.data || []), ...(closedRes.data || []), ...(notSentRes.data || [])]);
      } else if (activeFilter === 'not_sent') {
        const response = await AxiosService.get(ConstantInfo.restApiOrdersNotSent);
        setOrders(response.data || []);
      } else {
        const url = activeFilter === 'active' ? ConstantInfo.restApiOrdersActive : ConstantInfo.restApiOrdersClosed;
        const response = await AxiosService.get(url);
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTabId && activeTabId === tabIdRef.current && orders.length > 0) {
      fetchOrders();
    }
  }, [activeTabId]);

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  useEffect(() => {
    let client: Client | null = null;
    let active = true;

    const timer = setTimeout(() => {
      if (!active) return;
      
      client = new Client({
        webSocketFactory: () => new SockJS('http://45.146.164.123:8084/ws-stations'),
        onConnect: () => {
          if (!active) {
            client?.deactivate();
            return;
          }
          
          const refresh = () => {
            const filter = activeFilterRef.current;
            if (filter === 'all') {
              Promise.all([
                AxiosService.get(ConstantInfo.restApiOrdersActive),
                AxiosService.get(ConstantInfo.restApiOrdersClosed),
                AxiosService.get(ConstantInfo.restApiOrdersNotSent)
              ]).then(([activeRes, closedRes, notSentRes]) => {
                if (active) setOrders([...(activeRes.data || []), ...(closedRes.data || []), ...(notSentRes.data || [])]);
              }).catch(console.error).finally(() => { if (active) setIsLoading(false); });
            } else if (filter === 'not_sent') {
              AxiosService.get(ConstantInfo.restApiOrdersNotSent).then(res => {
                if (active) setOrders(res.data || []);
              }).catch(console.error).finally(() => { if (active) setIsLoading(false); });
            } else {
              const url = filter === 'active' ? ConstantInfo.restApiOrdersActive : ConstantInfo.restApiOrdersClosed;
              AxiosService.get(url).then(res => {
                if (active) setOrders(res.data || []);
              }).catch(console.error).finally(() => { if (active) setIsLoading(false); });
            }
          };
          
          client?.subscribe('/topic/tkp/new', () => refresh());
          client?.subscribe('/topic/tkp/status', () => refresh());
          client?.subscribe('/topic/orders/refresh', () => refresh());
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
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, uid: string, type: ContextMenuType) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, uid, type });
  };

  const handleContextOpen = () => {
    if (!contextMenu) return;
    const { uid } = contextMenu;
    setContextMenu(null);
    openTab(`/orders/${uid}`, `Заказ ${uid.slice(0, 8)}`, null);
  };

  const handleCreateClick = async () => {
    const newUid = generateUUID();
    openTab(`/orders/create/${newUid}`, 'Заказ (новый)', null);
  };

  const handleOrderClick = (orderUid: string) => {
    openTab(`/orders/${orderUid}`, `Заказ ${orderUid.slice(0, 8)}`, null);
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'processed': return 'В работе';
      case 'closed': return 'Закрыт';
      case 'not_sent': return 'Не отправлен';
      default: return status || '—';
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === 'closed') return '#2D4059';
    if (status === 'not_sent') return '#F59E0B';
    return '#666EFE';
  };

  const getStateLabel = (item: OrderItem) => {
    const reason = item.statusreason;
    const track = item.statustrack;
    
    if (reason === 'draft') return 'Черновик';
    if (reason === 'cancelcustomer') return 'Отменён заказчиком';
    if (reason === 'cancelprovider') return 'Отменён поставщиком';
    if (reason === 'done') return 'Завершён';
    if (track === 'done') return 'Завершён';
    if (reason === 'inprocessing') return 'В обработке';
    if (reason === 'inworkprovider') return 'В работе';
    if (track === 'notinwork') return 'В реализации';
    if (track === 'inwork') return 'Принят в работу';
    if (track === 'intransitoutside') return 'Транзит за пределами РФ';
    if (track === 'customs') return 'На таможне';
    if (track === 'intransitinside') return 'Транзит на территории РФ';
    if (track === 'warehouse') return 'Прибыл на склад';
    if (track === 'sorting') return 'Сортировка';
    if (track === 'sent') return 'Отправлен получателю';
    if (track === 'courier') return 'У курьера';
    if (reason === 'posttkpprovider') return 'ТКП направлено';
    
    return reason || track || '—';
  };

  const getStateColor = (item: OrderItem) => {
    const reason = item.statusreason;
    const track = item.statustrack;
    
    if (reason === 'draft') return '#F59E0B';
    if (reason === 'cancelcustomer' || reason === 'cancelprovider') return '#FF3052';
    if (reason === 'done' || track === 'done') return '#07E098';
    if (track && track !== 'notinwork') return '#666EFE';
    if (reason === 'posttkpprovider' || track === 'notinwork') return '#666EFE';
    return '#2D4059';
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}.${mm}.${yy}-${hh}:${min}`;
    } catch {
      return dateStr;
    }
  };

  const handleCellMouseEnter = (e: React.MouseEvent, text: string) => {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollWidth > el.clientWidth) {
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

  useEffect(() => { const timer = setTimeout(checkScroll, 350); return () => clearTimeout(timer); }, [orders]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll); ro.observe(container);
    return () => { container.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const mutedButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };
  const activeMediumButtonStyle: React.CSSProperties = { height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 };

  const contextMenuButtonStyle: React.CSSProperties = { height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' };
  const contextMenuButtonMutedStyle: React.CSSProperties = { ...contextMenuButtonStyle, opacity: 0.4, cursor: 'default' };

  const emptyRows = Math.max(0, VISIBLE_ROWS - orders.length);

  const filterOptions = [
    { key: 'all' as const, label: 'Все', width: 58 },
    { key: 'active' as const, label: 'В работе', width: 96 },
    { key: 'not_sent' as const, label: 'Не отправлен', width: 126 },
    { key: 'closed' as const, label: 'Закрыт', width: 86 },
  ];

  const filterBlockWidth = 366;
  const filterBlockLeft = 400;
  const periodBlockLeft = filterBlockLeft + filterBlockWidth + 20;
  const periodBlockWidth = 187;
  const createButtonLeft = periodBlockLeft + periodBlockWidth + 100;

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
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 700, color: '#2D4059', margin: 0, lineHeight: '29px', height: 29 }}>Журнал документов: Заказ на поставку</h1>
      </div>

      <div style={{ position: 'absolute', top: 110, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <button style={mutedButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>

        <div style={{ position: 'absolute', left: `${filterBlockLeft}px`, width: filterBlockWidth, height: 40, backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', display: 'flex', alignItems: 'center', padding: '0 1px' }}>
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

        <div style={{ position: 'absolute', left: `${createButtonLeft}px`, display: 'flex', gap: 15 }}>
          <button style={{ ...activeMediumButtonStyle, width: 124 }} onClick={handleCreateClick}>
            <img src={Icon4} alt="" style={{ width: 16, height: 16, marginLeft: 12 }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 15 }}>Создать</span>
          </button>
          <button style={mutedButtonStyle}><img src={Icon6} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon7} alt="" style={{ width: 18, height: 18 }} /></button>
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
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_NUMBER }}>НОМЕР</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_CUSTOMER }}>ПОСТАВЩИК</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_SOURCE }}>ИСТОЧНИК ЗАКАЗА</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА-ВРЕМЯ</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_STATUS }}>СТАТУС</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_STATE }}>СОСТОЯНИЕ ЗАКАЗА</span>
          </div>
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div style={{ minWidth: TABLE_WIDTH - 40 }}>
              {orders.map((item, idx) => {
                const isSelected = selectedIds.has(item.order_uid);
                const isFirst = idx === 0;
                const isLast = idx === orders.length - 1;
                const numberText = item.order_number || '—';
                const customerText = 'ЗАДЕЛ';
                const sourceText = 'AWMS:Динамика';
                const dateText = formatDateTime(item.order_datetime);
                const statusText = getStatusLabel(item.status);
                const statusColor = getStatusColor(item.status);
                const stateText = getStateLabel(item);
                const stateColor = getStateColor(item);

                return (
                  <div
                    key={item.order_uid}
                    style={{
                      height: ROW_HEIGHT, display: 'flex', alignItems: 'center',
                      backgroundColor: isSelected ? '#EDF6FF' : '#FFFFFF',
                      position: 'relative', cursor: 'pointer', boxSizing: 'border-box',
                      borderTop: isFirst ? 'none' : '0.5px solid #E5ECF5',
                      borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5',
                    }}
                    onContextMenu={(e) => handleContextMenu(e, item.order_uid, 'order')}
                    onDoubleClick={() => handleOrderClick(item.order_uid)}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F8F9FC'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                  >
                    <img src={Popup1} alt="" style={{ position: 'absolute', left: COL_ICON, width: 20, height: 22 }} />
                    <span
                      onMouseEnter={(e) => handleCellMouseEnter(e, numberText)}
                      onMouseLeave={handleCellMouseLeave}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_NUMBER, maxWidth: COL_CUSTOMER - COL_NUMBER - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >{numberText}</span>
                    <span
                      onMouseEnter={(e) => handleCellMouseEnter(e, customerText)}
                      onMouseLeave={handleCellMouseLeave}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_CUSTOMER, maxWidth: COL_SOURCE - COL_CUSTOMER - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >{customerText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_SOURCE, maxWidth: COL_DATE - COL_SOURCE - 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sourceText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', position: 'absolute', left: COL_DATE }}>{dateText}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: statusColor, position: 'absolute', left: COL_STATUS }}>{statusText}</span>
                    <span
                      onMouseEnter={(e) => handleCellMouseEnter(e, stateText)}
                      onMouseLeave={handleCellMouseLeave}
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: stateColor, position: 'absolute', left: COL_STATE, maxWidth: 185, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >{stateText}</span>
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

      {contextMenu && (
        <div style={{ 
          position: 'fixed', top: contextMenu.y, left: contextMenu.x,
          width: 174, backgroundColor: '#FFFFFF', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001,
          display: 'flex', flexDirection: 'column', padding: '8px 0'
        }} onClick={e => e.stopPropagation()}>
          <button style={contextMenuButtonStyle} onClick={handleContextOpen}>
            <img src={Icon20} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />
            Открыть
          </button>
          <button style={contextMenuButtonMutedStyle}>
            <img src={Icon7} alt="" style={{ width: 18, height: 18, marginRight: 16, opacity: 0.4 }} />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;