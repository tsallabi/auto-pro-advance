import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

export interface ToastItem {
    id: string;
    title: string;
    message?: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'bid';
    duration?: number;
}

interface ToastProps {
    toast: ToastItem;
    onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Enter animation
        const enterTimer = setTimeout(() => setVisible(true), 10);
        // Auto remove
        const leaveTimer = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onRemove(toast.id), 400);
        }, toast.duration ?? 4500);
        return () => { clearTimeout(enterTimer); clearTimeout(leaveTimer); };
    }, [toast.id, toast.duration, onRemove]);

    const configs = {
        success: { bg: 'bg-emerald-500', icon: <CheckCircle2 className="w-5 h-5" />, bar: 'bg-emerald-300' },
        error: { bg: 'bg-rose-500', icon: <AlertCircle className="w-5 h-5" />, bar: 'bg-rose-300' },
        info: { bg: 'bg-blue-500', icon: <Info className="w-5 h-5" />, bar: 'bg-blue-300' },
        warning: { bg: 'bg-amber-500', icon: <Bell className="w-5 h-5" />, bar: 'bg-amber-300' },
        bid: { bg: 'bg-orange-500', icon: <Bell className="w-5 h-5" />, bar: 'bg-orange-300' },
    };
    const cfg = configs[toast.type] || configs.info;

    return (
        <div
            className={`
        relative flex items-start gap-3 w-80 rounded-2xl text-white shadow-2xl overflow-hidden
        transition-all duration-400 ease-out cursor-pointer
        ${cfg.bg}
        ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
            onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 400); }}
        >
            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-1 ${cfg.bar} toast-progress`}
                ref={(el) => { if (el) el.style.animationDuration = `${toast.duration ?? 4500}ms`; }}
            />
            <div className="flex items-start gap-3 p-4 w-full">
                <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                <div className="flex-grow min-w-0">
                    <p className="font-black text-sm leading-tight">{toast.title}</p>
                    {toast.message && (
                        <p className="text-xs text-white/80 font-bold mt-1 leading-relaxed">{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 400); }}
                    className="flex-shrink-0 text-white/70 hover:text-white transition-colors mt-0.5"
                    title="إغلاق التنبيه"
                    aria-label="إغلاق التنبيه"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastItem[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;
    return (
        <div className="fixed top-5 left-5 z-[9999] flex flex-col gap-3 pointer-events-none" dir="rtl">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
};

// Hook to use toasts
export const useToast = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = (item: Omit<ToastItem, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        setToasts(prev => [...prev, { ...item, id }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast = {
        success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
        error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
        info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
        warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
        bid: (title: string, message?: string) => addToast({ type: 'bid', title, message, duration: 6000 }),
    };

    return { toasts, removeToast, toast };
};
