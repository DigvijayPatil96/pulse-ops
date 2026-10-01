import React from 'react';
import { AlertOctagon, X, ArrowRight } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const AlertToast = () => {
  const { latestAlertToast, setLatestAlertToast, resolveAlert } = useHospital();

  if (!latestAlertToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-rose-950/95 border-2 border-rose-500 shadow-2xl shadow-rose-950/50 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 animate-bounce">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-900 border border-rose-700 text-white">
                EMERGENT CODE / BREACH
              </span>
              <span className="text-[10px] font-mono text-rose-300">Just Now</span>
            </div>
            <h4 className="mt-1 font-bold text-sm text-white">{latestAlertToast.title}</h4>
            <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
              {latestAlertToast.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => setLatestAlertToast(null)}
          className="text-rose-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-rose-800/60 flex items-center justify-end gap-2">
        <button
          onClick={() => {
            resolveAlert(latestAlertToast._id);
            setLatestAlertToast(null);
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-700/40 transition-all"
        >
          Acknowledge & Dismiss
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
