// StationRow.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Импорт картинки станции
import Station from '../../assets/Station/Station.svg';

// Импорт иконок для прогресс-баров
import Icon1 from '../../assets/Station/Icon1.svg';
import Icon2 from '../../assets/Station/Icon2.svg';
import Icon3 from '../../assets/Station/Icon3.svg';

// Импорт иконки ошибки
import ERR3 from '../../assets/Station/ERR3.svg';

// Импорт иконок для информации
import TMC2 from '../../assets/Station/TMC2.svg';
import SGD2 from '../../assets/Station/SGD2.svg';
import OK2 from '../../assets/Station/OK2.svg';
import CHAIN2 from '../../assets/Station/CHAIN2.svg';

// Единая иконка остатка
import OstatokIcon from '../../assets/Station/KRIT.svg';

// Импорт иконок для кнопок справа (единые)
import IconDash from '../../assets/Station/IconDash.svg';
import IconGraf from '../../assets/Station/IconGraf.svg';
import ArrowRight from '../../assets/Station/arrow-right1.svg';
import ArrowBack from '../../assets/Station/arrow-back1.svg';

// Импорт иконок для конфигурации
import Config1 from '../../assets/Station/Config1.svg';
import Config2 from '../../assets/Station/Config2.svg';
import Config3 from '../../assets/Station/Config3.svg';
import Config4 from '../../assets/Station/Config4.svg';
import Config5 from '../../assets/Station/Config5.svg';

const glassPulse = `@keyframes glassPulse { 0%, 100% { opacity: 0.67; transform: translateX(0); } 50% { opacity: 1; transform: translateX(6px); } }`;
const glassPulseRight = `@keyframes glassPulseRight { 0%, 100% { opacity: 0.67; transform: translateX(0); } 50% { opacity: 1; transform: translateX(-6px); } }`;
const shimmer = `@keyframes shimmer { 0%, 100% { opacity: 0.6; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-4px); } }`;

interface StationRowProps {
  uid?: string; name?: string; workshop?: string; section?: string; status?: string; stationType?: string;
  parentUid?: string | null; hasError?: boolean; isTmc?: boolean; isSgd?: boolean; isOk?: boolean;
  filledCellsPercent?: number; remainingNomenclaturePercent?: number; readyPartsPercent?: number;
  totalCells?: number; filledCells?: number; templateNomenclatureCount?: number; remainingNomenclatureCount?: number;
  maxReadyParts?: number; readyPartsCount?: number;
  onOpenSchablonPopup?: (station: { uid: string; name: string; workshop: string; section: string; status: string }) => void;
}

