import { createContext, useContext, useState, useCallback } from 'react';

import {
  ToastProps,
  ToastContextProps,
  ToastProviderProps,
} from './Toast.types';
import Toast from './Toast';

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((toast: ToastProps) => {
    setToasts((prev) => prev.filter((t) => t !== toast));
  }, []);

  const showToast = useCallback(
    (message: string, options?: Omit<ToastProps, 'message' | 'onClose'>) => {
      const newToast = {
        message,
        ...options,
        onClose: () => removeToast(newToast),
      } as ToastProps;
      setToasts((prev) => [...prev, newToast]);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed z-50">
        {toasts.map((toast, index) => (
          <Toast key={index} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
