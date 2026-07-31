// components/elements/Checkbox.tsx
import React from 'react';
import CheckIcon from '../../assets/gal.svg';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  activeBorderColor?: string;
  activeBgColor?: string;
  checkColor?: string;
  checkWidth?: number;
  checkHeight?: number;
  checkSrc?: string;
  borderRadius?: number;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  size = 18,
  borderWidth = 1.5,
  borderColor = '#2D4059',
  activeBorderColor = '#666EFE',
  activeBgColor = '#666EFE',
  checkColor = '#FFFFFF',
  checkWidth = 8,
  checkHeight = 6,
  checkSrc = CheckIcon,
  borderRadius = 3,
  disabled = false,
}) => {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${borderRadius}px`,
        border: `${borderWidth}px solid ${checked ? activeBorderColor : borderColor}`,
        backgroundColor: checked ? activeBgColor : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        boxSizing: 'border-box',
      }}
    >
      {checked && (
        <img src={checkSrc} alt="" style={{ width: `${checkWidth}px`, height: `${checkHeight}px` }} />
      )}
    </div>
  );
};

export default Checkbox;