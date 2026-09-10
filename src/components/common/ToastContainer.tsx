import React from 'react';
import { useToast, ToastItem } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, Download, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'update':
        return <Download className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div
      id={toast.id}
      className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl glass-panel shadow-xl transition-all duration-200"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)'
      }}
    >
      <div className="pt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold tracking-wide uppercase text-[var(--text-main)]">
          {toast.title}
        </h4>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
          {toast.message}
        </p>
        {toast.action && (
          <div className="mt-2.5 flex items-center gap-2">
            <button
              id={`${toast.id}-action-btn`}
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent-blue)] text-white hover:opacity-90 transition-opacity"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
      <button
        id={`${toast.id}-dismiss-btn`}
        onClick={onDismiss}
        className="p-1 rounded-md text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
