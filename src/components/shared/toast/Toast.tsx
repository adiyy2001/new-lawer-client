import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiX,
} from 'react-icons/fi';

import { ToastProps } from './Toast.types';
import { toastColors, positionClasses } from './Toast.styles';

const toastIcons = {
  success: <FiCheckCircle />,
  error: <FiXCircle />,
  info: <FiInfo />,
  warning: <FiAlertTriangle />,
};

const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration,
  position = 'bottom-right',
  type = 'info',
  dismissible = true,
  customStyles,
  customClass,
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} ${toastColors[type]} text-white p-4 rounded-lg shadow-lg ${customClass}`}
      style={customStyles}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {toastIcons[type]}
          <span className="ml-2">{message}</span>
        </div>
        {dismissible && (
          <button
            onClick={onClose}
            className="ml-4 text-white"
            aria-label="Close"
          >
            <FiX />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Toast;
