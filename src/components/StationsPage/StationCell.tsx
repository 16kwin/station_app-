// StationCell.tsx — ПОЛНЫЙ ФАЙЛ
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Импорт стрелок (единые для всех статусов)
import ArrowLeft from '../../assets/Station/arrow-left1.svg';
import ArrowRight from '../../assets/Station/arrow-right1.svg';
import ArrowBack from '../../assets/Station/arrow-back1.svg';

// Импорт картинки станции
import Station from '../../assets/Station/Station.svg';

// Импорт иконок для прогресс-баров
import Icon1 from '../../assets/Station/Icon1.svg';
import Icon2 from '../../assets/Station/Icon2.svg';
import Icon3 from '../../assets/Station/Icon3.svg';

// Импорт иконки ошибки
import ERR from '../../assets/Station/ERR.svg';

// Импорт иконок для информации (новые)
import TMC2 from '../../assets/Station/TMC2.svg';
import SGD2 from '../../assets/Station/SGD2.svg';
import OK2 from '../../assets/Station/OK2.svg';
import CHAIN2 from '../../assets/Station/CHAIN2.svg';

// Импорт иконок для управления (единые)
import Config1 from '../../assets/Station/Config1.svg';
import Config2 from '../../assets/Station/Config2.svg';
import Config3 from '../../assets/Station/Config3.svg';
import Config4 from '../../assets/Station/Config4.svg';
import Config5 from '../../assets/Station/Config5.svg';

// Импорт иконок закладки
import Zaklad1 from '../../assets/Station/Zaklad1.svg';
import Zaklad2 from '../../assets/Station/Zaklad2.svg';

// Импорт иконки графика
import IconGraf from '../../assets/Station/IconGraf.svg';

// Единая иконка остатка для всех статусов
import OstatokIcon from '../../assets/Station/KRIT.svg';

const glassPulseTop = `
@keyframes glassPulseTop {
  0%, 100% { opacity: 0.67; transform: translate(0, 0); }
  50% { opacity: 1; transform: translate(-3px, 3px); }
}
`;

const glassPulseBottom = `
@keyframes glassPulseBottom {
  0%, 100% { opacity: 1; transform: translate(3px, -3px); }
  50% { opacity: 0.67; transform: translate(0, 0); }
}
`;

interface StationCellProps {
  uid?: string;
  name?: string;
  workshop?: string;
  section?: string;
  status?: string;
  stationType?: string;
  parentUid?: string | null;
  hasError?: boolean;
  isTmc?: boolean;
  isSgd?: boolean;
  isOk?: boolean;
  filledCellsPercent?: number;
  remainingNomenclaturePercent?: number;
  readyPartsPercent?: number;
  totalCells?: number;
  filledCells?: number;
  templateNomenclatureCount?: number;
  remainingNomenclatureCount?: number;
  maxReadyParts?: number;
  readyPartsCount?: number;
  onOpenSchablonPopup?: (station: { uid: string; name: string; workshop: string; section: string; status: string }) => void;
}

type CardSide = 'front' | 'back1' | 'back2';

