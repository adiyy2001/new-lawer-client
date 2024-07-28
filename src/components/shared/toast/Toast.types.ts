export interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  type?: "success" | "error" | "info" | "warning";
  dismissible?: boolean;
  customStyles?: React.CSSProperties;
  customClass?: string;
}

export interface ToastContextProps {
  showToast: (
    message: string,
    options?: Omit<ToastProps, "message" | "onClose">
  ) => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}
