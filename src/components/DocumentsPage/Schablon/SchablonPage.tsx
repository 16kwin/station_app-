// SchablonPage.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTabs } from '../../../context/TabContext';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';

import Schablon1 from '../../../assets/Schablon/Schablon1.svg';
import Schablon3 from '../../../assets/Schablon/Schablon3.svg';
import Schablon4 from '../../../assets/Schablon/Schablon4.svg';
import Schablon5 from '../../../assets/Schablon/Schablon5.svg';
import StationFull from '../../../assets/StationAnimation/StationFull.svg';

import TMC from '../../../assets/Station/TMC.svg';
import SGD from '../../../assets/Station/SGD.svg';
import OK from '../../../assets/Station/OK.svg';
import CHAIN from '../../../assets/Station/CHAIN.svg';
import Iconn3 from '../../../assets/Station/Iconn3.svg';
import Iconkrest from '../../../assets/Schablon/Iconkrest.svg';
import IconW from '../../../assets/Schablon/IconW.svg';
import IconD from '../../../assets/Schablon/IconD.svg';
import IconJ1 from '../../../assets/Schablon/IconJ1.svg';
import IconJ2 from '../../../assets/Schablon/IconJ2.svg';

import SchablonTable from './SchablonTable';
import SchablonProgressBar from './SchablonProgressBar';
import ClearPopup from './ClearPopup';
import CellDetailsPopup from './CellDetailsPopup';

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

