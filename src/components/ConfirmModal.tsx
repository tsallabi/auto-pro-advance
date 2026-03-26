import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title = "تأكيد الإجراء",
    message,
    onConfirm,
    onCancel,
    confirmText = "نعم، تأكيد",
    cancelText = "إلغاء",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
                onClick={onCancel}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200"
                dir="rtl"
            >
                <div className="p-6">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-5 mx-auto">
                        <AlertTriangle className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 text-center mb-2">{title}</h3>
                    <p className="text-sm font-bold text-slate-500 text-center mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                onConfirm();
                                onCancel();
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-orange-500/30 active:scale-95"
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onCancel}
                    title="إغلاق"
                    aria-label="إغلاق النافذة"
                    className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
