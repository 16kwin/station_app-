// components/loginPage/LoginPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../services/AuthContext';
import AxiosService from '../../services/AxiosService';
import ConstantInfo from '../../info/ConstantInfo';
import type { AxiosError } from 'axios';
import LOGO from '../../assets/LOGO.svg';
import LOGIN_IMAGE from '../../assets/Login.svg';
import Hand from '../../assets/Hand.svg';
import Checkbox from '../elements/Checkbox';
import EyeIconSvg from '../../assets/Eye.svg';
import EyeOffIconSvg from '../../assets/EyeOff.svg';
import EyeRedIconSvg from '../../assets/EyeRed.svg';
import EyeOffRedIconSvg from '../../assets/EyeOffRed.svg';

interface CircleData {
  id: number;
  bornAt: number;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuth, setLocked } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const skipSplash = searchParams.get('skipSplash') === 'true';
  const [showForm, setShowForm] = useState(skipSplash);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const [windowSize, setWindowSize] = useState({ width: 1920, height: 960 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setTick] = useState(0);
  const circlesRef = useRef<CircleData[]>([]);
  const nextIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

  const MIN_WIDTH = 1920; const MIN_HEIGHT = 900; const MAX_WIDTH = 1920; const MAX_HEIGHT = 960;

  useEffect(() => {
    const width = window.innerWidth; const height = window.innerHeight;
    let finalWidth = width; let finalHeight = height;
    if (width < MIN_WIDTH || height < MIN_HEIGHT) { finalWidth = MIN_WIDTH; finalHeight = MIN_HEIGHT; }
    if (width > MAX_WIDTH || height > MAX_HEIGHT) { finalWidth = MAX_WIDTH; finalHeight = MAX_HEIGHT; }
    setWindowSize({ width: finalWidth, height: finalHeight });
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setUsername('');
    setPassword('');
    setMessage('');
    setHasError(false);
  }, [showForm]);

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (showForm) {
        inactivityTimerRef.current = setTimeout(() => {
          setShowForm(false);
        }, INACTIVITY_TIMEOUT);
      }
    };

    resetInactivityTimer();

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetInactivityTimer));

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => document.removeEventListener(event, resetInactivityTimer));
    };
  }, [showForm]);

  useEffect(() => {
    if (!showForm) {
      const LIFE_DURATION = 6000;
      const SPAWN_DELAY = 2000;

      startTimeRef.current = performance.now();
      lastSpawnTimeRef.current = 0;
      circlesRef.current = [{ id: nextIdRef.current++, bornAt: 0 }];

      const animate = () => {
        const now = performance.now() - startTimeRef.current;
        
        circlesRef.current = circlesRef.current.filter(c => {
          const age = now - c.bornAt;
          return age < LIFE_DURATION;
        });

        if (now - lastSpawnTimeRef.current >= SPAWN_DELAY) {
          lastSpawnTimeRef.current = now;
          circlesRef.current.push({ id: nextIdRef.current++, bornAt: now });
        }

        setTick(prev => prev + 1);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    } else {
      circlesRef.current = [];
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [showForm]);

  const getCircleStyle = (circle: CircleData): React.CSSProperties => {
    const now = performance.now() - startTimeRef.current;
    const age = now - circle.bornAt;

    const LIFE_DURATION = 6000;
    const FADE_IN_END = 2000;
    const GROWTH_END = 4000;

    const START_SIZE = 40;
    const MID_SIZE = 80;
    const FADE_START_SIZE = 120;
    const MAX_SIZE = 160;

    let sizeRatio: number;
    if (age < FADE_IN_END) {
      const p = age / FADE_IN_END;
      sizeRatio = (START_SIZE + (MID_SIZE - START_SIZE) * p) / START_SIZE;
    } else if (age < GROWTH_END) {
      const p = (age - FADE_IN_END) / (GROWTH_END - FADE_IN_END);
      const currentSize = MID_SIZE + (FADE_START_SIZE - MID_SIZE) * p;
      sizeRatio = currentSize / START_SIZE;
    } else {
      const p = (age - GROWTH_END) / (LIFE_DURATION - GROWTH_END);
      const currentSize = FADE_START_SIZE + (MAX_SIZE - FADE_START_SIZE) * p;
      sizeRatio = currentSize / START_SIZE;
    }

    let opacity = 0;
    if (age < FADE_IN_END) {
      opacity = (age / FADE_IN_END) * 0.4;
    } else if (age < GROWTH_END) {
      opacity = 0.4;
    } else if (age < LIFE_DURATION) {
      const fadeOutProgress = (age - GROWTH_END) / (LIFE_DURATION - GROWTH_END);
      opacity = 0.4 * (1 - fadeOutProgress);
    }

    return {
      position: 'absolute' as const,
      width: `${START_SIZE}px`,
      height: `${START_SIZE}px`,
      borderRadius: '50%',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) scale(${sizeRatio})`,
      background: `radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,${opacity}) 80%, rgba(255,255,255,${opacity}) 100%)`,
      pointerEvents: 'none' as const,
      willChange: 'transform, opacity',
    };
  };

  const savePasswordToBrowser = (user: string, pass: string) => {
    setTimeout(() => {
      try {
        if ((window as any).PasswordCredential && navigator.credentials) {
          const cred = new (window as any).PasswordCredential({ id: user, password: pass, name: user });
          navigator.credentials.store(cred).catch(() => {});
        }
      } catch (e) {}
    }, 500);

    setTimeout(() => {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.write(`<!DOCTYPE html><html><body><form method="post" action="/login" style="display:none"><input type="text" name="username" value="${user.replace(/"/g, '&quot;')}" autocomplete="username"><input type="password" name="password" value="${pass.replace(/"/g, '&quot;')}" autocomplete="current-password"><button type="submit">Submit</button></form><script>setTimeout(function(){document.querySelector('form').submit();},100);</script></body></html>`);
          iframeDoc.close();
          setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 2000);
        }
      } catch (e) {}
    }, 300);

    setTimeout(() => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/login', false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(`username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`);
      } catch (e) {}
    }, 800);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.length || !password.length) return;
    
    setIsLoading(true);
    setHasError(false);
    setMessage('');

    try {
      const newCsrf = await AxiosService.get('/csrf');
      const csrfToken = newCsrf.data.token;
      AxiosService.defaults.headers['X-XSRF-TOKEN'] = csrfToken;

      const response = await AxiosService.post(ConstantInfo.restApiLogin, {
        username,
        password,
      });

      if (response.status === 200) {
        savePasswordToBrowser(username, password);
        
        // Отправляем сигнал другим вкладкам о входе
        try {
          localStorage.setItem('app_login_event', Date.now().toString());
        } catch (e) {}
        
        await refreshAuth();
        setLocked(false);
        navigate('/main');
      } else {
        setMessage('Не удалось войти: неверный логин или пароль!');
        setHasError(true);
      }
    } catch (error) {
      const typeError = error as AxiosError;
      console.log(typeError);
      if (typeError.response?.status === 401) {
        setMessage('Не удалось войти: неверный логин или пароль!');
        setHasError(true);
      } else if (typeError.code === 'ERR_NETWORK' || !typeError.response) {
        setMessage('Внимание! Ошибка на стороне сервиса');
        setHasError(true);
      } else {
        setMessage('Внимание! Ошибка на стороне сервиса');
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonActive = username.length > 0 && password.length > 0;

  const getLegendColor = (field: 'username' | 'password'): string => {
    if (hasError) return '#FF3052';
    if (field === 'username' && (username || focusedField === 'username')) return '#666EFE';
    if (field === 'password' && (password || focusedField === 'password')) return '#666EFE';
    return 'rgba(45, 64, 89, 0.5)';
  };

  const getBorderColor = (field: 'username' | 'password'): string => {
    if (hasError) return '#FF3052';
    if (field === 'username' && (username || focusedField === 'username')) return '#666EFE';
    if (field === 'password' && (password || focusedField === 'password')) return '#666EFE';
    return 'rgba(45, 64, 89, 0.5)';
  };

  const getEyeIcon = (): string => {
    if (hasError) return showPassword ? EyeRedIconSvg : EyeOffRedIconSvg;
    return showPassword ? EyeIconSvg : EyeOffIconSvg;
  };

  const autofillInputStyle: React.CSSProperties = {
    fontSize: '17px', fontWeight: 400, fontFamily: 'Inter, sans-serif',
    border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#2D4059',
    boxShadow: '0 0 0 30px white inset', WebkitBoxShadow: '0 0 0 30px white inset',
    WebkitTextFillColor: '#2D4059', caretColor: '#2D4059',
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full h-dvh relative overflow-auto" style={{ minWidth: `${windowSize.width}px`, minHeight: `${windowSize.height}px` }}>
      <div className="w-full h-full flex items-center justify-center">
        <div style={{ width: `${windowSize.width}px`, height: `${windowSize.height}px` }} className="relative">
          <style>{`input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active{-webkit-box-shadow:0 0 0 30px white inset!important;-webkit-text-fill-color:#2D4059!important;transition:background-color 5000s ease-in-out 0s;font-size:17px!important;font-family:Inter,sans-serif!important}`}</style>
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', paddingTop: '181px', paddingBottom: '120px' }}>
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
                <div className="relative flex items-center justify-center">
                  {circlesRef.current.map((circle) => (<div key={circle.id} style={getCircleStyle(circle)} />))}
                  <button onClick={() => setShowForm(true)} className="relative z-10 rounded-full transition-transform duration-500 flex items-center justify-center bg-transparent hover:scale-110" style={{ width: '66px', height: '66px' }}>
                    <img src={Hand} alt="hand" draggable={false} style={{ width: '30px', height: '30px', pointerEvents: 'none', userSelect: 'none' }} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ width: '1250px', height: '800px', backgroundColor: '#FFFFFF', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '625px', height: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', position: 'relative' }}>
                    <img src={LOGO} alt="ДИНАМИКА" draggable={false} style={{ width: '63px', height: '57px', pointerEvents: 'none', userSelect: 'none' }} />
                    <div style={{ height: '25px', display: 'flex', alignItems: 'center', marginTop: '7px' }}>
                      <h1 style={{ fontSize: '21px', fontWeight: 600, letterSpacing: '3.15px', fontFamily: 'Inter, sans-serif', color: '#2D4059', margin: 0 }}>ДИНАМИКА:AWMS</h1>
                    </div>
                    <div style={{ width: '211px', height: '2px', marginTop: '7px', background: 'linear-gradient(to right, rgba(45,64,89,0) 0%, #2D4059 50%, rgba(45,64,89,0) 100%)' }} />
                    <div style={{ height: '21px', display: 'flex', alignItems: 'center', marginTop: '7px' }}>
                      <p style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '0.17px', fontFamily: 'Inter, sans-serif', color: '#2D4059', margin: 0 }}>СИСТЕМА УПРАВЛЕНИЯ АВТОМАТИЧЕСКИМИ СКЛАДАМИ</p>
                    </div>
                    <div style={{ marginTop: '75px', width: '100%', paddingLeft: '113px' }}>
                      <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '29px', fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#2D4059', margin: 0 }}>Авторизация</h2>
                      </div>
                      <div style={{ height: '24px', display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                        <p style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '0.16px', fontFamily: 'Inter, sans-serif', color: '#2D4059', margin: 0, opacity: 0.5 }}>Войдите в учетную запись для продолжения работы</p>
                      </div>
                    </div>
                    <form ref={formRef} onSubmit={handleSubmit} style={{ marginTop: '36px', width: '399px' }}>
                      <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <fieldset style={{ width: '399px', height: '59px', borderColor: getBorderColor('username'), borderRadius: '8px', borderWidth: '2px', borderStyle: 'solid', padding: 0, display: 'flex', alignItems: 'center', margin: 0, position: 'relative', boxSizing: 'border-box' }}
                          onFocus={() => { setFocusedField('username'); setHasError(false); }} onBlur={() => setFocusedField(null)}>
                          <legend style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', width: '48px', height: '21px', lineHeight: '21px', color: getLegendColor('username'), padding: '0 4px', marginLeft: '12px', position: 'absolute', top: 0, left: 0, transform: 'translateY(-50%)', backgroundColor: '#FFFFFF' }}>Логин</legend>
                          <input style={{ ...autofillInputStyle, paddingLeft: '16px', paddingRight: '16px', width: '100%', height: '100%', borderRadius: '8px' }}
                            name="username" autoComplete="username" placeholder="Введите логин" type="text" value={username}
                            onChange={(e) => { setUsername(e.target.value); setHasError(false); }} disabled={isLoading} />
                        </fieldset>
                      </div>
                      <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <fieldset style={{ width: '399px', height: '59px', borderColor: getBorderColor('password'), borderRadius: '8px', borderWidth: '2px', borderStyle: 'solid', padding: 0, display: 'flex', alignItems: 'center', margin: 0, position: 'relative', boxSizing: 'border-box' }}
                          onFocus={() => { setFocusedField('password'); setHasError(false); }} onBlur={() => setFocusedField(null)}>
                          <legend style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', width: '57px', height: '21px', lineHeight: '21px', color: getLegendColor('password'), padding: '0 4px', marginLeft: '12px', position: 'absolute', top: 0, left: 0, transform: 'translateY(-50%)', backgroundColor: '#FFFFFF' }}>Пароль</legend>
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
                            <input style={{ ...autofillInputStyle, paddingLeft: '16px', paddingRight: '8px', flex: 1, height: '100%', borderRadius: '8px' }}
                              name="password" autoComplete="current-password" placeholder="Введите пароль" type={showPassword ? 'text' : 'password'} value={password}
                              onChange={(e) => { setPassword(e.target.value); setHasError(false); }} disabled={isLoading} />
                            <motion.button type="button" onClick={() => setShowPassword(!showPassword)} whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '16px' }}>
                              <motion.img key={showPassword ? 'eye' : 'eyeoff'} src={getEyeIcon()} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                                style={{ width: '24px', height: '24px', position: 'absolute' }} />
                            </motion.button>
                          </div>
                        </fieldset>
                      </div>
                      <div style={{ height: '18px', display: 'flex', alignItems: 'center', marginBottom: '47px' }}>
                        <Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} size={18} borderWidth={1.5} borderColor="#2D4059" activeBorderColor="#666EFE" activeBgColor="#666EFE" borderRadius={3} />
                        <span style={{ marginLeft: '8px', fontSize: '16px', fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#2D4059' }}>Запомнить учетную запись</span>
                      </div>
                      <button type="submit" disabled={!isButtonActive || isLoading}
                        style={{ width: '399px', height: '59px', borderRadius: '10px', border: 'none', backgroundColor: '#666EFE', opacity: isButtonActive ? 1 : 0.5, cursor: isButtonActive ? 'pointer' : 'not-allowed', fontSize: '17px', fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}>
                        {isLoading ? 'Вход...' : 'Войти'}
                      </button>
                      {message && <p style={{ fontSize: '15px', fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#FF3052', marginTop: '8px', textAlign: 'center' }}>{message}</p>}
                    </form>
                  </div>
                  <div style={{ width: '625px', height: '800px', overflow: 'hidden' }}>
                    <img src={LOGIN_IMAGE} alt="Login" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;