const StationCell: React.FC<StationCellProps> = ({
  uid,
  name,
  workshop,
  section,
  status,
  stationType,
  parentUid,
  hasError = false,
  isTmc,
  isSgd,
  isOk,
  filledCellsPercent = 0,
  remainingNomenclaturePercent = 0,
  readyPartsPercent = 0,
  totalCells = 0,
  filledCells = 0,
  templateNomenclatureCount = 0,
  remainingNomenclatureCount = 0,
  maxReadyParts = 0,
  readyPartsCount = 0,
  onOpenSchablonPopup,
}) => {
  const navigate = useNavigate();
  const [side, setSide] = useState<CardSide>('front');
  const [displaySide, setDisplaySide] = useState<CardSide>('front');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showWorkshopTooltip, setShowWorkshopTooltip] = useState(false);
  
  const [animatedFilled, setAnimatedFilled] = useState(0);
  const [animatedRemaining, setAnimatedRemaining] = useState(0);
  const [animatedReady, setAnimatedReady] = useState(0);
  
  const [startAnimation, setStartAnimation] = useState(false);

  // Состояние закладки
  const [isZakladActive, setIsZakladActive] = useState(false);

  // Состояния для hover/press эффектов кнопок
  const [leftBtnHovered, setLeftBtnHovered] = useState(false);
  const [leftBtnPressed, setLeftBtnPressed] = useState(false);
  const [rightBtnHovered, setRightBtnHovered] = useState(false);
  const [rightBtnPressed, setRightBtnPressed] = useState(false);
  const [refillBtnHovered, setRefillBtnHovered] = useState(false);
  const [refillBtnPressed, setRefillBtnPressed] = useState(false);
  const [zakladBtnHovered, setZakladBtnHovered] = useState(false);
  const [zakladBtnPressed, setZakladBtnPressed] = useState(false);

  // Hover/press для кнопок на Back1
  const [back1BtnHovered, setBack1BtnHovered] = useState(false);
  const [back1BtnPressed, setBack1BtnPressed] = useState(false);
  const [analyticsBtnHovered, setAnalyticsBtnHovered] = useState(false);
  const [analyticsBtnPressed, setAnalyticsBtnPressed] = useState(false);
  const [analyticsIconBtnHovered, setAnalyticsIconBtnHovered] = useState(false);
  const [analyticsIconBtnPressed, setAnalyticsIconBtnPressed] = useState(false);

  // Hover/press для кнопок на Back2 (Управление)
  const [back2BtnHovered, setBack2BtnHovered] = useState(false);
  const [back2BtnPressed, setBack2BtnPressed] = useState(false);
  const [menuHovered, setMenuHovered] = useState<number | null>(null);
  const [menuPressed, setMenuPressed] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!startAnimation) return;
    
    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedFilled(filledCellsPercent * progress);
      setAnimatedRemaining(remainingNomenclaturePercent * progress);
      setAnimatedReady(readyPartsPercent * progress);
      
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedFilled(filledCellsPercent);
        setAnimatedRemaining(remainingNomenclaturePercent);
        setAnimatedReady(readyPartsPercent);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [startAnimation, filledCellsPercent, remainingNomenclaturePercent, readyPartsPercent]);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (status) {
      case 'WORKING':
        return { background: 'linear-gradient(180deg, #5FB0E2 0%, #5D5FEF 100%)' };
      case 'OFFLINE':
        return { background: 'linear-gradient(180deg, #B5B5B5 0%, #777777 77%)' };
      case 'MINIMAL_STOCK':
        return { background: 'linear-gradient(180deg, #F9B38E 0%, #FFAF81 100%)' };
      case 'CRITICAL_STOCK':
        return { background: 'linear-gradient(180deg, #FF6C84 0%, #FF3052 80%)' };
      default:
        return { background: 'linear-gradient(180deg, #B5B5B5 0%, #777777 77%)' };
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'WORKING': return 'В работе';
      case 'OFFLINE': return 'Не в сети';
      case 'MINIMAL_STOCK': return 'Минимальный остаток';
      case 'CRITICAL_STOCK': return 'Критический остаток';
      default: return status || '—';
    }
  };

  const handleFlipLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newSide = side === 'front' ? 'back1' : 'front';
    setSide(newSide);
    
    if (side === 'front') {
      setDisplaySide(newSide);
      setIsAnimating(false);
    } else {
      setTimeout(() => {
        setDisplaySide(newSide);
        setIsAnimating(false);
      }, 600);
    }
  };

  const handleFlipRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newSide = side === 'front' ? 'back2' : 'front';
    setSide(newSide);
    
    if (side === 'front') {
      setDisplaySide(newSide);
      setIsAnimating(false);
    } else {
      setTimeout(() => {
        setDisplaySide(newSide);
        setIsAnimating(false);
      }, 600);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSide('front');
    
    setTimeout(() => {
      setDisplaySide('front');
      setIsAnimating(false);
    }, 600);
  };

  const handleSchablonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSchablonPopup) {
      onOpenSchablonPopup({
        uid: uid || '',
        name: name || '',
        workshop: workshop || '',
        section: section || '',
        status: status || '',
      });
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uid) {
      navigate(`/references/stations/edit/${uid}`);
    }
  };

  const getContainerTransform = () => {
    switch (side) {
      case 'front': return 'rotateY(0deg)';
      case 'back1': return 'rotateY(180deg)';
      case 'back2': return 'rotateY(-180deg)';
      default: return 'rotateY(0deg)';
    }
  };

  const displayName = name || uid || '—';
  const workshopSectionText = `${workshop || '—'} ${section || '—'}`;

  const overNorm = templateNomenclatureCount > 0 ? Math.max(0, templateNomenclatureCount - remainingNomenclatureCount) : 0;

  const isOstatok = status === 'MINIMAL_STOCK' || status === 'CRITICAL_STOCK';

  // Базовый стиль для текста (антиалиасинг)
  const textSmoothing: React.CSSProperties = {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  };

  // Функция для получения стиля стеклянной кнопки с учётом hover/press
  const getGlassButtonStyle = (hovered: boolean, pressed: boolean): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: hovered ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    padding: 0,
    position: 'absolute',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    boxShadow: `
      inset -1px -1px 1px rgba(255, 255, 255, 0.5),
      inset 1px 1px 1px rgba(255, 255, 255, 0.5)
    `,
    transform: pressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'background 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  // Функция для получения стиля нижней стеклянной кнопки
  const getGlassBottomBtnStyle = (hovered: boolean, pressed: boolean, width: number, height: number, borderRadius: string): React.CSSProperties => ({
    background: hovered ? 'rgba(255, 255, 255, 0.30)' : 'rgba(255, 255, 255, 0.17)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    boxShadow: `
      inset -1px -1px 1px rgba(255, 255, 255, 0.5),
      inset 1px 1px 1px rgba(255, 255, 255, 0.5)
    `,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    padding: 0,
    position: 'absolute',
    width: `${width}px`,
    height: `${height}px`,
    borderRadius,
    transform: pressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'background 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });

  // Стиль для стеклянного прогресс-бара (пустая часть)
  const glassProgressBgStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.30)',
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
    boxShadow: `
      inset -1px -1px 1px rgba(255, 255, 255, 0.5),
      inset 1px 1px 1px rgba(255, 255, 255, 0.5)
    `,
  };

  // Позиция левой кнопки: top: 9px, left: 9px
  const leftBtnTop = 9;

  // Остаток: на 13px ниже левой кнопки
  const ostatokTop = leftBtnTop + 34 + 13;
  const ostatokLeft = 16;

  // Ошибка: если есть остаток — на 13px ниже остатка, иначе на 13px ниже левой кнопки
  const errorTop = isOstatok ? ostatokTop + 19 + 13 : ostatokTop;
  const errorLeft = 15;

  // Стеклянный блок иконки: top 30px, высота 70px
  const iconBlockTop = 30;
  const iconBlockHeight = 70;

  // Название станции: на 10px ниже стеклянного блока
  const nameTop = iconBlockTop + iconBlockHeight + 10;
  // Цех/участок: на 1px ниже названия
  const workshopTop = nameTop + 18 + 1;
  // Статус: на 8px ниже цеха
  const statusTop = workshopTop + 16 + 8;

  // Прогресс-бары
  const barsLeft = 45;
  const bar1Top = statusTop + 16 + 7;
  const barWidth = 110;
  const barHeight = 5;
  const barGap = 15;
  const bar2Top = bar1Top + barHeight + barGap;
  const bar3Top = bar2Top + barHeight + barGap;
  const percentLeft = barsLeft + barWidth + 5;

  // Нижние кнопки
  const iconsBlockBottom = statusTop + 16 + 5 + 53;
  const bottomBtnsTop = iconsBlockBottom + 14;
  const refillBtnLeft = 20;
  const refillBtnWidth = 126;
  const refillBtnHeight = 34;
  const zakladBtnLeft = refillBtnLeft + refillBtnWidth + 20;

  const renderFront = () => (
    <>
      {/* Стеклянный блик-круг — правый верхний */}
      <div
        style={{
          position: 'absolute',
          width: '242px',
          height: '242px',
          borderRadius: '50%',
          top: '-132px',
          left: '110px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'glassPulseTop 10s ease-in-out infinite',
        }}
      />

      {/* Стеклянный блик-круг — левый нижний */}
      <div
        style={{
          position: 'absolute',
          width: '306px',
          height: '306px',
          borderRadius: '50%',
          top: '185px',
          left: '-176px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'glassPulseBottom 10s ease-in-out infinite',
        }}
      />

      {/* Левая кнопка */}
      <button
        onClick={handleFlipLeft}
        onMouseEnter={() => setLeftBtnHovered(true)}
        onMouseLeave={() => { setLeftBtnHovered(false); setLeftBtnPressed(false); }}
        onMouseDown={() => setLeftBtnPressed(true)}
        onMouseUp={() => setTimeout(() => setLeftBtnPressed(false), 100)}
        style={{
          ...getGlassButtonStyle(leftBtnHovered, leftBtnPressed),
          left: '9px',
          top: `${leftBtnTop}px`,
        }}
      >
        <img 
          src={ArrowLeft} 
          alt="left" 
          style={{ 
            width: '18px', 
            height: '18px',
            position: 'relative',
            zIndex: 3,
          }} 
        />
      </button>

      {/* Правая кнопка */}
      <button
        onClick={handleFlipRight}
        onMouseEnter={() => setRightBtnHovered(true)}
        onMouseLeave={() => { setRightBtnHovered(false); setRightBtnPressed(false); }}
        onMouseDown={() => setRightBtnPressed(true)}
        onMouseUp={() => setTimeout(() => setRightBtnPressed(false), 100)}
        style={{
          ...getGlassButtonStyle(rightBtnHovered, rightBtnPressed),
          right: '9px',
          top: '9px',
        }}
      >
        <img 
          src={ArrowRight} 
          alt="right" 
          style={{ 
            width: '16px', 
            height: '14px',
            position: 'relative',
            zIndex: 3,
          }} 
        />
      </button>

      {/* Иконка остатка */}
      {isOstatok && (
        <img
          src={OstatokIcon}
          alt="ostatok"
          style={{
            position: 'absolute',
            left: `${ostatokLeft}px`,
            top: `${ostatokTop}px`,
            width: '20px',
            height: '19px',
            zIndex: 2,
          }}
        />
      )}

      {/* Иконка ошибки */}
      {hasError && (
        <img
          src={ERR}
          alt="error"
          style={{
            position: 'absolute',
            left: `${errorLeft}px`,
            top: `${errorTop}px`,
            width: '21px',
            height: '12px',
            zIndex: 2,
          }}
        />
      )}

      {/* Стеклянный контейнер с иконкой станции */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70px',
          height: '70px',
          borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.30)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          boxShadow: `
            inset -1px -1px 1px rgba(255, 255, 255, 0.5),
            inset 1px 1px 1px rgba(255, 255, 255, 0.5),
            0 0 15px rgba(255, 255, 255, 0.3)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <img
          src={Station}
          alt="Station"
          style={{
            width: '48px',
            height: '54px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
          }}
        />
      </div>

      {/* Название станции */}
      <div
        style={{
          position: 'absolute',
          top: `${nameTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
        onMouseEnter={() => setShowNameTooltip(true)}
        onMouseLeave={() => setShowNameTooltip(false)}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            lineHeight: '18px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            maxWidth: '150px',
            ...textSmoothing,
          }}
        >
          {displayName}
        </div>
        {showNameTooltip && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '4px',
              padding: '4px 8px',
              backgroundColor: 'rgba(45, 64, 89, 0.9)',
              color: '#FFFFFF',
              fontSize: '12px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
          >
            {displayName}
          </div>
        )}
      </div>

      {/* Цех/участок */}
      <div
        style={{
          position: 'absolute',
          top: `${workshopTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
        onMouseEnter={() => setShowWorkshopTooltip(true)}
        onMouseLeave={() => setShowWorkshopTooltip(false)}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            maxWidth: '150px',
            ...textSmoothing,
          }}
        >
          {workshopSectionText}
        </div>
        {showWorkshopTooltip && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '4px',
              padding: '4px 8px',
              backgroundColor: 'rgba(45, 64, 89, 0.9)',
              color: '#FFFFFF',
              fontSize: '12px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
          >
            {workshopSectionText}
          </div>
        )}
      </div>

      {/* Статус */}
      <div
        style={{
          position: 'absolute',
          top: `${statusTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: '16px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            ...textSmoothing,
          }}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Блок иконок прогресс-баров */}
      <div
        style={{
          position: 'absolute',
          left: '21px',
          top: `${statusTop + 16 + 5}px`,
          width: '17px',
          height: '53px',
          zIndex: 1,
        }}
      >
        <img
          src={Icon1}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '17px',
            height: '9px',
          }}
        />
        <img
          src={Icon2}
          alt=""
          style={{
            position: 'absolute',
            top: '17.5px',
            left: '2px',
            width: '13px',
            height: '14px',
          }}
        />
        <img
          src={Icon3}
          alt=""
          style={{
            position: 'absolute',
            top: '39px',
            left: '4px',
            width: '9px',
            height: '14px',
          }}
        />
      </div>

      {/* Прогресс-бар 1 */}
      <div
        style={{
          position: 'absolute',
          left: `${barsLeft}px`,
          top: `${bar1Top}px`,
          width: `${barWidth}px`,
          height: `${barHeight}px`,
          borderRadius: '2.5px',
          overflow: 'hidden',
          ...glassProgressBgStyle,
        }}
      >
        <div
          style={{
            width: `${Math.min(animatedFilled, 100)}%`,
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '2.5px',
            transition: 'width 0.05s linear',
          }}
        />
      </div>

      {/* Процент 1 */}
      <div
        style={{
          position: 'absolute',
          left: `${percentLeft}px`,
          top: `${bar1Top}px`,
          height: `${barHeight}px`,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '12px',
          letterSpacing: '2%',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          ...textSmoothing,
        }}
      >
        {Math.round(animatedFilled)}%
      </div>

      {/* Прогресс-бар 2 */}
      <div
        style={{
          position: 'absolute',
          left: `${barsLeft}px`,
          top: `${bar2Top}px`,
          width: `${barWidth}px`,
          height: `${barHeight}px`,
          borderRadius: '2.5px',
          overflow: 'hidden',
          ...glassProgressBgStyle,
        }}
      >
        <div
          style={{
            width: `${Math.min(animatedRemaining, 100)}%`,
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '2.5px',
            transition: 'width 0.05s linear',
          }}
        />
      </div>

      {/* Процент 2 */}
      <div
        style={{
          position: 'absolute',
          left: `${percentLeft}px`,
          top: `${bar2Top}px`,
          height: `${barHeight}px`,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '12px',
          letterSpacing: '2%',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          ...textSmoothing,
        }}
      >
        {Math.round(animatedRemaining)}%
      </div>

      {/* Прогресс-бар 3 */}
      <div
        style={{
          position: 'absolute',
          left: `${barsLeft}px`,
          top: `${bar3Top}px`,
          width: `${barWidth}px`,
          height: `${barHeight}px`,
          borderRadius: '2.5px',
          overflow: 'hidden',
          ...glassProgressBgStyle,
        }}
      >
        <div
          style={{
            width: `${Math.min(animatedReady, 100)}%`,
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '2.5px',
            transition: 'width 0.05s linear',
          }}
        />
      </div>

      {/* Процент 3 */}
      <div
        style={{
          position: 'absolute',
          left: `${percentLeft}px`,
          top: `${bar3Top}px`,
          height: `${barHeight}px`,
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '12px',
          letterSpacing: '2%',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          ...textSmoothing,
        }}
      >
        {Math.round(animatedReady)}%
      </div>

      {/* Кнопка "Пополнить" */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Пополнить');
        }}
        onMouseEnter={() => setRefillBtnHovered(true)}
        onMouseLeave={() => { setRefillBtnHovered(false); setRefillBtnPressed(false); }}
        onMouseDown={() => setRefillBtnPressed(true)}
        onMouseUp={() => setTimeout(() => setRefillBtnPressed(false), 100)}
        style={{
          ...getGlassBottomBtnStyle(refillBtnHovered, refillBtnPressed, refillBtnWidth, refillBtnHeight, `${refillBtnHeight}px`),
          left: `${refillBtnLeft}px`,
          top: `${bottomBtnsTop}px`,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '1%',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            ...textSmoothing,
          }}
        >
          Пополнить
        </span>
      </button>

      {/* Круглая кнопка закладки */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsZakladActive(!isZakladActive);
        }}
        onMouseEnter={() => setZakladBtnHovered(true)}
        onMouseLeave={() => { setZakladBtnHovered(false); setZakladBtnPressed(false); }}
        onMouseDown={() => setZakladBtnPressed(true)}
        onMouseUp={() => setTimeout(() => setZakladBtnPressed(false), 100)}
        style={{
          ...getGlassBottomBtnStyle(zakladBtnHovered, zakladBtnPressed, 34, 34, '50%'),
          left: `${zakladBtnLeft}px`,
          top: `${bottomBtnsTop}px`,
        }}
      >
        <img 
          src={isZakladActive ? Zaklad2 : Zaklad1} 
          alt="zaklad" 
          style={{ 
            width: '10px', 
            height: '14px',
            position: 'relative',
            zIndex: 3,
          }} 
        />
      </button>
    </>
  );

  // Позиции для Back1
  const back1BtnLeft = 9;
  const back1BtnTop = 9;
  const back1TitleTop = 16;
  const back1TitleLeft = back1BtnLeft + 34 + 21;
  const back1NameTop = back1TitleTop + 20 + 15;
  const back1IconsTop = back1NameTop + 18 + 9;
  const back1RowsTop = back1IconsTop + 17 + 15;
  const back1RowHeight = 17;
  const back1RowGap = 15;
  const back1AnalyticsTop = back1RowsTop + 4 * back1RowHeight + 3 * back1RowGap + 18;

  const renderBack1 = () => (
    <>
      {/* Кнопка Back */}
      <button
        onClick={handleBack}
        onMouseEnter={() => setBack1BtnHovered(true)}
        onMouseLeave={() => { setBack1BtnHovered(false); setBack1BtnPressed(false); }}
        onMouseDown={() => setBack1BtnPressed(true)}
        onMouseUp={() => setTimeout(() => setBack1BtnPressed(false), 100)}
        style={{
          ...getGlassButtonStyle(back1BtnHovered, back1BtnPressed),
          left: `${back1BtnLeft}px`,
          top: `${back1BtnTop}px`,
        }}
      >
        <img 
          src={ArrowBack} 
          alt="back" 
          style={{ 
            width: '18px', 
            height: '18px',
            position: 'relative',
            zIndex: 3,
          }} 
        />
      </button>

      {/* Заголовок "Информация" */}
      <div
        style={{
          position: 'absolute',
          top: `${back1TitleTop}px`,
          left: `${back1TitleLeft}px`,
          height: '20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#FFFFFF',
            ...textSmoothing,
          }}
        >
          Информация
        </span>
      </div>

      {/* Название станции */}
      <div
        style={{
          position: 'absolute',
          top: `${back1NameTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            lineHeight: '18px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            ...textSmoothing,
          }}
        >
          {displayName}
        </span>
      </div>

      {/* Иконки TMC2, SGD2, OK2, CHAIN2 */}
      <div
        style={{
          position: 'absolute',
          top: `${back1IconsTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
        }}
      >
        {isTmc && <img src={TMC2} alt="TMC" style={{ width: '30px', height: '17px' }} />}
        {isSgd && <img src={SGD2} alt="SGD" style={{ width: '30px', height: '17px' }} />}
        {isOk && <img src={OK2} alt="OK" style={{ width: '30px', height: '17px' }} />}
        {parentUid && <img src={CHAIN2} alt="CHAIN" style={{ width: '30px', height: '17px' }} />}
      </div>

      {/* 4 строки данных */}
      {[
        { label: 'ТМЦ в станции', value: totalCells },
        { label: 'Выдано ТМЦ', value: filledCells },
        { label: 'Выдано сверхнормы', value: overNorm },
        { label: 'Готовые детали', value: readyPartsCount },
      ].map((row, index) => (
        <div
          key={row.label}
          style={{
            position: 'absolute',
            top: `${back1RowsTop + index * (back1RowHeight + back1RowGap)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '193px',
            height: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '17px',
              color: '#FFFFFF',
              ...textSmoothing,
            }}
          >
            {row.label}
          </span>
          <div
            style={{
              width: '40px',
              height: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: '17px',
                color: '#FFFFFF',
                ...textSmoothing,
              }}
            >
              {row.value}
            </span>
          </div>
        </div>
      ))}

      {/* Кнопка "Аналитика" */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Аналитика');
        }}
        onMouseEnter={() => setAnalyticsBtnHovered(true)}
        onMouseLeave={() => { setAnalyticsBtnHovered(false); setAnalyticsBtnPressed(false); }}
        onMouseDown={() => setAnalyticsBtnPressed(true)}
        onMouseUp={() => setTimeout(() => setAnalyticsBtnPressed(false), 100)}
        style={{
          ...getGlassBottomBtnStyle(analyticsBtnHovered, analyticsBtnPressed, 126, 34, '34px'),
          left: '20px',
          top: `${back1AnalyticsTop}px`,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '1%',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            ...textSmoothing,
          }}
        >
          Аналитика
        </span>
      </button>

      {/* Круглая кнопка с иконкой графика */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('График');
        }}
        onMouseEnter={() => setAnalyticsIconBtnHovered(true)}
        onMouseLeave={() => { setAnalyticsIconBtnHovered(false); setAnalyticsIconBtnPressed(false); }}
        onMouseDown={() => setAnalyticsIconBtnPressed(true)}
        onMouseUp={() => setTimeout(() => setAnalyticsIconBtnPressed(false), 100)}
        style={{
          ...getGlassBottomBtnStyle(analyticsIconBtnHovered, analyticsIconBtnPressed, 34, 34, '50%'),
          left: '166px',
          top: `${back1AnalyticsTop}px`,
        }}
      >
        <img 
          src={IconGraf} 
          alt="graf" 
          style={{ 
            width: '16px', 
            height: '18px',
            position: 'relative',
            zIndex: 3,
          }} 
        />
      </button>
    </>
  );

  // Позиции для Back2 (Управление)
  const back2BtnRight = 9;
  const back2BtnTop = 9;
  const back2TitleTop = 16;
  const back2NameTop = back2TitleTop + 20 + 15;
  const back2WorkshopTop = back2NameTop + 18 + 2;
  const back2MenuFirstTop = back2WorkshopTop + 16 + 19;
  const back2MenuLeft = 25;
  const back2MenuGap = 21;
  const back2MenuHeight = 18;

  const menuItems = [
    { label: 'Шаблоны загрузки', icon: Config1, action: 'schablon' },
    { label: 'Карта загрузки', icon: Config2, action: 'map' },
    { label: 'Списание', icon: Config3, action: 'writeoff' },
    { label: 'Видео', icon: Config4, action: 'video' },
    { label: 'Настройки станции', icon: Config5, action: 'settings' },
  ];

  const renderBack2 = () => (
    <>
      {/* Кнопка Back справа */}
      <button
        onClick={handleBack}
        onMouseEnter={() => setBack2BtnHovered(true)}
        onMouseLeave={() => { setBack2BtnHovered(false); setBack2BtnPressed(false); }}
        onMouseDown={() => setBack2BtnPressed(true)}
        onMouseUp={() => setTimeout(() => setBack2BtnPressed(false), 100)}
        style={{
          ...getGlassButtonStyle(back2BtnHovered, back2BtnPressed),
          right: `${back2BtnRight}px`,
          top: `${back2BtnTop}px`,
        }}
      >
        <img 
          src={ArrowBack} 
          alt="back" 
          style={{ 
            width: '18px', 
            height: '18px',
            transform: 'rotate(180deg)',
            position: 'relative',
            zIndex: 3,
          }} 
        />
      </button>

      {/* Заголовок "Управление" */}
      <div
        style={{
          position: 'absolute',
          top: `${back2TitleTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#FFFFFF',
            ...textSmoothing,
          }}
        >
          Управление
        </span>
      </div>

      {/* Название станции */}
      <div
        style={{
          position: 'absolute',
          top: `${back2NameTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            lineHeight: '18px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            ...textSmoothing,
          }}
        >
          {displayName}
        </span>
      </div>

      {/* Цех/участок */}
      <div
        style={{
          position: 'absolute',
          top: `${back2WorkshopTop}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '150px',
            ...textSmoothing,
          }}
        >
          {workshopSectionText}
        </span>
      </div>

      {/* 5 строк меню */}
      {menuItems.map((item, index) => {
        const isHovered = menuHovered === index;
        const isPressed = menuPressed === index;
        const scale = isPressed ? 0.95 : isHovered ? 1.05 : 1;

        return (
          <div
            key={item.label}
            style={{
              position: 'absolute',
              top: `${back2MenuFirstTop + index * (back2MenuHeight + back2MenuGap)}px`,
              left: `${back2MenuLeft}px`,
              height: `${back2MenuHeight}px`,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transform: `scale(${scale})`,
              transformOrigin: 'left center',
              transition: 'transform 0.12s ease',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (item.action === 'schablon') handleSchablonClick(e);
              else if (item.action === 'settings') handleSettingsClick(e);
              else console.log(item.action);
            }}
            onMouseEnter={() => setMenuHovered(index)}
            onMouseLeave={() => { setMenuHovered(null); setMenuPressed(null); }}
            onMouseDown={() => setMenuPressed(index)}
            onMouseUp={() => setTimeout(() => setMenuPressed(null), 100)}
          >
            <img 
              src={item.icon} 
              alt="" 
              style={{ 
                width: '18px', 
                height: '18px',
              }} 
            />
            <span
              style={{
                marginLeft: '12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '18px',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                ...textSmoothing,
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      <style>{glassPulseTop}</style>
      <style>{glassPulseBottom}</style>
      <div
        style={{
          width: '220px',
          height: '295px',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'visible',
          perspective: '1000px',
          backgroundColor: 'transparent',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: getContainerTransform(),
            backgroundColor: 'transparent',
          }}
        >
          {/* Front */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: 'transparent',
              zIndex: displaySide === 'front' ? 2 : 1,
              willChange: 'transform',
              ...getBackgroundStyle(),
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '12px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'transparent',
              }}
            >
              {renderFront()}
            </div>
          </div>

          {/* Back1 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '20px',
              overflow: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'transparent',
              zIndex: displaySide === 'back1' ? 2 : 1,
              willChange: 'transform',
              ...getBackgroundStyle(),
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '12px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'transparent',
              }}
            >
              {renderBack1()}
            </div>
          </div>

          {/* Back2 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '20px',
              overflow: 'hidden',
              transform: 'rotateY(-180deg)',
              backgroundColor: 'transparent',
              zIndex: displaySide === 'back2' ? 2 : 1,
              willChange: 'transform',
              ...getBackgroundStyle(),
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '12px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'transparent',
              }}
            >
              {renderBack2()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StationCell;