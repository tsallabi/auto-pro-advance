import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const BranchSelector = () => {
    const { branchConfig, setBranchConfig } = useStore();
    const [isOpen, setIsOpen] = React.useState(false);

    const branches = [
        { id: 'ly', name: 'ليـبيا', flag: '🇱🇾' },
        { id: 'eg', name: 'مصر', flag: '🇪🇬' },
        { id: 'ae', name: 'الإمارات', flag: '🇦🇪' },
        { id: 'sa', name: 'السعودية', flag: '🇸🇦' },
        { id: 'main', name: 'الرئيسي', flag: '🌐' }
    ];

    const handleSelect = async (branchId: string) => {
        try {
            const res = await fetch(`/api/config?branch=${branchId}`);
            if (res.ok) {
                const config = await res.json();
                setBranchConfig(config);
                setIsOpen(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-all text-xs font-bold"
            >
                <Globe className="w-4 h-4 text-orange-500" />
                <span>{branchConfig?.name || 'اختر القطر'}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                onClick={() => handleSelect(branch.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${branchConfig?.id === branch.id
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{branch.flag}</span>
                                    <span className="font-bold text-sm tracking-tight">{branch.name}</span>
                                </div>
                                {branchConfig?.id === branch.id && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
