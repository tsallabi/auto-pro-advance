import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Admin Dashboard Crash Detected:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 text-center bg-slate-50 min-h-screen font-sans" dir="rtl">
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-rose-100">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-4">حدث خطأ في النظام ⚠️</h1>
            <p className="text-slate-500 font-bold mb-8">نعتذر، واجهت لوحة الإدارة مشكلة غير متوقعة أثناء التحميل.</p>
            <div className="bg-slate-900 text-rose-400 p-6 rounded-2xl text-left font-mono text-xs overflow-auto mb-8 max-h-60">
              {this.state.error?.toString()}
              {this.state.error?.stack && <div className="mt-4 text-slate-500">{this.state.error.stack}</div>}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
