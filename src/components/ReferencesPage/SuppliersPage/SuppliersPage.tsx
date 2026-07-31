// SuppliersPage.tsx — исправлен handleContextOpen
import React, { useRef, useState, useEffect } from 'react';
import { useTabs } from '../../../context/TabContext';
import CustomScrollbar from '../../../components/CustomScrollbar';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import Icon1 from '../../../assets/References/Icon1.svg';
import Icon2 from '../../../assets/References/Icon2.svg';
import Icon3 from '../../../assets/References/Icon3.svg';
import Icon4 from '../../../assets/References/Icon4.svg';
import Icon7 from '../../../assets/References/Icon7.svg';
import Icon8 from '../../../assets/References/Icon8.svg';
import Icon9 from '../../../assets/References/Icon9.svg';
import Icon10 from '../../../assets/References/Icon10.svg';
import Icon20 from '../../../assets/References/Icon20.svg';
import Icon22 from '../../../assets/References/Icon22.svg';
import Icon24 from '../../../assets/References/Icon24.svg';
import Icon25 from '../../../assets/References/Icon25.svg';
import Popup10 from '../../../assets/References/popup10.svg';

interface SupplierItem {
  uid: string;
  name: string;
  code?: number;
}

const SuppliersPage = () => {
  const { activeTabId, openTab } = useTabs();
  const tabIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [data, setData] = useState<SupplierItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; uid: string; name: string } | null>(null);

  const TABLE_WIDTH = 1720;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 10;
  const TABLE_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS + HEADER_HEIGHT;

  useEffect(() => { tabIdRef.current = activeTabId; }, []);

  const fetchData = async () => {
    try { const r = await AxiosService.get(ConstantInfo.restApiSuppliersList); setData(r.data || []); }
    catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeTabId && activeTabId === tabIdRef.current && data.length > 0) fetchData(); }, [activeTabId]);
  useEffect(() => { if (!contextMenu) return; const h = () => setContextMenu(null); document.addEventListener('click', h); return () => document.removeEventListener('click', h); }, [contextMenu]);

  const checkScroll = () => { const c = scrollContainerRef.current; if (!c) return; setHasVerticalScroll(c.scrollHeight > c.clientHeight); setHasHorizontalScroll(c.scrollWidth > c.clientWidth); };
  useEffect(() => { const t = setTimeout(checkScroll, 350); return () => clearTimeout(t); }, [data]);
  useEffect(() => { const c = scrollContainerRef.current; if (!c) return; checkScroll(); c.addEventListener('scroll', checkScroll); const ro = new ResizeObserver(checkScroll); ro.observe(c); return () => { c.removeEventListener('scroll', checkScroll); ro.disconnect(); }; }, []);

  const handleContextMenu = (e: React.MouseEvent, uid: string, name: string) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, uid, name }); };
  const handleContextOpen = () => { if (!contextMenu) return; const { uid, name } = contextMenu; setContextMenu(null); openTab(`/references/suppliers/edit/${uid}`, name, null); };

  const emptyRows = Math.max(0, VISIBLE_ROWS - data.length);
  const mutedButtonStyle: React.CSSProperties = { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };
  const mutedMediumButtonStyle: React.CSSProperties = { height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)', cursor: 'default', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0, opacity: 0.4 };
  const EmptySquare = () => (<div style={{ width: 18, height: 18, borderRadius: 2, border: '2px solid #2D4059', opacity: 0.3, flexShrink: 0, boxSizing: 'border-box', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />);
  const contextMenuButtonStyle: React.CSSProperties = { height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059' };
  const contextMenuMutedStyle: React.CSSProperties = { ...contextMenuButtonStyle, opacity: 0.4, cursor: 'default' };

  if (isLoading) return (<div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#9CA3AF' }}>Загрузка...</span></div>);

  return (
    <div style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFC' }}>
      <div style={{ position: 'absolute', top: 35, left: 60 }}><h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>Справочник: Поставщики</h1></div>
      <div style={{ position: 'absolute', top: 99, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <button style={mutedButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ position: 'absolute', left: 586, display: 'flex', gap: 15 }}>
          <button style={{ ...mutedMediumButtonStyle, width: 124 }}><img src={Icon4} alt="" style={{ width: 16, height: 16, marginLeft: 12 }} /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: '#2D4059', marginLeft: 15 }}>Создать</span></button>
          <button style={mutedButtonStyle}><img src={Icon7} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
          <button style={mutedButtonStyle}><img src={Icon8} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon9} alt="" style={{ width: 14, height: 18 }} /></button>
          <button style={mutedButtonStyle}><img src={Icon10} alt="" style={{ width: 18, height: 16 }} /></button>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 154, left: 40 }}>
        <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 40, position: 'relative' }}><EmptySquare /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', marginLeft: 47 }}>НАИМЕНОВАНИЕ</span></div>
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {data.map(item => (<div key={item.uid} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', cursor: 'pointer', position: 'relative', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }} onContextMenu={(e) => handleContextMenu(e, item.uid, item.name)}><div style={{ paddingLeft: 20, display: 'flex', alignItems: 'center' }}><EmptySquare /></div><img src={Popup10} alt="" style={{ width: 20, height: 20, flexShrink: 0, marginLeft: 19 }} /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', marginLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span></div>))}
            {Array.from({ length: emptyRows }).map((_, i) => (<div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 20, borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }}><EmptySquare /></div>))}
          </div>
        </div>
        {hasVerticalScroll && (<div style={{ position: 'absolute', right: -25, top: HEADER_HEIGHT, height: TABLE_HEIGHT - HEADER_HEIGHT, width: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>)}
        {hasHorizontalScroll && (<div style={{ position: 'absolute', bottom: -21, left: 0, width: TABLE_WIDTH, height: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="horizontal" trackSize={TABLE_WIDTH} /></div>)}
      </div>
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 174, backgroundColor: '#FFFFFF', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10001, display: 'flex', flexDirection: 'column', padding: '8px 0' }} onClick={e => e.stopPropagation()}>
          <button style={contextMenuButtonStyle} onClick={handleContextOpen}>
            <img src={Icon20} alt="" style={{ width: 18, height: 18, marginRight: 16 }} />
            Открыть
          </button>
          <button style={contextMenuMutedStyle}>
            <img src={Icon22} alt="" style={{ width: 16, height: 14, marginRight: 17, opacity: 0.4 }} />
            Переместить
          </button>
          <button style={contextMenuMutedStyle}>
            <img src={Icon24} alt="" style={{ width: 16, height: 16, marginRight: 17, opacity: 0.4 }} />
            Скопировать
          </button>
          <button style={contextMenuMutedStyle}>
            <img src={Icon25} alt="" style={{ width: 18, height: 18, marginRight: 16, opacity: 0.4 }} />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;