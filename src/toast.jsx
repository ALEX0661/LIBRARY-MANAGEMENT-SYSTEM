import { useState, useCallback } from 'react';
import Icon from './Icon';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, toast };
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <Icon name={t.type === 'success' ? 'check' : 'warning'} size={15} />
          {t.message}
        </div>
      ))}
    </div>
  );
}
