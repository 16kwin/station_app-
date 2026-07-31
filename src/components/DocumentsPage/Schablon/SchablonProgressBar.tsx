// SchablonProgressBar.tsx — ПОЛНЫЙ ФАЙЛ
import React from 'react';
import BarIcon11 from '../../../assets/Schablon/BarIcon11.svg';
import BarIcon12 from '../../../assets/Schablon/BarIcon12.svg';
import BarIcon21 from '../../../assets/Schablon/BarIcon21.svg';
import BarIcon22 from '../../../assets/Schablon/BarIcon22.svg';
import BarIcon31 from '../../../assets/Schablon/BarIcon31.svg';
import BarIcon32 from '../../../assets/Schablon/BarIcon32.svg';

interface SchablonProgressBarProps {
  currentStep: number;
  onClick?: () => void;
}

const SchablonProgressBar: React.FC<SchablonProgressBarProps> = ({ currentStep, onClick }) => {
  const barWidth = 477;
  const barHeight = 5;
  const pipWidth = 4;
  const pipHeight = 10;
  const pipRadius = 3;
  const iconSize = 20;
  const iconGap = 6;

  const pipPositions = [93, 231, 369];
  const fillPositions = [0, 162, 300, 477];

  const steps = [
    { 
      label: 'Шаблон загрузки',
      iconInactive: BarIcon11, 
      iconActive: BarIcon12,
      isSingleLine: true,
    },
    { 
      labelLine1: 'Документ',
      labelLine2: 'Пополнение станции',
      iconInactive: BarIcon21, 
      iconActive: BarIcon22,
      isSingleLine: false,
    },
    { 
      label: 'Загрузка станции',
      iconInactive: BarIcon31, 
      iconActive: BarIcon32,
      isSingleLine: true,
    },
  ];

  const getPipColor = (index: number) => {
    if (index >= currentStep) return 'rgba(45, 64, 89, 0.25)';
    return '#666EFE';
  };

  const getLabelColor = (index: number) => {
    return index < currentStep ? '#2D4059' : 'rgba(45, 64, 89, 0.44)';
  };

  const fillWidth = fillPositions[currentStep];

  return (
    <div 
      onClick={onClick}
      style={{ width: barWidth, height: 85, position: 'relative', flexShrink: 0, cursor: onClick ? 'pointer' : 'default', backgroundColor: '#FAFBFF' }}
    >
      {/* Иконки */}
      {pipPositions.map((pos, index) => (
        <img 
          key={`icon-${index}`}
          src={index < currentStep ? steps[index].iconActive : steps[index].iconInactive}
          alt=""
          style={{
            position: 'absolute',
            left: pos - iconSize / 2,
            bottom: barHeight + pipHeight + iconGap,
            width: iconSize,
            height: iconSize,
          }}
        />
      ))}

      {/* Подписи */}
      {pipPositions.map((pos, index) => {
        const step = steps[index];
        return (
          <div 
            key={`label-${index}`} 
            style={{ 
              position: 'absolute', 
              left: pos, 
              bottom: barHeight + pipHeight + iconGap + iconSize + 4, 
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {step.isSingleLine ? (
              <span style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontSize: 11, 
                fontWeight: 600, 
                color: getLabelColor(index), 
                whiteSpace: 'nowrap', 
                textAlign: 'center', 
                lineHeight: '13px' 
              }}>
                {step.label}
              </span>
            ) : (
              <>
                <span style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: getLabelColor(index), 
                  whiteSpace: 'nowrap', 
                  textAlign: 'center', 
                  lineHeight: '13px' 
                }}>
                  {step.labelLine1}
                </span>
                <span style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: getLabelColor(index), 
                  whiteSpace: 'nowrap', 
                  textAlign: 'center', 
                  lineHeight: '13px' 
                }}>
                  {step.labelLine2}
                </span>
              </>
            )}
          </div>
        );
      })}

      {/* Фоновая полоса */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: barWidth, height: barHeight, borderRadius: barHeight / 2, backgroundColor: 'rgba(45, 64, 89, 0.15)', pointerEvents: 'none' }} />
      
      {/* Заполненная полоса — всегда рендерим для анимации */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: fillWidth,
        height: barHeight,
        borderRadius: barHeight / 2,
        backgroundColor: '#666EFE',
        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      }} />
      
      {/* Пипки */}
      {pipPositions.map((pos, index) => (
        <div key={`pip-${index}`} style={{
          position: 'absolute',
          left: pos - pipWidth / 2,
          bottom: barHeight,
          width: pipWidth,
          height: pipHeight,
          borderTopLeftRadius: pipRadius,
          borderTopRightRadius: pipRadius,
          backgroundColor: getPipColor(index),
          transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
};

export default SchablonProgressBar;