// components/InactivityWarning/InactivityWarning.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InactivityWarningProps {
  show: boolean;
  onClose: () => void;
}

const InactivityWarning: React.FC<InactivityWarningProps> = ({ show, onClose }) => {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!show) {
      setCountdown(30);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-[#2D4059] mb-4">Предупреждение</h2>
            <p className="text-gray-600 mb-2">
              Вы скоро будете заблокированы из-за бездействия.
            </p>
            <p className="text-lg font-semibold text-[#666EFE] mb-6">
              Блокировка через {countdown} секунд
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[#666EFE] hover:bg-[#5555dd] text-white py-3 rounded-xl transition-colors font-medium"
            >
              Продолжить работу
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InactivityWarning;