// components/LockScreen/LockScreen.tsx — кнопка вынесена из flex, скроллы работают
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../services/AuthContext';
import LOGO from '../../assets/LOGO.svg';
import EyeIconSvg from '../../assets/Eye.svg';
import EyeOffIconSvg from '../../assets/EyeOff.svg';
import EyeRedIconSvg from '../../assets/EyeRed.svg';
import EyeOffRedIconSvg from '../../assets/EyeOffRed.svg';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { userInfo, checkPassword } = useAuth();
  const [lockState, setLockState] = useState<'locked' | 'unlocking' | 'shaking'>('locked');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);

  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isLoaded, setIsLoaded] = useState(false);

  const MIN_WIDTH = 1920; const MIN_HEIGHT = 900; const MAX_WIDTH = 1920; const MAX_HEIGHT = 1080;

  useEffect(() => {
    const width = window.innerWidth; const height = window.innerHeight;
    let finalWidth = width; let finalHeight = height;
    if (width < MIN_WIDTH || height < MIN_HEIGHT) { finalWidth = MIN_WIDTH; finalHeight = MIN_HEIGHT; }
    if (width > MAX_WIDTH || height > MAX_HEIGHT) { finalWidth = MAX_WIDTH; finalHeight = MAX_HEIGHT; }
    setWindowSize({ width: finalWidth, height: finalHeight });
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setShowForm(false);
    setPassword('');
    setError('');
    setSuccessMessage('');
    setHasError(false);
    setHasSuccess(false);
  }, []);

  useEffect(() => {
    if (showForm) {
      setLockState('locked');
      const timer = setTimeout(() => {
        const input = document.querySelector('input[type="password"]') as HTMLInputElement;
        if (input) input.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.length) return;
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    setLockState('locked');
    setHasError(false);
    setHasSuccess(false);

    const isValid = await checkPassword(password);
    
    if (isValid) {
      setLockState('unlocking');
      setSuccessMessage('Пароль введен успешно!');
      setHasSuccess(true);
      setTimeout(() => {
        setPassword('');
        onUnlock();
      }, 600);
    } else {
      setLockState('shaking');
      setError('Пароль введен неправильно! Повторите попытку');
      setHasError(true);
      setPassword('');
      setTimeout(() => {
        setLockState('locked');
      }, 500);
    }
    
    setIsLoading(false);
  };

  const isButtonActive = password.length > 0;

  const getBorderColor = (): string => {
    if (hasError) return '#FF3052';
    if (hasSuccess) return '#0BD949';
    if (password.length > 0) return '#666EFE';
    return 'rgba(45, 64, 89, 0.5)';
  };

  const getEyeIcon = (): string => {
    if (hasError) return showPassword ? EyeRedIconSvg : EyeOffRedIconSvg;
    if (hasSuccess) return showPassword ? EyeIconSvg : EyeOffIconSvg;
    return showPassword ? EyeIconSvg : EyeOffIconSvg;
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full h-dvh relative overflow-auto" style={{ minWidth: `${windowSize.width}px`, minHeight: `${windowSize.height}px` }}>
      <div className="w-full h-full flex items-center justify-center">
        <div style={{ width: `${windowSize.width}px`, height: `${windowSize.height}px` }} className="relative">
          <style>{`
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px white inset !important;
              -webkit-text-fill-color: #2D4059 !important;
              transition: background-color 5000s ease-in-out 0s;
              font-size: 18px !important;
              font-family: Inter, sans-serif !important;
            }
          `}</style>
          <AnimatePresence mode="wait">
            {!showForm && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '100%',
                  paddingTop: '181px',
                  paddingBottom: '120px',
                }}
              >
                <div className="flex flex-col items-center">
                  <img src={LOGO} alt="logo" draggable={false} style={{ width: '322px', height: '279px', pointerEvents: 'none', userSelect: 'none' }} />
                  <div style={{ height: '67px', display: 'flex', alignItems: 'center', marginTop: '25px' }}>
                    <h1 style={{ fontSize: '55px', fontWeight: 800, letterSpacing: '3px', fontFamily: 'Inter, sans-serif', color: '#FFFFFF', margin: 0 }}>ДИНАМИКА:AWMS</h1>
                  </div>
                  <div style={{ width: '574px', height: '2px', marginTop: '15px', background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)' }} />
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center', marginTop: '15px' }}>
                    <p style={{ fontSize: '30px', fontWeight: 600, letterSpacing: '1px', fontFamily: 'Inter, sans-serif', color: '#FFFFFF', margin: 0 }}>СИСТЕМА УПРАВЛЕНИЯ АВТОМАТИЧЕСКИМИ СКЛАДАМИ</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(true)} style={{ width: '399px', height: '59px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.24)', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600, cursor: 'pointer' }}>Разблокировать</button>
              </motion.div>
            )}

            {showForm && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl flex flex-col items-center relative"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '480px', height: '426px' }}
                >
                  <div className="bg-[#666EFE] rounded-full flex items-center justify-center" style={{ width: '76px', height: '76px', marginTop: '30px' }}>
                    <span className="text-white font-bold" style={{ fontSize: '30px' }}>{userInfo.firstName?.charAt(0) || userInfo.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div style={{ height: '31px', display: 'flex', alignItems: 'center', marginTop: '15px' }}>
                    <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '26px', fontWeight: 600, color: '#2D4059', margin: 0 }}>{userInfo.firstName || userInfo.name || 'Пользователь'}</h2>
                  </div>
                  <div style={{ height: '23px', display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '19px', fontWeight: 500, color: '#2D4059', margin: 0, opacity: 0.5 }}>Введите пароль для разблокировки</p>
                  </div>
                  <motion.div
                    className="bg-white rounded-full flex items-center justify-center shadow-md relative"
                    style={{ width: '40px', height: '40px', marginTop: '10px' }}
                    animate={lockState}
                    variants={{ locked: { x: 0 }, shaking: { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.4 } }, unlocking: { x: 0 } }}
                  >
                    <motion.svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="absolute" animate={lockState} variants={{ locked: { opacity: 1 }, shaking: { opacity: 1 }, unlocking: { opacity: 0 } }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ transform: 'scaleX(-1)' }}>
                      <path d="M8 0C4.8 0 2.1226 1.50344 2.28572 5.25V7.875H1.33333C0.594667 7.875 0 8.40021 0 9.1125V16.7143C0 17.4266 0.594667 18 1.33333 18H14.6667C15.4053 18 16 17.4266 16 16.7143V9.1125C16 8.40021 15.4159 7.875 14.6667 7.875H13.7143V5.25C13.7143 1.5 11.2 0 8 0ZM8 2.25C9.6 2.25 11.4286 2.79084 11.4286 5.25V7.875H4.57143V5.25C4.57143 2.81517 6.4 2.25 8 2.25Z" fill="#2D4059"/>
                    </motion.svg>
                    <motion.svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="absolute" animate={lockState} variants={{ locked: { opacity: 0 }, shaking: { opacity: 0 }, unlocking: { opacity: 1 } }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ transform: 'scaleX(-1)' }}>
                      <path d="M3.01271 2.1783L4.79983 3.9375C5.33899 2.60031 6.74033 2.25 8 2.25C9.6 2.25 11.4286 2.79084 11.4286 5.25V7.875H4.57143H2.28572H1.33333C0.594667 7.875 0 8.40021 0 9.1125V16.7143C0 17.4266 0.594667 18 1.33333 18H14.6667C15.4053 18 16 17.4266 16 16.7143V9.1125C16 8.40021 15.4159 7.875 14.6667 7.875H13.7143V5.25C13.7143 1.5 11.2 0 8 0C5.88756 0 4.00286 0.655171 3.01271 2.1783Z" fill="#2D4059"/>
                    </motion.svg>
                  </motion.div>
                  <div style={{ width: '399px', height: '59px', marginTop: '14px', position: 'relative' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '8px', border: `2px solid ${getBorderColor()}`, display: 'flex', alignItems: 'center', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}>
                      <input style={{ fontSize: '18px', fontWeight: 400, fontFamily: 'Inter, sans-serif', paddingLeft: '16px', paddingRight: '8px', flex: 1, height: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#2D4059', borderRadius: '8px', boxShadow: '0 0 0 30px white inset', WebkitBoxShadow: '0 0 0 30px white inset', WebkitTextFillColor: '#2D4059', caretColor: '#2D4059' }} placeholder="Введите пароль" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setHasError(false); setHasSuccess(false); }} disabled={isLoading} />
                      <motion.button type="button" onClick={() => setShowPassword(!showPassword)} whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '16px' }}>
                        <motion.img key={showPassword ? 'eye' : 'eyeoff'} src={getEyeIcon()} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ width: '24px', height: '24px', position: 'absolute' }} />
                      </motion.button>
                    </div>
                  </div>
                  <div style={{ height: '18px', display: 'flex', alignItems: 'center', marginTop: '8px', width: '399px', justifyContent: 'center' }}>
                    {(error || successMessage) && <p style={{ fontSize: '15px', fontWeight: 400, fontFamily: 'Inter, sans-serif', color: error ? '#FF3052' : '#0BD949', margin: 0 }}>{error || successMessage}</p>}
                  </div>
                  <button type="submit" disabled={isLoading || !isButtonActive} onClick={handleSubmit} style={{ width: '399px', height: '59px', borderRadius: '10px', border: 'none', fontSize: '17px', fontWeight: 600, fontFamily: 'Inter, sans-serif', backgroundColor: '#666EFE', color: '#FFFFFF', opacity: isButtonActive ? 1 : 0.5, cursor: isButtonActive ? 'pointer' : 'not-allowed', position: 'absolute', bottom: '20px' }}>{isLoading ? 'Проверка...' : 'Разблокировать'}</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;