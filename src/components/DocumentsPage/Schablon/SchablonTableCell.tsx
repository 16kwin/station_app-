// SchablonTableCell.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState } from 'react';

interface TableRow {
  id: number;
  name: string;
}

interface SchablonTableCellProps {
  row: TableRow;
  isSelected: boolean;
  isMultiSelect: boolean;
  selectedColumn: number;
  isMerged: boolean;
  mergeCount: number;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  onSelect: (id: number, ctrlKey: boolean) => void;
  onDoubleClick: (id: number) => void;
  setRef: (id: number, element: HTMLDivElement | null) => void;
}

const SchablonTableCell: React.FC<SchablonTableCellProps> = ({
  row,
  isSelected,
  isMultiSelect,
  selectedColumn,
  isMerged,
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  onSelect,
  onDoubleClick,
  setRef,
}) => {
  const stripeColor = isMultiSelect ? '#07E098' : '#666EFE';
  const [isHovered, setIsHovered] = useState(false);

  // Формируем номер ячейки
  let cellNumber: string;
  if (colStart !== colEnd && rowStart !== rowEnd) {
    cellNumber = `${colStart}-${colEnd}-${rowStart}-${rowEnd}`;
  } else if (colStart !== colEnd) {
    cellNumber = `${colStart}-${colEnd}-${rowStart}`;
  } else if (rowStart !== rowEnd) {
    cellNumber = `${colStart}-${rowStart}-${rowEnd}`;
  } else {
    cellNumber = `${colStart}-${rowStart}`;
  }
    
  const nomenclature = `Номенклатура ${row.id}`;
  const quantity = Math.floor(Math.random() * 100) + 1;
  const purposes = ['ТМЦ', 'СГД', 'ОК'][row.id % 3];

  const backgroundColor = isHovered ? '#F5FAFF' : '#FFFFFF';

  return (
    <div
      ref={(el) => setRef(row.id, el)}
      onClick={(e) => onSelect(row.id, e.ctrlKey || e.metaKey)}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(row.id); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: '80px',
        backgroundColor,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        transition: 'background-color 0.2s ease',
      }}
    >
      {isSelected && (
        <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '5px', height: '54px', backgroundColor: stripeColor, borderRadius: '0 5px 5px 0', zIndex: 1 }} />
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: '#E5E7EB' }} />

      <div style={{ paddingTop: '11px', height: '100%', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingLeft: '30px', paddingRight: '50px' }}>
          <div style={{ width: '165px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'rgba(45, 64, 89, 0.5)', height: '16px', lineHeight: '16px' }}>Номер ячейки</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#2D4059', height: '20px', lineHeight: '20px', marginTop: '4px' }}>{cellNumber}</div>
          </div>
          <div style={{ width: '615px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'rgba(45, 64, 89, 0.5)', height: '16px', lineHeight: '16px' }}>Номенклатура</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#2D4059', height: '20px', lineHeight: '20px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomenclature}</div>
          </div>
          <div style={{ width: '179px', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'rgba(45, 64, 89, 0.5)', height: '16px', lineHeight: '16px' }}>Количество</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#2D4059', height: '20px', lineHeight: '20px', marginTop: '4px' }}>{quantity}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'rgba(45, 64, 89, 0.5)', height: '16px', lineHeight: '16px' }}>Назначения</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '15px', color: '#2D4059', height: '20px', lineHeight: '20px', marginTop: '4px' }}>{purposes}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchablonTableCell;