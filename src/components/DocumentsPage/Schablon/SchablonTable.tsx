// SchablonTable.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useRef, useCallback, useEffect } from 'react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import SchablonTableCell from './SchablonTableCell';

interface TableRow {
  id: number;
  name: string;
  isMerged: boolean;
  mergeCount: number;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  modelCellIds: string[];
}

interface ModelCell {
  id: string;
  column?: number;
  row?: number;
  drum?: number;
}

interface ConfigCell {
  id: string;
  modelCellIds: string[];
  deleted?: boolean;
}

interface SchablonTableProps {
  isMultiSelect: boolean;
  onEnableMultiSelect: () => void;
  onSelectionChange: (selectedIds: Set<number>) => void;
  totalRows: number;
  totalColumns: number;
  totalDrums: number;
  cellType: 'postamat' | 'drum';
  selectedDrum: number;
  onDrumChange: (drum: number) => void;
  onCellDoubleClick: (id: number, column: number, selectedIds: Set<number>) => void;
  isBlurred: boolean;
  modelCells: ModelCell[];
  configCells: ConfigCell[];
}

const SchablonTable: React.FC<SchablonTableProps> = ({ 
  isMultiSelect, onEnableMultiSelect, onSelectionChange, 
  totalRows, totalColumns, totalDrums, cellType,
  selectedDrum, onDrumChange, onCellDoubleClick, isBlurred,
  modelCells, configCells
}) => {
  const [selectedColumn, setSelectedColumn] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationHighlight, setAnimationHighlight] = useState<number | null>(null);
  const [selectedCellIds, setSelectedCellIds] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cellRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());

  const TABLE_HEIGHT = 560;
  const HEADER_HEIGHT = 80;
  const ROW_HEIGHT = 80;
  const VISIBLE_ROWS = 6;

  const modelCellToConfigMap = new Map<string, ConfigCell>();
  configCells.forEach(cc => cc.modelCellIds.forEach(mid => modelCellToConfigMap.set(mid, cc)));

  const displayModelCells = cellType === 'drum' 
    ? modelCells.filter(c => c.drum === selectedDrum)
    : modelCells;

  const activeConfigCells = configCells.filter(cc => !cc.deleted);

  // Строим маппинг объединённых колонок (целиком)
  const mergedColumns = new Map<number, { colStart: number; colEnd: number }>();
  
  activeConfigCells.forEach(cc => {
    const cols = [...new Set(cc.modelCellIds
      .map(mid => displayModelCells.find(mc => mc.id === mid))
      .filter((mc): mc is ModelCell => mc !== undefined)
      .map(mc => mc.column!)
      .filter(c => c !== undefined)
    )].sort((a, b) => a - b);
    
    if (cols.length > 1) {
      const colStart = cols[0];
      const colEnd = cols[cols.length - 1];
      for (let c = colStart; c <= colEnd; c++) {
        mergedColumns.set(c, { colStart, colEnd });
      }
    }
  });

  // Строим список колонок для хидера с учётом объединений
  const headerColumns: { label: string; key: number; originalCol: number }[] = [];
  for (let i = 1; i <= totalColumns; i++) {
    const merged = mergedColumns.get(i);
    if (merged) {
      if (i === merged.colStart) {
        headerColumns.push({ label: `${merged.colStart}-${merged.colEnd}`, key: merged.colStart, originalCol: i });
      }
    } else {
      headerColumns.push({ label: String(i), key: i, originalCol: i });
    }
  }

  // Группируем строки по configCell
  const configCellRows = new Map<string, { rowStart: number; rowEnd: number; colStart: number; colEnd: number; isMerged: boolean; mergeCount: number; modelCellIds: string[] }>();
  
  activeConfigCells.forEach(cc => {
    const relatedModelCells = cc.modelCellIds
      .map(mid => displayModelCells.find(mc => mc.id === mid))
      .filter((mc): mc is ModelCell => mc !== undefined);
    
    const cols = [...new Set(relatedModelCells.map(mc => mc.column!).filter(c => c !== undefined))].sort((a, b) => a - b);
    const colStart = cols[0] || 1;
    const colEnd = cols[cols.length - 1] || 1;
    
    // Находим modelCells для выбранной колонки
    const columnCells = relatedModelCells.filter(mc => mc.column === selectedColumn);
    
    if (columnCells.length > 0) {
      const rows = columnCells.map(mc => mc.row!).sort((a, b) => a - b);
      const minRow = rows[0];
      const maxRow = rows[rows.length - 1];
      
      configCellRows.set(cc.id, {
        rowStart: minRow,
        rowEnd: maxRow,
        colStart,
        colEnd,
        isMerged: cc.modelCellIds.length > 1,
        mergeCount: cc.modelCellIds.length,
        modelCellIds: cc.modelCellIds
      });
    }
  });

  // Сортируем по rowStart
  const rows: TableRow[] = [...configCellRows.values()]
    .sort((a, b) => a.rowStart - b.rowStart)
    .map(r => ({ 
      id: r.rowStart, 
      name: `Ячейка ${r.rowStart}`, 
      isMerged: r.isMerged, 
      mergeCount: r.mergeCount,
      rowStart: r.rowStart,
      rowEnd: r.rowEnd,
      colStart: r.colStart,
      colEnd: r.colEnd,
      modelCellIds: r.modelCellIds
    }));

  const emptyRows = Math.max(0, VISIBLE_ROWS - rows.length);

  useEffect(() => {
    onSelectionChange(selectedCellIds);
  }, [selectedCellIds, onSelectionChange]);

  const prevMultiSelect = useRef(isMultiSelect);
  useEffect(() => {
    if (prevMultiSelect.current && !isMultiSelect) {
      setSelectedCellIds(new Set());
    }
    prevMultiSelect.current = isMultiSelect;
  }, [isMultiSelect]);

  const scrollToCell = (id: number) => {
    const cellElement = cellRefsMap.current.get(id);
    const container = scrollContainerRef.current;
    if (!cellElement || !container) return;
    const containerRect = container.getBoundingClientRect();
    const cellRect = cellElement.getBoundingClientRect();
    if (cellRect.top < containerRect.top) {
      container.scrollTop -= (containerRect.top - cellRect.top);
    } else if (cellRect.bottom > containerRect.bottom) {
      container.scrollTop += (cellRect.bottom - containerRect.bottom);
    }
  };

  const handleSelect = (id: number, ctrlKey: boolean) => {
    if (isMultiSelect || ctrlKey) {
      if (ctrlKey && !isMultiSelect) onEnableMultiSelect();
      setSelectedCellIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      return;
    }
    setSelectedCellIds(prev => {
      if (prev.has(id) && prev.size === 1) return new Set();
      return new Set([id]);
    });
  };

  const handleDoubleClick = (id: number) => {
    setSelectedCellIds(prev => {
      const next = isMultiSelect ? new Set(prev) : new Set<number>();
      next.add(id);
      onCellDoubleClick(id, selectedColumn, next);
      return next;
    });
  };

  const setCellRef = (id: number, element: HTMLDivElement | null) => {
    if (element) cellRefsMap.current.set(id, element);
    else cellRefsMap.current.delete(id);
  };

  useEffect(() => {
    if (isMultiSelect) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCellIds(prev => {
          const currentId = prev.values().next().value || null;
          let newId: number;
          if (currentId === null) {
            newId = rows[0]?.id || 1;
          } else {
            const currentIndex = rows.findIndex(r => r.id === currentId);
            if (e.key === 'ArrowUp') {
              newId = rows[Math.max(0, currentIndex - 1)]?.id || currentId;
            } else {
              newId = rows[Math.min(rows.length - 1, currentIndex + 1)]?.id || currentId;
            }
          }
          setTimeout(() => scrollToCell(newId), 0);
          return new Set([newId]);
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMultiSelect, rows]);

  const handleColumnClick = useCallback((targetCol: number) => {
    if (isAnimating || targetCol === selectedColumn) {
      setSelectedColumn(targetCol);
      return;
    }
    setIsAnimating(true);
    const start = selectedColumn;
    const end = targetCol;
    const step = start < end ? 1 : -1;
    let current = start;
    const animate = () => {
      current += step;
      setAnimationHighlight(current);
      if (current === end) {
        animationTimerRef.current = setTimeout(() => {
          setSelectedColumn(end);
          setAnimationHighlight(null);
          setIsAnimating(false);
        }, 50);
      } else {
        animationTimerRef.current = setTimeout(animate, 50);
      }
    };
    animate();
    return () => { if (animationTimerRef.current) clearTimeout(animationTimerRef.current); };
  }, [isAnimating, selectedColumn]);

  useEffect(() => { return () => { if (animationTimerRef.current) clearTimeout(animationTimerRef.current); }; }, []);

  const trackHeight = TABLE_HEIGHT - HEADER_HEIGHT;

  const DRUM_BUTTON_WIDTH = 144;
  const DRUM_GAP = 40;
  const DRUM_LEFT_OFFSET = 30;
  const TEXT_HEIGHT = 17;
  const TEXT_TO_LINE = 7;
  const LINE_THICKNESS = 3;
  const TEXT_TOP = 30;
  const COLUMN_BLOCK_SIZE = 35;
  const COLUMN_LINE_WIDTH = 29;
  const COLUMN_GAP = 14;
  const COLUMNS_LABEL_LEFT = totalDrums > 1 ? 405 : 0;
  const LINE_TOP = TEXT_TOP + TEXT_HEIGHT + TEXT_TO_LINE;
  const LINE_BOTTOM = HEADER_HEIGHT - LINE_TOP - LINE_THICKNESS;

  const getColumnColor = (col: number) => {
    if (animationHighlight === col) return '#2D4059';
    if (isAnimating) return 'rgba(45, 64, 89, 0.6)';
    return selectedColumn === col ? '#2D4059' : 'rgba(45, 64, 89, 0.6)';
  };

  const getColumnLineColor = (col: number) => {
    if (animationHighlight === col) return '#666EFE';
    if (isAnimating) return 'rgba(45, 64, 89, 0.06)';
    return selectedColumn === col ? '#666EFE' : 'rgba(45, 64, 89, 0.06)';
  };

  const handleDrumClick = (drum: number) => {
    if (drum === selectedDrum) return;
    onDrumChange(drum);
    setSelectedCellIds(new Set());
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', height: `${TABLE_HEIGHT}px` }}>
      <div style={{ width: '1183px', height: `${TABLE_HEIGHT}px`, backgroundColor: '#F3F4F6', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative', filter: isBlurred ? 'blur(2px)' : 'none', transition: 'filter 0.3s ease', pointerEvents: isBlurred ? 'none' : 'auto' }}>
        <div style={{ height: `${HEADER_HEIGHT}px`, minHeight: `${HEADER_HEIGHT}px`, backgroundColor: '#FFFFFF', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: '1px solid #E5E7EB', position: 'relative', display: 'flex', alignItems: 'stretch' }}>
          {totalDrums > 1 && (
            <div style={{ position: 'relative', width: `${COLUMNS_LABEL_LEFT}px`, height: '100%', flexShrink: 0 }}>
              {Array.from({ length: totalDrums }, (_, i) => i + 1).map((drum) => (
                <React.Fragment key={drum}>
                  <button onClick={() => handleDrumClick(drum)} style={{ position: 'absolute', left: `${DRUM_LEFT_OFFSET + (drum - 1) * (DRUM_BUTTON_WIDTH + DRUM_GAP)}px`, top: `${TEXT_TOP}px`, width: `${DRUM_BUTTON_WIDTH}px`, height: `${TEXT_HEIGHT}px`, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', letterSpacing: '1px', color: selectedDrum === drum ? '#666EFE' : 'rgba(45, 64, 89, 0.6)', textAlign: 'center', lineHeight: `${TEXT_HEIGHT}px`, transition: 'color 0.3s ease' }}>Барабан {drum}</button>
                  <div style={{ position: 'absolute', top: `${LINE_TOP}px`, left: `${DRUM_LEFT_OFFSET + (drum - 1) * (DRUM_BUTTON_WIDTH + DRUM_GAP)}px`, width: `${DRUM_BUTTON_WIDTH}px`, height: `${LINE_THICKNESS}px`, backgroundColor: selectedDrum === drum ? '#666EFE' : 'rgba(45, 64, 89, 0.06)', borderRadius: '1.5px', transition: 'background-color 0.3s ease' }} />
                </React.Fragment>
              ))}
            </div>
          )}

          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '1px', color: '#2D4059', whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'center', marginLeft: totalDrums > 1 ? '0px' : '30px' }}>Столбцы:</span>

          <div style={{ display: 'flex', gap: `${COLUMN_GAP}px`, height: '100%', position: 'relative', marginLeft: 'auto', marginRight: '30px' }}>
            {headerColumns.map((hc) => {
              const merged = mergedColumns.get(hc.originalCol);
              const blockWidth = merged && hc.originalCol === merged.colStart 
                ? COLUMN_BLOCK_SIZE * (merged.colEnd - merged.colStart + 1) + COLUMN_GAP * (merged.colEnd - merged.colStart)
                : COLUMN_BLOCK_SIZE;
              
              return (
                <div key={hc.key} style={{ width: `${blockWidth}px`, height: '100%', position: 'relative' }}>
                  <button
                    onClick={() => handleColumnClick(hc.originalCol)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '100%',
                      height: `${TEXT_HEIGHT}px`,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '13px',
                      letterSpacing: '1px',
                      color: getColumnColor(hc.originalCol),
                      lineHeight: `${TEXT_HEIGHT}px`,
                      textAlign: 'center',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {hc.label}
                  </button>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: `${LINE_BOTTOM}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: `${merged ? COLUMN_LINE_WIDTH * (merged.colEnd - merged.colStart + 1) + COLUMN_GAP * (merged.colEnd - merged.colStart) : COLUMN_LINE_WIDTH}px`,
                      height: `${LINE_THICKNESS}px`,
                      backgroundColor: getColumnLineColor(hc.originalCol),
                      borderRadius: '1.5px',
                      transition: 'background-color 0.15s ease',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {rows.map((row) => (
            <SchablonTableCell
              key={row.id}
              row={row}
              isSelected={selectedCellIds.has(row.id)}
              isMultiSelect={isMultiSelect}
              selectedColumn={selectedColumn}
              isMerged={row.isMerged}
              mergeCount={row.mergeCount}
              rowStart={row.rowStart}
              rowEnd={row.rowEnd}
              colStart={row.colStart}
              colEnd={row.colEnd}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              setRef={setCellRef}
            />
          ))}
          {Array.from({ length: emptyRows }).map((_, i) => (
            <div key={`empty-${i}`} style={{ height: `${ROW_HEIGHT}px`, backgroundColor: '#FFFFFF', boxSizing: 'border-box', borderTop: '0.5px solid #E5E7EB', borderBottom: '0.5px solid #E5E7EB' }} />
          ))}
        </div>
      </div>

      <div style={{ marginLeft: '15px', marginTop: `${HEADER_HEIGHT}px` }}>
        <CustomScrollbar scrollContainerRef={scrollContainerRef} orientation="vertical" trackSize={trackHeight} />
      </div>
    </div>
  );
};

export default SchablonTable;