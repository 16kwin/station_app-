// PriceHistoryTab.tsx — ПОЛНЫЙ ФАЙЛ (график с зумом от минут до месяцев)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { CommonProps } from './NomenclatureCreatePage';
import IconUp from '../../../assets/References/NomenclatureCreatePage/IconUp.svg';
import IconDown from '../../../assets/References/NomenclatureCreatePage/IconDown.svg';
import IconRavno from '../../../assets/References/NomenclatureCreatePage/IconRavno.svg';
import Button1 from '../../../assets/References/NomenclatureCreatePage/button1.svg';
import Button4 from '../../../assets/References/NomenclatureCreatePage/button4.svg';
import Button5 from '../../../assets/References/NomenclatureCreatePage/button5.svg';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Компонент для кастомного тика с поддержкой переноса строк
const CustomTick = (props: any) => {
  const { x, y, payload, zoomDomain, extendedRange } = props;
  
  if (!payload || payload.value === undefined || payload.value === null) return null;
  
  const d = new Date(payload.value);
  const currentRange = zoomDomain ? (zoomDomain.end - zoomDomain.start) : extendedRange;
  
  let firstLine = '';
  let secondLine = '';
  
  if (currentRange < 3600000) {
    firstLine = d.toLocaleString('ru', { hour: '2-digit', minute: '2-digit' });
    secondLine = d.toLocaleString('ru', { day: '2-digit', month: '2-digit' });
  } else if (currentRange < 86400000) {
    firstLine = d.toLocaleString('ru', { hour: '2-digit', minute: '2-digit' });
    secondLine = d.toLocaleString('ru', { day: '2-digit', month: '2-digit' });
  } else if (currentRange < 604800000) {
    firstLine = d.toLocaleString('ru', { day: '2-digit', month: '2-digit' });
    secondLine = d.toLocaleString('ru', { hour: '2-digit', minute: '2-digit' });
  } else if (currentRange < 2592000000) {
    firstLine = d.toLocaleString('ru', { day: '2-digit', month: '2-digit' });
    secondLine = '';
  } else if (currentRange < 31536000000) {
    firstLine = d.toLocaleString('ru', { month: 'long' });
    secondLine = d.getFullYear().toString();
  } else {
    firstLine = d.toLocaleString('ru', { month: 'long' });
    secondLine = d.getFullYear().toString();
  }
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} textAnchor="middle" fill="#2D4059" fontFamily="Inter, sans-serif" fontSize={11}>
        {firstLine}
      </text>
      {secondLine && (
        <text x={0} y={28} textAnchor="middle" fill="#2D4059" fontFamily="Inter, sans-serif" fontSize={11}>
          {secondLine}
        </text>
      )}
    </g>
  );
};