const SchablonPage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [searchParams] = useSearchParams();

  const [stationUid] = useState(() => searchParams.get('stationUid') || '');
  const [stationNameParam] = useState(() => searchParams.get('stationName') || '');

  const { tabs, activeTabId, closeTab } = useTabs();
  const containerRef = useRef<HTMLDivElement>(null);

  const [templateName, setTemplateName] = useState<string>('');
  const [templateNumber, setTemplateNumber] = useState<number | null>(null);
  const [templateDate, setTemplateDate] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [isStatusLoaded, setIsStatusLoaded] = useState(false);

  const [stationName, setStationName] = useState<string>(stationNameParam || '');
  const [isTmc, setIsTmc] = useState(false);
  const [isSgd, setIsSgd] = useState(false);
  const [isOk, setIsOk] = useState(false);
  const [parentUid, setParentUid] = useState<string | null>(null);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [activeButtons, setActiveButtons] = useState<number[]>([]);
  const [progressStep, setProgressStep] = useState<number>(0);

  const [totalRows, setTotalRows] = useState(18);
  const [totalColumns, setTotalColumns] = useState(14);
  const [totalDrums, setTotalDrums] = useState(1);
  const [selectedDrum, setSelectedDrum] = useState<number>(1);
  const [cellType, setCellType] = useState<'postamat' | 'drum'>('drum');
  const [configLoaded, setConfigLoaded] = useState(false);
  const [modelCells, setModelCells] = useState<ModelCell[]>([]);
  const [configCells, setConfigCells] = useState<ConfigCell[]>([]);

  const [isClearPopupOpen, setIsClearPopupOpen] = useState(false);
  const [isCellPopupOpen, setIsCellPopupOpen] = useState(false);
  const [cellPopupData, setCellPopupData] = useState<{ id: number; name: string; column: number; selectedIds: Set<number> }>({ id: 0, name: '', column: 1, selectedIds: new Set() });

  const isAnyPopupOpen = isClearPopupOpen || isCellPopupOpen;

  const prevSelectedIdsRef = useRef<Set<number>>(new Set());

  const IMAGE_WIDTH = 287;
  const IMAGE_HEIGHT = 439;
  const BLOCK_WIDTH = 507;
  const BLOCK_HEIGHT = 560;

  const imageLeft = (BLOCK_WIDTH - IMAGE_WIDTH) / 2; // 110
  const imageTop = 101;

  const fetchData = useCallback(async () => {
    if (!uid) return;
    try {
      const templateRes = await AxiosService.get(ConstantInfo.restApiTemplate(uid));
      const templateData = templateRes.data;
      setTemplateName(templateData.name || '');
      setTemplateNumber(templateData.number);
      setTemplateDate(templateData.createdAt || '');

      if (templateData.configurationUid) {
        try {
          const configRes = await AxiosService.get(ConstantInfo.restApiStationConfiguration(templateData.configurationUid));
          const configData = configRes.data;
          
          if (configData.modelId) {
            const modelRes = await AxiosService.get(ConstantInfo.restApiStationModel(configData.modelId));
            const modelData = modelRes.data;
            
            if (modelData.cellsStructure) {
              const structure = JSON.parse(modelData.cellsStructure);
              setCellType(structure.type || 'drum');
              
              if (structure.type === 'drum') {
                setTotalColumns(structure.columnsPerDrum || 14);
                setTotalRows(structure.rowsPerColumn || 18);
                setTotalDrums(structure.drums || 1);
              } else {
                setTotalColumns(structure.columns || 14);
                setTotalRows(structure.cellsPerColumn || 18);
                setTotalDrums(1);
              }

              if (structure.cells) {
                setModelCells(structure.cells);
              }
            }
          }

          if (configData.cellsStructure) {
            const configStructure = JSON.parse(configData.cellsStructure);
            if (configStructure.cells) {
              setConfigCells(configStructure.cells.filter((c: ConfigCell) => !c.deleted));
            }
          }
          setConfigLoaded(true);
        } catch (e) {
          console.error('Ошибка загрузки конфигурации:', e);
          setConfigLoaded(true);
        }
      } else {
        setConfigLoaded(true);
      }

      if (stationUid) {
        const stationRes = await AxiosService.get(`/api/stations/static/${stationUid}`);
        const stationData = stationRes.data;
        
        if (!stationNameParam) {
          setStationName(stationData?.name || stationUid);
        }
        setIsTmc(stationData?.isTmc || false);
        setIsSgd(stationData?.isSgd || false);
        setIsOk(stationData?.isOk || false);
        setParentUid(stationData?.parentUid || null);

        const activeTemplateUid = stationData?.activeTemplateUid;
        if (activeTemplateUid && String(activeTemplateUid) === String(uid)) {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } else {
        const stationsRes = await AxiosService.get(ConstantInfo.restApiTemplateStations(uid));
        const stationNames: string[] = stationsRes.data || [];
        setIsActive(stationNames.length > 0);
      }
      setIsStatusLoaded(true);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setIsStatusLoaded(true);
      setConfigLoaded(true);
    }
  }, [uid, stationUid, stationNameParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async () => {
    if (!stationUid || !uid) return;
    try {
      if (isActive) {
        await AxiosService.put(`/api/stations/${stationUid}`, { activeTemplateUid: null });
      } else {
        await AxiosService.put(`/api/stations/${stationUid}`, { activeTemplateUid: uid });
      }
      await fetchData();
    } catch (error) {
      console.error('Ошибка переключения шаблона:', error);
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const title = `Документ: Шаблон загрузки станции (${templateName || '...'}) №${templateNumber || '—'} от ${formatDate(templateDate)}`;

  const handleCloseClearPopup = useCallback(() => {
    setIsClearPopupOpen(false);
    setActiveButtons(prev => prev.filter(i => i !== 2));
  }, []);

  const handleCloseCellPopup = useCallback(() => {
    setIsCellPopupOpen(false);
  }, []);

  const handleClose = () => {
    const currentTab = tabs.find(tab => tab.id === activeTabId);
    if (currentTab) {
      closeTab(currentTab.id);
    }
  };

  const handleButtonClick = (index: number) => {
    if (index === 2) {
      if (isClearPopupOpen) {
        handleCloseClearPopup();
      } else {
        setIsClearPopupOpen(true);
        setActiveButtons(prev => prev.includes(index) ? prev : [...prev, index]);
      }
      return;
    }

    if (index === 1) {
      setIsMultiSelect(prev => !prev);
      setActiveButtons(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setActiveButtons(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    }
  };

  const handleEnableMultiSelect = () => {
    if (!isMultiSelect) {
      setIsMultiSelect(true);
      setActiveButtons(prev => prev.includes(1) ? prev : [...prev, 1]);
    }
  };

  const handleTableSelectionChange = useCallback((selectedIds: Set<number>) => {
    prevSelectedIdsRef.current = new Set(selectedIds);
  }, []);

  const handleDrumChange = useCallback((drum: number) => {
    if (drum === selectedDrum) return;
    setSelectedDrum(drum);
    prevSelectedIdsRef.current = new Set();
  }, [selectedDrum]);

  const handleCellDoubleClick = useCallback((id: number, column: number, selectedIds: Set<number>) => {
    setCellPopupData({ id, name: `Ячейка ${id}`, column, selectedIds });
    setIsCellPopupOpen(true);
  }, []);

  const statusIcons: string[] = [];
  if (isTmc) statusIcons.push(TMC);
  if (isSgd) statusIcons.push(SGD);
  if (isOk) statusIcons.push(OK);
  if (parentUid) statusIcons.push(CHAIN);

  const getRoundButtonStyle = (isActiveBtn: boolean): React.CSSProperties => ({
    width: '54px',
    height: '54px',
    borderRadius: '15px',
    backgroundColor: isActiveBtn ? '#666EFE' : '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: isActiveBtn ? '0 4px 12px rgba(102, 110, 254, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  });

  const bottomButtonStyle: React.CSSProperties = {
    height: '51px',
    borderRadius: '15px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    fontWeight: 700,
  };

  const showJButton = !!stationUid;

  const totalActiveCells = configCells.length;
  const getDrumCellCount = (drum: number): number => {
    return configCells.filter(c => {
      return c.modelCellIds.some(mid => {
        const mc = modelCells.find(cell => cell.id === mid);
        return mc?.drum === drum;
      });
    }).length;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%', backgroundColor: '#FAFBFF' }}>
      <div
        style={{
          position: 'absolute',
          top: '35px',
          left: '60px',
          right: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 700, color: '#2D4059', margin: 0, lineHeight: '29px', height: '29px', whiteSpace: 'nowrap' }}>
            {title}
          </h1>
          {isStatusLoaded && isActive && (
            <img src={Iconn3} alt="Активный" style={{ width: 84, height: 24, flexShrink: 0 }} />
          )}
        </div>

        <button onClick={handleClose} style={{ width: '22px', height: '22px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>
          <img src={Iconkrest} alt="Закрыть" style={{ width: '22px', height: '22px' }} />
        </button>
      </div>

      <div style={{ position: 'absolute', top: '84px', left: '40px', width: '507px' }}>
        <div style={{ width: '477px', height: '71px', marginLeft: '15px', backgroundColor: '#FFFFFF', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SchablonProgressBar currentStep={progressStep} onClick={() => setProgressStep(prev => (prev + 1) % 4)} />
        </div>

        <div style={{ width: `${BLOCK_WIDTH}px`, height: `${BLOCK_HEIGHT}px`, marginTop: '15px', backgroundColor: '#FFFFFF', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>
          {/* Название станции (только если открыто через станцию) */}
          {showJButton && stationName && (
            <div style={{
              position: 'absolute',
              top: '30px',
              left: 0,
              right: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '19px',
              lineHeight: '23px',
              color: '#2D4059',
              textAlign: 'center',
              maxWidth: '400px',
              margin: '0 auto',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {stationName}
            </div>
          )}

          {/* Иконки статусов (под названием или на месте названия) */}
          {statusIcons.length > 0 && (
            <div style={{
              position: 'absolute',
              top: showJButton && stationName ? '66px' : '30px',
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
            }}>
              {statusIcons.map((icon, index) => (
                <img key={index} src={icon} alt="" style={{ width: '35px', height: '20px' }} />
              ))}
            </div>
          )}

          {/* Изображение станции */}
          <div style={{ position: 'absolute', left: `${imageLeft}px`, top: `${imageTop}px`, width: `${IMAGE_WIDTH}px`, height: `${IMAGE_HEIGHT}px` }}>
            <img src={StationFull} alt="Station" draggable={false} style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }} />
          </div>
        </div>

        <div style={{ width: '507px', height: '60px', marginTop: '15px', backgroundColor: '#FFFFFF', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#2D4059' }}>
              Всего ячеек: <strong>{totalActiveCells}</strong>
            </span>
            {totalDrums > 1 && Array.from({ length: totalDrums }, (_, i) => i + 1).map(drum => (
              <span key={drum} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#2D4059' }}>
                Барабан {drum}: <strong>{getDrumCellCount(drum)}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '106px', left: '577px', right: '40px', bottom: '40px' }}>
        <div style={{ width: '100%', height: '54px', marginBottom: '10px', display: 'flex', alignItems: 'center', filter: isAnyPopupOpen ? 'blur(2px)' : 'none', transition: 'filter 0.3s ease', pointerEvents: isAnyPopupOpen ? 'none' : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => handleButtonClick(0)} style={getRoundButtonStyle(activeButtons.includes(0))}>
              <img src={Schablon1} alt="" style={{ width: '24px', height: '24px', filter: activeButtons.includes(0) ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </button>
            <button onClick={() => handleButtonClick(2)} style={getRoundButtonStyle(activeButtons.includes(2))}>
              <img src={Schablon3} alt="" style={{ width: '24px', height: '24px', filter: activeButtons.includes(2) ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '145px' }}>
            <div style={{ width: '411px', height: '54px', borderRadius: '15px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 15px', boxSizing: 'border-box' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: '#2D4059', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {templateName || 'Шаблон'}
              </span>
            </div>
            {showJButton && (
              <button onClick={handleToggleActive} style={getRoundButtonStyle(isActive)}>
                <img src={isActive ? IconJ2 : IconJ1} alt="" style={{ width: '24px', height: '14px', filter: isActive ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
            <button onClick={() => handleButtonClick(3)} style={getRoundButtonStyle(activeButtons.includes(3))}>
              <img src={Schablon4} alt="" style={{ width: '24px', height: '24px', filter: activeButtons.includes(3) ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </button>
            <button onClick={() => handleButtonClick(4)} style={getRoundButtonStyle(activeButtons.includes(4))}>
              <img src={Schablon5} alt="" style={{ width: '24px', height: '24px', filter: activeButtons.includes(4) ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease' }} />
            </button>
          </div>
        </div>

        <div style={{ height: '560px' }}>
          {configLoaded && (
            <SchablonTable
              isMultiSelect={isMultiSelect}
              onEnableMultiSelect={handleEnableMultiSelect}
              onSelectionChange={handleTableSelectionChange}
              totalRows={totalRows}
              totalColumns={totalColumns}
              totalDrums={totalDrums}
              cellType={cellType}
              selectedDrum={selectedDrum}
              onDrumChange={handleDrumChange}
              onCellDoubleClick={handleCellDoubleClick}
              isBlurred={isAnyPopupOpen}
              modelCells={modelCells}
              configCells={configCells}
            />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '30px', marginTop: '30px' }}>
          <button style={{ ...bottomButtonStyle, width: '215px', backgroundColor: '#FFFFFF', color: '#2D4059', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <img src={IconD} alt="" style={{ width: '17px', height: '21px', flexShrink: 0 }} />
            <span style={{ marginLeft: '17px' }}>Форма документа</span>
          </button>
          <button style={{ ...bottomButtonStyle, width: '154px', backgroundColor: '#FFFFFF', color: '#2D4059', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <img src={IconW} alt="" style={{ width: '21px', height: '21px', flexShrink: 0 }} />
            <span style={{ marginLeft: '17px' }}>Записать</span>
          </button>
          <button onClick={handleClose} style={{ ...bottomButtonStyle, width: '116px', backgroundColor: '#FFFFFF', color: '#2D4059', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>Закрыть</button>
        </div>

        {isClearPopupOpen && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100 }}>
            <ClearPopup isOpen={isClearPopupOpen} onClose={handleCloseClearPopup} />
          </div>
        )}
        {isCellPopupOpen && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100 }}>
            <CellDetailsPopup isOpen={isCellPopupOpen} onClose={handleCloseCellPopup} cellId={cellPopupData.id} cellName={cellPopupData.name} selectedColumn={cellPopupData.column} isMultiSelect={isMultiSelect} selectedCellIds={cellPopupData.selectedIds} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SchablonPage;