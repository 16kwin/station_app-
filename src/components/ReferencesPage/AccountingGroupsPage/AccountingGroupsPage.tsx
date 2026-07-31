// AccountingGroupsPage.tsx — ПОЛНЫЙ ФАЙЛ (единый стиль)
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
import Icon19 from '../../../assets/References/Icon19.svg';
import Popup2 from '../../../assets/References/popup2.svg';

interface AccountingGroup {
  uid: string;
  typeName: string;
}

const AccountingGroupsPage = () => {
  const { activeTabId } = useTabs();
  const tabIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [data, setData] = useState<AccountingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const TABLE_WIDTH = 1720;
  const ROW_HEIGHT = 58;
  const HEADER_HEIGHT = 58;
  const VISIBLE_ROWS = 10;
  const TABLE_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS + HEADER_HEIGHT;

  useEffect(() => { tabIdRef.current = activeTabId; }, []);

  const fetchData = async () => {
    try {
      const response = await AxiosService.get(ConstantInfo.restApiNomenclatureTypeMaterials);
      setData(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (activeTabId && activeTabId === tabIdRef.current && data.length > 0) fetchData();
  }, [activeTabId]);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setHasVerticalScroll(container.scrollHeight > container.clientHeight);
    setHasHorizontalScroll(container.scrollWidth > container.clientWidth);
  };

  useEffect(() => { const timer = setTimeout(checkScroll, 350); return () => clearTimeout(timer); }, [data]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(container);
    return () => { container.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, []);

  const toggleSelectItem = (uid: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  const isAllSelected = data.length > 0 && data.every(item => selectedIds.has(item.uid));
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(item => item.uid)));
  };

  const emptyRows = Math.max(0, VISIBLE_ROWS - data.length);

  const smallButtonStyle: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFFFFF', border: '1px solid rgba(102, 110, 254, 0.15)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, flexShrink: 0,
  };

  const EmptySquare = ({ isSelected, onClick }: { isSelected: boolean; onClick: (e: React.MouseEvent) => void }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick(e); }} style={{ width: 18, height: 18, borderRadius: 2, border: isSelected ? 'none' : '2px solid #2D4059', opacity: isSelected ? 1 : 0.5, flexShrink: 0, boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isSelected && <img src={Icon19} alt="" style={{ width: 18, height: 18 }} />}
    </div>
  );

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
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color: '#2D4059', margin: 0, lineHeight: '29px' }}>Справочник: Группы учета</h1>
      </div>

      <div style={{ position: 'absolute', top: 99, left: 55, right: 55, height: 40, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Icon1} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon2} alt="" style={{ width: 20, height: 14 }} /></button>
          <button style={smallButtonStyle}><img src={Icon3} alt="" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
          <button style={smallButtonStyle}><img src={Icon8} alt="" style={{ width: 18, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon9} alt="" style={{ width: 14, height: 18 }} /></button>
          <button style={smallButtonStyle}><img src={Icon10} alt="" style={{ width: 18, height: 16 }} /></button>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 154, left: 40 }}>
        <div style={{ width: TABLE_WIDTH, height: TABLE_HEIGHT, backgroundColor: '#F5F6FA', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, backgroundColor: '#666EFE', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', alignItems: 'center', paddingLeft: 20, paddingRight: 40, position: 'relative' }}>
            <EmptySquare isSelected={isAllSelected} onClick={toggleSelectAll} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#FFFFFF', marginLeft: 47 }}>НАИМЕНОВАНИЕ</span>
          </div>
          <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {data.map(item => {
              const isSelected = selectedIds.has(item.uid);
              return (
                <div key={item.uid} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', backgroundColor: isSelected ? '#EDF6FF' : '#FFFFFF', cursor: 'pointer', position: 'relative', borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }}>
                  <div style={{ paddingLeft: 20, display: 'flex', alignItems: 'center' }}>
                    <EmptySquare isSelected={isSelected} onClick={() => toggleSelectItem(item.uid)} />
                  </div>
                  <img src={Popup2} alt="" style={{ width: 20, height: 20, flexShrink: 0, marginLeft: 19 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 400, color: '#2D4059', marginLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.typeName}</span>
                </div>
              );
            })}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: ROW_HEIGHT, backgroundColor: '#FFFFFF', boxSizing: 'border-box', display: 'flex', alignItems: 'center', paddingLeft: 20, borderTop: '0.5px solid #E5ECF5', borderBottom: '0.5px solid #E5ECF5' }}><EmptySquare isSelected={false} onClick={() => {}} /></div>
            ))}
          </div>
        </div>
        {hasVerticalScroll && (<div style={{ position: 'absolute', right: -25, top: HEADER_HEIGHT, height: TABLE_HEIGHT - HEADER_HEIGHT, width: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={TABLE_HEIGHT - HEADER_HEIGHT} /></div>)}
        {hasHorizontalScroll && (<div style={{ position: 'absolute', bottom: -21, left: 0, width: TABLE_WIDTH, height: 10 }}><CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="horizontal" trackSize={TABLE_WIDTH} /></div>)}
      </div>
    </div>
  );
};

export default AccountingGroupsPage;