const PriceHistoryTab: React.FC<CommonProps> = (props) => {
  const {
    uid, prices, suppliers, showAddPricePopup,
    newPrice, newPriceDate, newPriceSupplierUid,
    setShowAddPricePopup, setNewPrice, setNewPriceDate, setNewPriceSupplierUid,
    handleAddPrice, handleDeletePrice,
  } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingPriceUid, setEditingPriceUid] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPriceDate, setEditPriceDate] = useState('');
  const [editPriceSupplierUid, setEditPriceSupplierUid] = useState('');

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; priceUid: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(0);

  // Функция для получения времени создания записи
  const getCreationTime = (price: any, index: number): number => {
    if (price.createdAt) return new Date(price.createdAt).getTime();
    if (price.created_at) return new Date(price.created_at).getTime();
    if (price.id) return Number(price.id);
    return index;
  };

  // Сортируем: сначала по дате (новые сверху), если даты равны - по времени создания (более ранние сверху)
  const sortedPrices = [...prices].sort((a, b) => {
    const dateA = new Date(a.priceDate).getTime();
    const dateB = new Date(b.priceDate).getTime();
    
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    
    const createdA = getCreationTime(a, prices.indexOf(a));
    const createdB = getCreationTime(b, prices.indexOf(b));
    return createdA - createdB;
  });
  
  // Для графика сортируем по возрастанию даты, затем по времени создания
  const chartData = [...prices]
    .sort((a, b) => {
      const dateA = new Date(a.priceDate).getTime();
      const dateB = new Date(b.priceDate).getTime();
      
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      const createdA = getCreationTime(a, prices.indexOf(a));
      const createdB = getCreationTime(b, prices.indexOf(b));
      return createdA - createdB;
    })
    .map(p => ({
      time: new Date(p.priceDate).getTime(),
      price: p.price,
      fullDate: p.priceDate,
    }));

  const times = chartData.map(d => d.time);
  const dataMin = Math.min(...times);
  const dataMax = Math.max(...times);
  const totalRange = dataMax - dataMin || 1;

  const padding = totalRange * 0.1;
  const extendedMin = dataMin - padding;
  const extendedMax = dataMax + padding;
  const extendedRange = extendedMax - extendedMin;

  const prices_list = chartData.map(d => d.price);
  const minPrice = Math.min(...prices_list);
  const maxPrice = Math.max(...prices_list);
  const priceRange = maxPrice - minPrice || 1;
  const yDomainMin = Math.floor((minPrice - priceRange * 0.2) * 100) / 100;
  const yDomainMax = Math.ceil((maxPrice + priceRange * 0.2) * 100) / 100;

  useEffect(() => {
    setZoomDomain(null);
  }, [prices]);

  useEffect(() => {
    const chartElement = chartContainerRef.current;
    if (!chartElement) return;

    const handleWheel = (e: WheelEvent) => {
      if (chartData.length < 2) return;
      e.preventDefault();
      e.stopPropagation();

      const rect = chartElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = rect.width;

      setZoomDomain(prev => {
        const currentDomain = prev || { start: extendedMin, end: extendedMax };
        const currentRange = currentDomain.end - currentDomain.start;
        const mousePosition = currentDomain.start + (mouseX / containerWidth) * currentRange;
        const zoomFactor = e.deltaY > 0 ? 1.2 : 0.8;
        const newRange = currentRange * zoomFactor;
        const MIN_RANGE = 60000;
        const MAX_RANGE = extendedRange * 3;
        
        if (newRange < MIN_RANGE || newRange > MAX_RANGE) return prev;
        
        const ratio = (mousePosition - currentDomain.start) / currentRange;
        const newStart = mousePosition - newRange * ratio;
        const newEnd = mousePosition + newRange * (1 - ratio);
        
        if (newRange >= extendedRange * 1.2) return null;
        
        return { start: newStart, end: newEnd };
      });
    };

    chartElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => chartElement.removeEventListener('wheel', handleWheel);
  }, [chartData, extendedMin, extendedMax, extendedRange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart(e.clientX);
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = panStart - e.clientX;
    setPanStart(e.clientX);
    
    setZoomDomain(prev => {
      const currentDomain = prev || { start: extendedMin, end: extendedMax };
      const currentRange = currentDomain.end - currentDomain.start;
      const chartWidth = chartContainerRef.current?.offsetWidth || 530;
      const shift = (deltaX / chartWidth) * currentRange;
      
      const newStart = currentDomain.start + shift;
      const newEnd = currentDomain.end + shift;
      
      if (newStart < extendedMin - extendedRange * 0.5 && newEnd > extendedMax + extendedRange * 0.5) {
        return prev;
      }
      
      if (Math.abs(newEnd - newStart - extendedRange) < 1000 && 
          Math.abs(newStart - extendedMin) < 1000) {
        return null;
      }
      
      return { start: newStart, end: newEnd };
    });
  }, [isPanning, panStart, extendedMin, extendedMax, extendedRange]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const handleGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isPanning]);

  const handleDoubleClick = () => {
    setZoomDomain(null);
  };

  const getTickCount = () => {
    const chartWidth = chartContainerRef.current?.offsetWidth || 530;
    return Math.max(2, Math.min(12, Math.floor(chartWidth / 60)));
  };

  const generateTicks = () => {
    const currentDomain = zoomDomain || { start: extendedMin, end: extendedMax };
    const range = currentDomain.end - currentDomain.start;
    const tickCount = getTickCount();
    const interval = range / (tickCount - 1);
    
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      ticks.push(currentDomain.start + interval * i);
    }
    return ticks;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = new Date(payload[0].payload.time);
      return (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: '8px 12px', border: '1px solid #E5ECF5', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#2D4059' }}>
            {d.toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <br />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#666EFE' }}>
            {Number(payload[0].value).toFixed(2)} ₽
          </span>
        </div>
      );
    }
    return null;
  };

  const getDynamicsIcon = (change: number | null) => {
    if (change === null || change === 0) return <img src={IconRavno} alt="=" style={{ width: 22, height: 4 }} />;
    if (change > 0) return <img src={IconUp} alt="▲" style={{ width: 44, height: 15 }} />;
    return <img src={IconDown} alt="▼" style={{ width: 44, height: 15 }} />;
  };

  const blockStyle: React.CSSProperties = { backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)' };
  const smallButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 };
  const cs: React.CSSProperties = { position: 'absolute', top: 164, left: 30, right: 30, bottom: 111 };

  const TABLE_WIDTH = 1054;
  const TABLE_HEIGHT = 464;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 7;

  const COL_DATE = 50;
  const COL_DYNAMICS = 314;
  const COL_PRICE = 538;
  const COL_SUPPLIER = 802;

  const checkScroll = () => {
    const c = scrollContainerRef.current;
    if (c) setHasScroll(c.scrollHeight > c.clientHeight);
  };

  useEffect(() => { const t = setTimeout(checkScroll, 100); return () => clearTimeout(t); }, [sortedPrices]);
  useEffect(() => {
    const c = scrollContainerRef.current;
    if (!c) return;
    checkScroll();
    c.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(c);
    return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const h = () => setContextMenu(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [contextMenu]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const toggleSelect = (priceUid: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => { const next = new Set(prev); if (next.has(priceUid)) next.delete(priceUid); else next.add(priceUid); return next; });
    } else if (e.shiftKey && lastSelectedId) {
      const allIds = sortedPrices.map(p => p.uid);
      const lastIdx = allIds.indexOf(lastSelectedId);
      const currentIdx = allIds.indexOf(priceUid);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastIdx, currentIdx); const end = Math.max(lastIdx, currentIdx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => { const next = new Set(prev); rangeIds.forEach(id => next.add(id)); return next; });
      }
    } else {
      if (selectedIds.has(priceUid) && selectedIds.size === 1) setSelectedIds(new Set());
      else setSelectedIds(new Set([priceUid]));
    }
    setLastSelectedId(priceUid);
  };

  const handleDeleteSelected = () => { if (selectedIds.size === 0) return; setShowDeleteConfirm(true); };
  const confirmDeleteSelected = async () => {
    try { for (const priceUid of selectedIds) { handleDeletePrice(priceUid); } setSelectedIds(new Set()); setShowDeleteConfirm(false); }
    catch (e) { console.error(e); }
  };

  const handleContextMenu = (e: React.MouseEvent, priceUid: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedIds.has(priceUid)) setSelectedIds(new Set([priceUid]));
    setContextMenu({ x: e.clientX, y: e.clientY, priceUid });
  };

  const handleContextEdit = () => {
    if (!contextMenu) return;
    const price = sortedPrices.find(p => p.uid === contextMenu.priceUid);
    if (!price) return;
    setEditingPriceUid(price.uid); setEditPrice(price.price.toString());
    setEditPriceDate(price.priceDate ? new Date(price.priceDate).toISOString().slice(0, 16) : '');
    setEditPriceSupplierUid(''); setShowEditPopup(true); setContextMenu(null);
  };

  const handleContextDelete = () => {
    if (!contextMenu) return;
    if (!confirm('Удалить запись цены?')) { setContextMenu(null); return; }
    const uidsToDelete = selectedIds.has(contextMenu.priceUid) ? selectedIds : new Set([contextMenu.priceUid]);
    uidsToDelete.forEach(uid => handleDeletePrice(uid));
    setSelectedIds(new Set()); setContextMenu(null);
  };

  const handleEditSubmit = async () => {
    if (!uid || !editingPriceUid || !editPrice) return;
    try {
      await AxiosService.delete(ConstantInfo.restApiNomenclatureDeletePrice(editingPriceUid));
      await AxiosService.post(ConstantInfo.restApiNomenclaturePrices(uid), { price: parseFloat(editPrice), priceDate: editPriceDate, supplierUid: editPriceSupplierUid || null });
      window.dispatchEvent(new CustomEvent('refreshPrices'));
      setShowEditPopup(false); setEditingPriceUid('');
    } catch (e) { console.error(e); }
  };

  const totalRows = Math.max(sortedPrices.length, VISIBLE_ROWS);
  const getRowSeparator = (index: number, isRealData: boolean): React.CSSProperties => {
    if (!isRealData) return { borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' };
    const isFirst = index === 0; const isLast = index === sortedPrices.length - 1;
    return { borderTop: isFirst ? 'none' : '0.5px solid #E5ECF5', borderBottom: isLast ? 'none' : '0.5px solid #E5ECF5' };
  };

  const contextMenuButtonStyle: React.CSSProperties = { width: 174, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' };
  
  const domainX = zoomDomain ? [zoomDomain.start, zoomDomain.end] : [extendedMin, extendedMax];
  const customTicks = generateTicks();

  return (
    <div style={cs}>
      <div style={{ ...blockStyle, width: 1740, height: 565, position: 'relative' }}>
        <div 
          ref={chartContainerRef}
          style={{ 
            position: 'absolute', 
            bottom: 156, 
            left: 50, 
            width: 530, 
            height: 280, 
            cursor: isPanning ? 'grabbing' : 'grab',
            userSelect: 'none'
          }} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#666EFE" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#666EFE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#E5ECF5" 
                  vertical={false}
                  horizontal={true}
                  strokeWidth={1}
                />
                <XAxis 
                  dataKey="time" 
                  type="number" 
                  domain={domainX}
                  ticks={customTicks}
                  tick={(tickProps) => (
                    <CustomTick 
                      {...tickProps} 
                      zoomDomain={zoomDomain}
                      extendedRange={extendedRange}
                    />
                  )}
                  axisLine={{ stroke: '#E5ECF5', strokeWidth: 1 }} 
                  tickLine={false}
                  allowDataOverflow={true}
                  interval={0}
                  height={55}
                />
                <YAxis 
                  hide 
                  domain={[yDomainMin, yDomainMax]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#666EFE" 
                  strokeWidth={2}
                  fill="url(#colorPrice)" 
                  fillOpacity={1}
                  dot={{ r: 4, fill: '#666EFE', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#666EFE', stroke: '#FFFFFF', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#9CA3AF' }}>Нет данных о ценах</span>
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', top: 14, right: 40, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 8, paddingLeft: 0, justifyContent: 'flex-start' }}>
            <button style={smallButtonStyle} onClick={handleDoubleClick} title="Сбросить зум">
              <img src={Button1} alt="" style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={() => setShowAddPricePopup(true)} style={smallButtonStyle}>
              <img src={Button4} alt="" style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={handleDeleteSelected} style={{ ...smallButtonStyle, opacity: selectedIds.size > 0 ? 1 : 0.5, cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed' }}>
              <img src={Button5} alt="" style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', position: 'relative', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DATE }}>ДАТА</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_DYNAMICS }}>ДИНАМИКА</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_PRICE }}>ЦЕНА С НДС РУБ.</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', position: 'absolute', left: COL_SUPPLIER }}>ПОСТАВЩИК</span>
              </div>
              <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div style={{ minWidth: TABLE_WIDTH }}>
                  {Array.from({ length: totalRows }).map((_, index) => {
                    const price = sortedPrices[index]; const isRealData = !!price; const isSelected = price && selectedIds.has(price.uid);
                    if (!isRealData) return (<div key={`empty-${index}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} />);
                    const prev = sortedPrices[index + 1]?.price ?? null;
                    const change = prev !== null ? price.price - prev : null;
                    return (
                      <div key={price.uid} onClick={(e) => toggleSelect(price.uid, e)} onContextMenu={(e) => handleContextMenu(e, price.uid)} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: isSelected ? '#DEEEFF' : '#FFFFFF', position: 'relative', boxSizing: 'border-box', cursor: 'pointer', userSelect: 'none', ...getRowSeparator(index, true) }}>
                        <span style={{ position: 'absolute', left: COL_DATE, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_DYNAMICS - COL_DATE - 20 }}>{formatDate(price.priceDate)}</span>
                        <span style={{ position: 'absolute', left: COL_DYNAMICS, display: 'flex', alignItems: 'center', width: COL_PRICE - COL_DYNAMICS - 20 }}>{getDynamicsIcon(change)}</span>
                        <span style={{ position: 'absolute', left: COL_PRICE, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: COL_SUPPLIER - COL_PRICE - 20 }}>{price.price.toFixed(2)} ₽</span>
                        <span style={{ position: 'absolute', left: COL_SUPPLIER, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: TABLE_WIDTH - COL_SUPPLIER - 40 }}>{price.supplierName || '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {hasScroll && (<div style={{ width: 10, height: TABLE_HEIGHT, paddingTop: HEADER_HEIGHT }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>)}
          </div>
        </div>
      </div>

      {contextMenu && (<div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}><button style={contextMenuButtonStyle} onClick={handleContextEdit}>Редактировать</button><button style={contextMenuButtonStyle} onClick={handleContextDelete}>Удалить</button></div>)}

      {showAddPricePopup && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddPricePopup(false)}><div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Добавить цену</h3><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Цена</label><input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Введите цену" style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Дата</label><input type="datetime-local" value={newPriceDate} onChange={e => setNewPriceDate(e.target.value)} style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Поставщик</label><select value={newPriceSupplierUid} onChange={e => setNewPriceSupplierUid(e.target.value)} style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}><option value="">Без поставщика</option>{suppliers.map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)}</select></div><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={handleAddPrice} disabled={!newPrice} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: newPrice ? '#666EFE' : '#BCC8FF', cursor: newPrice ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Добавить</button><button onClick={() => setShowAddPricePopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}

      {showEditPopup && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditPopup(false)}><div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Редактировать цену</h3><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Цена</label><input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Введите цену" style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Дата</label><input type="datetime-local" value={editPriceDate} onChange={e => setEditPriceDate(e.target.value)} style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }} /></div><div><label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', display: 'block', marginBottom: 7 }}>Поставщик</label><select value={editPriceSupplierUid} onChange={e => setEditPriceSupplierUid(e.target.value)} style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', paddingLeft: 12, paddingRight: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#2D4059', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}><option value="">Без поставщика</option>{suppliers.map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)}</select></div><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={handleEditSubmit} disabled={!editPrice} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: editPrice ? '#666EFE' : '#BCC8FF', cursor: editPrice ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Сохранить</button><button onClick={() => setShowEditPopup(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}

      {showDeleteConfirm && (<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(false)}><div style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}><h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 500, color: '#2D4059', margin: 0, textAlign: 'center' }}>Подтверждение удаления</h3><p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', margin: 0, textAlign: 'center' }}>Вы уверены, что хотите удалить выбранные элементы?</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={confirmDeleteSelected} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: 'none', backgroundColor: '#FF3052', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Удалить</button><button onClick={() => setShowDeleteConfirm(false)} style={{ height: 44, paddingLeft: 24, paddingRight: 24, borderRadius: 10, border: '1px solid rgba(102,110,254,0.15)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' }}>Отмена</button></div></div></div>)}
    </div>
  );
};

export default PriceHistoryTab;