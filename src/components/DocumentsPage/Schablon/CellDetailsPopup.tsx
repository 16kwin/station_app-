// CellDetailsPopup.tsx
import React from 'react';
import Schablon6 from '../../../assets/Schablon/Schablon6.svg';
import Schablon7 from '../../../assets/Schablon/Schablon7.svg';
import Schablon8 from '../../../assets/Schablon/Schablon8.svg';

interface CellDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cellId: number;
  cellName: string;
  selectedColumn: number;
  isMultiSelect: boolean;
  selectedCellIds: Set<number>;
}

const CellDetailsPopup: React.FC<CellDetailsPopupProps> = ({ isOpen, onClose, cellId, cellName, selectedColumn, isMultiSelect, selectedCellIds }) => {
  if (!isOpen) return null;

  let title: string;
  
  if (isMultiSelect && selectedCellIds.size > 0) {
    const cells: { col: number; row: number }[] = [];
    selectedCellIds.forEach(id => {
      cells.push({ col: selectedColumn, row: id });
    });
    
    cells.sort((a, b) => a.col !== b.col ? a.col - b.col : a.row - b.row);
    
    const groups: string[] = [];
    let i = 0;
    while (i < cells.length) {
      const start = cells[i];
      let end = start;
      let j = i + 1;
      
      while (j < cells.length && cells[j].col === start.col && cells[j].row === end.row + 1) {
        end = cells[j];
        j++;
      }
      
      const count = end.row - start.row + 1;
      if (count >= 3) {
        groups.push(`${start.col}-${start.row}--${end.col}-${end.row}`);
      } else {
        for (let k = i; k < j; k++) {
          groups.push(`${cells[k].col}-${cells[k].row}`);
        }
      }
      
      i = j;
    }
    
    title = `Выбранные ячейки ${groups.join(', ')}`;
  } else {
    title = `Выбранная ячейка ${selectedColumn}-${cellId}`;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div
        style={{
          width: '916px',
          height: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '16px',
              color: '#2D4059',
            }}
          >
            {title}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '328px',
            backgroundColor: '#E9EDFF',
            borderRadius: '1px',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '77px',
            left: '50%',
            marginLeft: '-68px',
            transform: 'translateX(-100%)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#2D4059',
              }}
            >
              Назначение ячеек
            </span>

            <div
              style={{
                width: '340px',
                height: '44px',
                backgroundColor: '#E9F2F9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '15px',
                marginTop: '11px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#6C7A8B',
                }}
              >
                В разработке
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#2D4059',
              }}
            >
              Номенклатура
            </span>

            <div
              style={{
                width: '340px',
                height: '44px',
                backgroundColor: '#E9F2F9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '15px',
                marginTop: '11px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#6C7A8B',
                }}
              >
                В разработке
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#2D4059',
              }}
            >
              Количество в ячейке
            </span>

            <div
              style={{
                width: '340px',
                height: '44px',
                backgroundColor: '#E9F2F9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '15px',
                marginTop: '11px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#6C7A8B',
                }}
              >
                В разработке
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '77px',
            left: '50%',
            marginLeft: '68px',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#2D4059',
              }}
            >
              Изображение:
            </span>

            <div
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#E9F2F9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#6C7A8B',
                marginTop: '11px',
              }}
            >
              В разработке
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#2D4059',
              }}
            >
              Код номенклатуры:
            </span>

            <div
              style={{
                width: '340px',
                height: '44px',
                backgroundColor: '#E9F2F9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '15px',
                marginTop: '11px',
              }}
            >
              <img src={Schablon7} alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#6C7A8B',
                  marginLeft: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                В разработке
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#2D4059',
              }}
            >
              Тип применения номенклатуры:
            </span>

            <div
              style={{
                width: '340px',
                height: '44px',
                backgroundColor: '#E9F2F9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '15px',
                marginTop: '11px',
              }}
            >
              <img src={Schablon8} alt="" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#6C7A8B',
                  marginLeft: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                В разработке
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '30px',
            bottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: '#2D4059',
            }}
          >
            Всего остаток на основном складе
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: '#2D4059',
            }}
          >
            Заблокировано оператором склада Иванов И.И. для размещения в станции № ХХХ
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '13px',
              color: '#2D4059',
            }}
          >
            Доступный остаток на основном складе
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '17px',
            right: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <button
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <img 
              src={Schablon6} 
              alt="" 
              style={{ width: '20px', height: '20px' }} 
            />
          </button>

          <button
            onClick={onClose}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="1.5" y1="1.5" x2="12.5" y2="12.5" stroke="#2D4059" strokeWidth="3" strokeLinecap="round" />
              <line x1="12.5" y1="1.5" x2="1.5" y2="12.5" stroke="#2D4059" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CellDetailsPopup;