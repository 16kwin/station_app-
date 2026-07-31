// StationConfigurationTab.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useEffect, useState } from 'react';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import Icon31 from '../../../assets/References/NomenclatureCreatePage/Icon31.svg';
import Icon32 from '../../../assets/References/NomenclatureCreatePage/Icon32.svg';
import type { PopupType } from '../NomenclaturePage/CatalogSelectPopup';

interface CellData {
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

interface StationConfigurationTabProps {
  configurationUid: string;
  configurationName: string;
  modelId: string;
  ipAddress: string;
  networkPort: number | '';
  setConfigurationUid: (v: string) => void;
  setConfigurationName: (v: string) => void;
  setIpAddress: (v: string) => void;
  setNetworkPort: (v: number | '') => void;
  openPopup: (type: PopupType, filter?: string) => void;
}

const StationConfigurationTab: React.FC<StationConfigurationTabProps> = ({ configurationUid, configurationName, modelId, ipAddress, networkPort, setConfigurationUid, setConfigurationName, setIpAddress, setNetworkPort, openPopup }) => {
  const [modelCells, setModelCells] = useState<CellData[]>([]);
  const [configCells, setConfigCells] = useState<ConfigCell[]>([]);
  const [cellType, setCellType] = useState<'postamat' | 'drum'>('postamat');
  const [columnsCount, setColumnsCount] = useState(0);
  const [rowsCount, setRowsCount] = useState(0);
  const [drums, setDrums] = useState(0);
  const [selectedDrum, setSelectedDrum] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const POSTAMAT_CELL_WIDTH = 160;
  const DRUM_CELL_SIZE = 60;
  const GAP = 6;
  const COL_GAP = 50;

  useEffect(() => {
    if (configurationUid) {
      loadConfiguration();
    } else {
      setConfigCells([]);
      setModelCells([]);
    }
  }, [configurationUid]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const configRes = await AxiosService.get(ConstantInfo.restApiStationConfiguration(configurationUid));
      const configData = configRes.data;

      if (configData.cellsStructure) {
        const parsed = JSON.parse(configData.cellsStructure);
        setConfigCells(parsed.cells || []);
      }

      if (configData.modelId) {
        const modelRes = await AxiosService.get(ConstantInfo.restApiStationModel(configData.modelId));
        if (modelRes.data.cellsStructure) {
          const modelStruct = JSON.parse(modelRes.data.cellsStructure);
          setModelCells(modelStruct.cells || []);
          setCellType(modelStruct.type || 'postamat');
          setColumnsCount(modelStruct.columns || modelStruct.columnsPerDrum || 0);
          setRowsCount(modelStruct.cellsPerColumn || modelStruct.rowsPerColumn || 0);
          setDrums(modelStruct.drums || 0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const modelCellToConfigMap = new Map<string, ConfigCell>();
  configCells.forEach(cc => cc.modelCellIds.forEach(mid => modelCellToConfigMap.set(mid, cc)));
  const renderedModelCells = new Set<string>();

  const displayCells = modelCells.filter(c => cellType === 'drum' ? c.drum === selectedDrum : true);

  const labelStyle: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#2D4059' };
  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid rgba(102, 110, 254, 0.15)',
    backgroundColor: '#FFFFFF', paddingLeft: 12, paddingRight: 12,
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
    color: '#666EFE', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ position: 'absolute', top: 154, left: 30, right: 30, bottom: 86, display: 'flex', gap: 30 }}>
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', width: 300, flexShrink: 0, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>{configurationName || 'Конфигурация'}</span>

        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#2D4059', display: 'block', marginBottom: 6 }}>Конфигурация:</span>
          <div
            onClick={() => modelId ? openPopup('stationConfiguration', modelId) : undefined}
            style={{
              width: '100%', height: 40, borderRadius: 8, marginTop: 0,
              display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500,
              backgroundColor: '#FFFFFF', boxSizing: 'border-box',
              border: configurationUid ? '1px solid #666EFE' : '1px solid rgba(102, 110, 254, 0.15)',
              cursor: modelId ? 'pointer' : 'not-allowed',
              opacity: modelId ? 1 : 0.5,
            }}
          >
            <img src={configurationUid ? Icon32 : Icon31} alt="" style={{ width: 14, height: 17, flexShrink: 0 }} />
            <span style={{ marginLeft: 10, color: configurationUid ? '#666EFE' : '#A0A3BD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {modelId ? (configurationName || 'Выберите конфигурацию') : 'Сначала выберите модель'}
            </span>
          </div>
        </div>

        {configurationUid && (
          <>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Тип: <strong>{cellType === 'postamat' ? 'Постамат' : 'Барабанный'}</strong></span>
            </div>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Колонок: <strong>{columnsCount}</strong></span>
            </div>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Строк: <strong>{rowsCount}</strong></span>
            </div>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Всего ячеек: <strong>{configCells.filter(c => !c.deleted).length}</strong></span>
            </div>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280' }}>Объединено: <strong>{configCells.filter(c => c.modelCellIds.length > 1).length}</strong></span>
            </div>
          </>
        )}

        {/* СЕТЕВЫЕ НАСТРОЙКИ */}
        <div style={{ marginTop: 10 }}>
          <span style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>Сетевые настройки:</span>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>IP-адрес</span>
            <input
              type="text"
              value={ipAddress}
              onChange={e => setIpAddress(e.target.value)}
              placeholder="Введите IP-адрес"
              style={{
                ...inputStyle,
                border: ipAddress ? '1px solid #666EFE' : '1px solid rgba(102,110,254,0.15)',
                color: ipAddress ? '#666EFE' : '#A0A3BD',
              }}
            />
          </div>
          <div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Сетевой порт</span>
            <input
              type="number"
              value={networkPort}
              onChange={e => setNetworkPort(e.target.value ? Number(e.target.value) : '')}
              placeholder="Введите порт"
              style={{
                ...inputStyle,
                border: networkPort ? '1px solid #666EFE' : '1px solid rgba(102,110,254,0.15)',
                color: networkPort ? '#666EFE' : '#A0A3BD',
              }}
            />
          </div>
        </div>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ — Сетка ячеек */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid rgba(102, 110, 254, 0.15)', flex: 1, padding: 20, overflow: 'auto' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#2D4059' }}>Сетка ячеек</span>

        {!configurationUid ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 30px)' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#9CA3AF' }}>Конфигурация не выбрана</span>
          </div>
        ) : isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 30px)' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#9CA3AF' }}>Загрузка...</span>
          </div>
        ) : (
          <>
            {cellType === 'drum' && drums > 1 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {Array.from({ length: drums }).map((_, i) => (
                  <button key={i} onClick={() => setSelectedDrum(i + 1)} style={{ width: 100, height: 36, borderRadius: 8, border: selectedDrum === i + 1 ? '2px solid #666EFE' : '1px solid rgba(102,110,254,0.15)', backgroundColor: selectedDrum === i + 1 ? '#F0F1FF' : '#FFFFFF', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, fontWeight: selectedDrum === i + 1 ? 600 : 400, color: selectedDrum === i + 1 ? '#666EFE' : '#2D4059' }}>Барабан {i + 1}</button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              {columnsCount > 0 && rowsCount > 0 ? (
                <div style={{ display: 'flex', gap: COL_GAP }}>
                  {Array.from({ length: columnsCount }).map((_, cIdx) => {
                    const colCells: React.ReactNode[] = [];
                    Array.from({ length: rowsCount }).forEach((_, rIdx) => {
                      const modelCell = displayCells.find(c => c.column === cIdx + 1 && c.row === rIdx + 1);
                      
                      if (!modelCell) {
                        const cellWidth = cellType === 'postamat' ? POSTAMAT_CELL_WIDTH : DRUM_CELL_SIZE;
                        const singleHeight = cellType === 'postamat' ? Math.max(20, (484 - (rowsCount - 1) * GAP) / rowsCount) : DRUM_CELL_SIZE;
                        colCells.push(
                          <div key={`empty-${cIdx}-${rIdx}`} style={{ width: cellWidth, height: singleHeight, borderRadius: 3, border: '1px dashed rgba(45,64,89,0.15)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#9CA3AF' }}>—</span>
                          </div>
                        );
                        return;
                      }

                      if (renderedModelCells.has(modelCell.id)) return;
                      
                      const configCell = modelCellToConfigMap.get(modelCell.id);
                      
                      if (!configCell || configCell.deleted) {
                        renderedModelCells.add(modelCell.id);
                        const cellWidth = cellType === 'postamat' ? POSTAMAT_CELL_WIDTH : DRUM_CELL_SIZE;
                        const singleHeight = cellType === 'postamat' ? Math.max(20, (484 - (rowsCount - 1) * GAP) / rowsCount) : DRUM_CELL_SIZE;
                        colCells.push(
                          <div key={modelCell.id} style={{ width: cellWidth, height: singleHeight, borderRadius: 3, border: '1px dashed rgba(45,64,89,0.15)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#9CA3AF' }}>—</span>
                          </div>
                        );
                        return;
                      }

                      const isMerged = configCell.modelCellIds.length > 1;
                      const isFirstInMerge = configCell.modelCellIds[0] === modelCell.id;
                      if (isMerged && !isFirstInMerge) return;

                      const cellWidth = cellType === 'postamat' ? POSTAMAT_CELL_WIDTH : DRUM_CELL_SIZE;
                      const singleHeight = cellType === 'postamat' ? Math.max(20, (484 - (rowsCount - 1) * GAP) / rowsCount) : DRUM_CELL_SIZE;
                      let mergeWidth = cellWidth;
                      let mergeHeight = singleHeight;

                      if (isMerged) {
                        const allMerged: CellData[] = configCell.modelCellIds.map(mid => modelCells.find(c => c.id === mid)).filter((c): c is CellData => c !== undefined);
                        const mcols = [...new Set(allMerged.map(c => c.column!).filter(c => c !== undefined))];
                        const mrows = [...new Set(allMerged.map(c => c.row!).filter(r => r !== undefined))];
                        mergeWidth = cellWidth * mcols.length + COL_GAP * (mcols.length - 1);
                        mergeHeight = singleHeight * mrows.length + GAP * (mrows.length - 1);
                        allMerged.forEach(c => renderedModelCells.add(c.id));
                      }

                      colCells.push(
                        <div key={modelCell.id} style={{ width: mergeWidth, height: mergeHeight, borderRadius: 3, border: '1px solid rgba(45,64,89,0.25)', backgroundColor: isMerged ? 'rgba(102,110,254,0.25)' : 'rgba(45,64,89,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#FFFFFF', fontFamily: 'Inter' }}>
                          {cIdx + 1}-{rIdx + 1}
                          {isMerged && <span style={{ fontSize: 10, marginLeft: 4 }}>({configCell.modelCellIds.length})</span>}
                        </div>
                      );
                    });
                    return <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>{colCells}</div>;
                  })}
                </div>
              ) : (
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#9CA3AF' }}>Нет данных</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StationConfigurationTab;