const StationRow: React.FC<StationRowProps> = ({
  uid, name, workshop, section, status, stationType, parentUid,
  hasError = false, isTmc, isSgd, isOk,
  filledCellsPercent = 0, remainingNomenclaturePercent = 0, readyPartsPercent = 0,
  totalCells = 0, filledCells = 0, templateNomenclatureCount = 0, remainingNomenclatureCount = 0,
  readyPartsCount = 0, onOpenSchablonPopup,
}) => {
  const navigate = useNavigate();
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showWorkshopTooltip, setShowWorkshopTooltip] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [animatedFilled, setAnimatedFilled] = useState(0);
  const [animatedRemaining, setAnimatedRemaining] = useState(0);
  const [animatedReady, setAnimatedReady] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

  const [refillHovered, setRefillHovered] = useState(false);
  const [refillPressed, setRefillPressed] = useState(false);
  const [dashHovered, setDashHovered] = useState(false);
  const [dashPressed, setDashPressed] = useState(false);
  const [grafHovered, setGrafHovered] = useState(false);
  const [grafPressed, setGrafPressed] = useState(false);
  const [arrowHovered, setArrowHovered] = useState(false);
  const [arrowPressed, setArrowPressed] = useState(false);
  const [configHovered, setConfigHovered] = useState<number | null>(null);
  const [configPressed, setConfigPressed] = useState<number | null>(null);

  useEffect(() => { const t = setTimeout(() => setStartAnimation(true), 300); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!startAnimation) return;
    const duration = 1000, steps = 60, interval = duration / steps; let step = 0;
    const timer = setInterval(() => {
      step++; const progress = step / steps;
      setAnimatedFilled(filledCellsPercent * progress); setAnimatedRemaining(remainingNomenclaturePercent * progress); setAnimatedReady(readyPartsPercent * progress);
      if (step >= steps) { clearInterval(timer); setAnimatedFilled(filledCellsPercent); setAnimatedRemaining(remainingNomenclaturePercent); setAnimatedReady(readyPartsPercent); }
    }, interval);
    return () => clearInterval(timer);
  }, [startAnimation, filledCellsPercent, remainingNomenclaturePercent, readyPartsPercent]);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (status) {
      case 'WORKING': return { background: 'linear-gradient(90deg, #5FB0E2 0%, #5D5FEF 100%)' };
      case 'OFFLINE': return { background: 'linear-gradient(90deg, #B5B5B5 0%, #777777 77%)' };
      case 'MINIMAL_STOCK': return { background: 'linear-gradient(90deg, #F9B38E 0%, #FFAF81 100%)' };
      case 'CRITICAL_STOCK': return { background: 'linear-gradient(90deg, #FF6C84 0%, #FF3052 80%)' };
      default: return { background: 'linear-gradient(90deg, #B5B5B5 0%, #777777 77%)' };
    }
  };
  const getStatusText = () => { switch (status) { case 'WORKING': return 'В работе'; case 'OFFLINE': return 'Не в сети'; case 'MINIMAL_STOCK': return 'Минимальный остаток'; case 'CRITICAL_STOCK': return 'Критический остаток'; default: return status || '—'; } };

  const displayName = name || uid || '—';
  const workshopSectionText = `${workshop || '—'} ${section || '—'}`;
  const statusIcons: string[] = [];
  if (isTmc) statusIcons.push(TMC2);
  if (isSgd) statusIcons.push(SGD2);
  if (isOk) statusIcons.push(OK2);
  if (parentUid) statusIcons.push(CHAIN2);
  const showKrit = status === 'MINIMAL_STOCK' || status === 'CRITICAL_STOCK';

  const textSmoothing: React.CSSProperties = { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' };
  const glassProgressStyle: React.CSSProperties = { background: 'rgba(255, 255, 255, 0.30)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', boxShadow: 'inset -1px -1px 1px rgba(255, 255, 255, 0.5), inset 1px 1px 1px rgba(255, 255, 255, 0.5)' };

  const getGlassBtnStyle = (hovered: boolean, pressed: boolean, width: number, height: number, borderRadius: string): React.CSSProperties => ({
    background: hovered ? 'rgba(255, 255, 255, 0.30)' : 'rgba(255, 255, 255, 0.20)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    boxShadow: 'inset -1px -1px 1px rgba(255, 255, 255, 0.5), inset 1px 1px 1px rgba(255, 255, 255, 0.5)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 3,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius,
    transform: pressed ? 'translateY(-50%) scale(0.95)' : 'translateY(-50%) scale(1)',
    transition: 'background 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  const handleRightButtonClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsConfigMode(true); };
  const handleBackClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsConfigMode(false); };
  const handleSchablonClick = (e: React.MouseEvent) => { e.stopPropagation(); if (onOpenSchablonPopup) onOpenSchablonPopup({ uid: uid || '', name: name || '', workshop: workshop || '', section: section || '', status: status || '' }); };
  const handleSettingsClick = (e: React.MouseEvent) => { e.stopPropagation(); if (uid) navigate(`/references/stations/edit/${uid}`); };

  const glassBlockLeft = 41, glassBlockWidth = 70, statusIconsLeft = glassBlockLeft + glassBlockWidth + 30;
  const statusIconWidth = 30, statusIconHeight = 17, statusIconGap = 4;
  const allIcons = [...statusIcons]; const errorIndex = hasError ? allIcons.length : -1; if (hasError) allIcons.push(ERR3);
  const isSpecialCase = hasError && errorIndex === 3;
  const getStatusIconsHeight = () => { const c = allIcons.length; if (c === 0) return 0; if (isSpecialCase) return 3 * statusIconHeight + 2 * statusIconGap; return c * statusIconHeight + (c - 1) * statusIconGap; };
  const getStatusIconsWidth = () => { if (allIcons.length === 0) return 0; if (isSpecialCase) return 64; return 30; };

  const textBlockLeft = 221, textBlockWidth = 148, kritIconLeft = textBlockLeft + textBlockWidth + 40;
  const barsTop = 26, barLabelHeight = 16, barHeight = 16, barWidth = 130, barGapToLabel = 7, barGapToBottom = 5, iconGap = 6, percentGap = 6;
  const bars = [
    { left: 472, icon: Icon1, iconW: 26, iconH: 14, label: 'Использование ячеек', value: animatedFilled, bottom: `${filledCells} / ${totalCells}` },
    { left: 698, icon: Icon2, iconW: 18, iconH: 20, label: 'Остаток ТМЦ в станциях', value: animatedRemaining, bottom: `${remainingNomenclatureCount}` },
    { left: 918, icon: Icon3, iconW: 12, iconH: 22, label: 'Готовые детали', value: animatedReady, bottom: `${readyPartsCount}` },
  ];

  const infoRowsLeft = 1148, infoRowWidth = 181, infoRowHeight = 16, infoRowGap = 6, infoRowsTop = 15;
  const overNorm = templateNomenclatureCount > 0 ? Math.max(0, templateNomenclatureCount - remainingNomenclatureCount) : 0;
  const infoRows = [
    { label: 'ТМЦ в станции', value: totalCells },
    { label: 'Выдано ТМЦ', value: filledCells },
    { label: 'Выдано сверхнормы', value: overNorm },
    { label: 'Готовые детали', value: readyPartsCount },
  ];

  const roundBtnSize = 42;
  const refillBtnWidth = 121, refillBtnHeight = 42;
  const arrowBtnRight = 35;
  const iconGrafBtnRight = arrowBtnRight + roundBtnSize + 15;
  const iconDashBtnRight = iconGrafBtnRight + roundBtnSize + 15;
  const refillBtnRight = iconDashBtnRight + roundBtnSize + 34;

  const configTitleLeft = 408;
  const configFirstBtnLeft = 522;
  const configBtnHeight = 42;
  const configBtnGap = 58;
  const configBtns = [
    { label: 'Шаблоны загрузки', icon: Config1, width: 197, action: 'schablon' },
    { label: 'Карта загрузки', icon: Config2, width: 170, action: 'map' },
    { label: 'Списание', icon: Config3, width: 130, action: 'writeoff' },
    { label: 'Видео', icon: Config4, width: 104, action: 'video' },
    { label: 'Настройки станции', icon: Config5, width: 203, action: 'settings' },
  ];

  const renderStatusIcons = () => {
    if (allIcons.length === 0) return null;
    if (isSpecialCase) return (
      <>
        <img src={allIcons[0]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: statusIconWidth, height: statusIconHeight }} />
        <img src={allIcons[1]} alt="" style={{ position: 'absolute', top: statusIconHeight + statusIconGap, left: 0, width: statusIconWidth, height: statusIconHeight }} />
        <img src={allIcons[3]} alt="" style={{ position: 'absolute', top: statusIconHeight + statusIconGap, left: statusIconWidth + 4, width: statusIconWidth, height: statusIconHeight }} />
        <img src={allIcons[2]} alt="" style={{ position: 'absolute', top: 2 * (statusIconHeight + statusIconGap), left: 0, width: statusIconWidth, height: statusIconHeight }} />
      </>
    );
    return allIcons.map((icon, i) => <img key={i} src={icon} alt="" style={{ position: 'absolute', top: i * (statusIconHeight + statusIconGap), left: 0, width: statusIconWidth, height: statusIconHeight }} />);
  };

  return (
    <>
      <style>{glassPulse}</style><style>{glassPulseRight}</style><style>{shimmer}</style>
      <div style={{ width: '1720px', height: '112px', borderRadius: '25px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', position: 'relative', transition: 'box-shadow 0.2s ease', overflow: 'hidden', ...getBackgroundStyle() }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'; }}>
        
        <div style={{ position: 'absolute', width: '306px', height: '306px', borderRadius: '50%', top: '-18px', left: '-74px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%)', pointerEvents: 'none', zIndex: 0, animation: 'glassPulse 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '306px', height: '306px', borderRadius: '50%', top: '32px', left: '760px', background: 'linear-gradient(135deg, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.25) 60%, rgba(255, 255, 255, 0.12) 100%)', pointerEvents: 'none', zIndex: 0, animation: 'shimmer 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '242px', height: '242px', borderRadius: '50%', top: '-125px', right: '-109px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%)', pointerEvents: 'none', zIndex: 0, animation: 'glassPulseRight 10s ease-in-out infinite' }} />

        <div style={{ position: 'absolute', left: `${glassBlockLeft}px`, top: '50%', transform: 'translateY(-50%)', width: '70px', height: '70px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.30)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', boxShadow: 'inset -1px -1px 1px rgba(255, 255, 255, 0.5), inset 1px 1px 1px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <img src={Station} alt="Station" style={{ width: '48px', height: '54px', objectFit: 'contain', position: 'relative', zIndex: 2 }} />
        </div>

        <div style={{ position: 'absolute', left: `${statusIconsLeft}px`, top: '50%', transform: 'translateY(-50%)', width: `${getStatusIconsWidth()}px`, height: `${getStatusIconsHeight()}px`, zIndex: 2 }}>{renderStatusIcons()}</div>

        <div style={{ position: 'absolute', left: `${textBlockLeft}px`, top: 0, width: `${textBlockWidth}px`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ position: 'relative', width: '100%', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={() => setShowNameTooltip(true)} onMouseLeave={() => setShowNameTooltip(false)}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', lineHeight: '18px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...textSmoothing }}>{displayName}</div>
            {showNameTooltip && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px', padding: '4px 8px', backgroundColor: 'rgba(45, 64, 89, 0.9)', color: '#FFFFFF', fontSize: '12px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 1000, pointerEvents: 'none' }}>{displayName}</div>}
          </div>
          <div style={{ position: 'relative', width: '100%', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }} onMouseEnter={() => setShowWorkshopTooltip(true)} onMouseLeave={() => setShowWorkshopTooltip(false)}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', lineHeight: '16px', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...textSmoothing }}>{workshopSectionText}</div>
            {showWorkshopTooltip && <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px', padding: '4px 8px', backgroundColor: 'rgba(45, 64, 89, 0.9)', color: '#FFFFFF', fontSize: '12px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 1000, pointerEvents: 'none' }}>{workshopSectionText}</div>}
          </div>
          <div style={{ width: '100%', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', lineHeight: '16px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...textSmoothing }}>{getStatusText()}</div>
          </div>
        </div>

        <button
          onClick={isConfigMode ? handleBackClick : handleRightButtonClick}
          onMouseEnter={() => setArrowHovered(true)} onMouseLeave={() => { setArrowHovered(false); setArrowPressed(false); }}
          onMouseDown={() => setArrowPressed(true)} onMouseUp={() => setTimeout(() => setArrowPressed(false), 100)}
          style={{ ...getGlassBtnStyle(arrowHovered, arrowPressed, roundBtnSize, roundBtnSize, '50%'), right: `${arrowBtnRight}px`, top: '50%', overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait">
            {isConfigMode ? (
              <motion.img key="arrow-back" src={ArrowBack} alt="Назад" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.3 }} style={{ width: '20px', height: '18px', position: 'absolute' }} />
            ) : (
              <motion.img key="arrow-right" src={ArrowRight} alt="" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.3 }} style={{ width: '20px', height: '18px', position: 'absolute' }} />
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence mode="wait">
          {!isConfigMode ? (
            <motion.div key="main" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1 }}>
              {bars.map((bar, index) => {
                const textCenterLeft = bar.iconW + iconGap + barWidth / 2;
                return (
                  <div key={index} style={{ position: 'absolute', left: `${bar.left}px`, top: `${barsTop}px`, width: `${barWidth + iconGap + bar.iconW + percentGap + 30}px`, height: `${barLabelHeight + barGapToLabel + barHeight + barGapToBottom + barLabelHeight}px`, zIndex: 2 }}>
                    <div style={{ position: 'absolute', top: 0, left: `${textCenterLeft}px`, transform: 'translateX(-50%)', height: `${barLabelHeight}px`, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', lineHeight: '16px', color: '#FFFFFF', ...textSmoothing }}>{bar.label}</span>
                    </div>
                    <div style={{ position: 'absolute', top: `${barLabelHeight + barGapToLabel}px`, left: 0, height: `${barHeight}px`, display: 'flex', alignItems: 'center' }}>
                      <img src={bar.icon} alt="" style={{ width: `${bar.iconW}px`, height: `${bar.iconH}px`, flexShrink: 0 }} />
                      <div style={{ width: `${barWidth}px`, height: `${barHeight}px`, borderRadius: '8px', overflow: 'hidden', marginLeft: `${iconGap}px`, flexShrink: 0, ...glassProgressStyle }}>
                        <div style={{ width: `${Math.min(bar.value, 100)}%`, height: '100%', backgroundColor: '#FFFFFF', borderRadius: '8px', transition: 'width 0.05s linear' }} />
                      </div>
                      <span style={{ marginLeft: `${percentGap}px`, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: '#FFFFFF', whiteSpace: 'nowrap', ...textSmoothing }}>{Math.round(bar.value)}%</span>
                    </div>
                    <div style={{ position: 'absolute', top: `${barLabelHeight + barGapToLabel + barHeight + barGapToBottom}px`, left: `${textCenterLeft}px`, transform: 'translateX(-50%)', height: `${barLabelHeight}px`, display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', lineHeight: '16px', color: '#FFFFFF', ...textSmoothing }}>{bar.bottom}</span>
                    </div>
                  </div>
                );
              })}

              {infoRows.map((row, i) => (
                <div key={i} style={{ position: 'absolute', left: `${infoRowsLeft}px`, top: `${infoRowsTop + i * (infoRowHeight + infoRowGap)}px`, width: `${infoRowWidth}px`, height: `${infoRowHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', lineHeight: '16px', color: '#FFFFFF', ...textSmoothing }}>{row.label}</span>
                  <div style={{ width: '35px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', lineHeight: '16px', color: '#FFFFFF', ...textSmoothing }}>{row.value}</span>
                  </div>
                </div>
              ))}

              {showKrit && <img src={OstatokIcon} alt="ostatok" style={{ position: 'absolute', left: `${kritIconLeft}px`, top: '50%', transform: 'translateY(-50%)', width: '24px', height: '22px', zIndex: 2 }} />}

              <button onClick={(e) => { e.stopPropagation(); console.log('График', uid); }} onMouseEnter={() => setGrafHovered(true)} onMouseLeave={() => { setGrafHovered(false); setGrafPressed(false); }} onMouseDown={() => setGrafPressed(true)} onMouseUp={() => setTimeout(() => setGrafPressed(false), 100)}
                style={{ ...getGlassBtnStyle(grafHovered, grafPressed, roundBtnSize, roundBtnSize, '50%'), right: `${iconGrafBtnRight}px`, top: '50%' }}>
                <img src={IconGraf} alt="" style={{ width: '21px', height: '24px' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); console.log('Dash', uid); }} onMouseEnter={() => setDashHovered(true)} onMouseLeave={() => { setDashHovered(false); setDashPressed(false); }} onMouseDown={() => setDashPressed(true)} onMouseUp={() => setTimeout(() => setDashPressed(false), 100)}
                style={{ ...getGlassBtnStyle(dashHovered, dashPressed, roundBtnSize, roundBtnSize, '50%'), right: `${iconDashBtnRight}px`, top: '50%' }}>
                <img src={IconDash} alt="" style={{ width: '23px', height: '24px' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); console.log('Пополнить', uid); }} onMouseEnter={() => setRefillHovered(true)} onMouseLeave={() => { setRefillHovered(false); setRefillPressed(false); }} onMouseDown={() => setRefillPressed(true)} onMouseUp={() => setTimeout(() => setRefillPressed(false), 100)}
                style={{ ...getGlassBtnStyle(refillHovered, refillPressed, refillBtnWidth, refillBtnHeight, '34px'), right: `${refillBtnRight}px`, top: '50%' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', color: '#FFFFFF', ...textSmoothing }}>Пополнить</span>
              </button>
            </motion.div>
          ) : (
            <motion.div key="config" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1 }}>
              <div style={{ position: 'absolute', left: `${configTitleLeft}px`, top: '50%', transform: 'translateY(-50%)', height: '18px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '15px', lineHeight: '18px', color: '#FFFFFF', ...textSmoothing }}>Управление:</span>
              </div>

              {configBtns.map((btn, index) => {
                const btnLeft = configFirstBtnLeft + (index > 0 ? configBtns.slice(0, index).reduce((sum, b) => sum + b.width + configBtnGap, 0) : 0);
                const isHovered = configHovered === index;
                const isPressed = configPressed === index;
                return (
                  <button key={btn.label}
                    onClick={(e) => { e.stopPropagation(); if (btn.action === 'schablon') handleSchablonClick(e); else if (btn.action === 'settings') handleSettingsClick(e); else console.log(btn.action, uid); }}
                    onMouseEnter={() => setConfigHovered(index)} onMouseLeave={() => { setConfigHovered(null); setConfigPressed(null); }}
                    onMouseDown={() => setConfigPressed(index)} onMouseUp={() => setTimeout(() => setConfigPressed(null), 100)}
                    style={{ ...getGlassBtnStyle(isHovered, isPressed, btn.width, configBtnHeight, '42px'), left: `${btnLeft}px`, top: '50%', justifyContent: 'flex-start', paddingLeft: '15px', gap: '9px' }}>
                    <img src={btn.icon} alt="" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', color: '#FFFFFF', ...textSmoothing }}>{btn.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StationRow;