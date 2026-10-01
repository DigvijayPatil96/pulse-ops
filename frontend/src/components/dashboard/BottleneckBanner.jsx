import React from 'react';
import { AlertOctagon, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import api from '../../services/api';

export const BottleneckBanner = () => {
  const { alerts, resolveAlert, refreshAllData } = useHospital();

  const criticalAlerts = alerts.filter(
    (a) =>
      !a.isResolved &&
      (a.alertType === 'ICU_CAPACITY_FULL' ||
        a.alertType === 'UNASSIGNED_HIGH_PRIORITY' ||
        a.severity === 'CRITICAL')
  );

  if (criticalAlerts.length === 0) return null;

  const topAlert = criticalAlerts[0];

  const handleAudit = async () => {
    try {
      await api.post('/alerts/audit');
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-amber-950/80 border border-rose-500/40 p-4 shadow-xl shadow-rose-950/30 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0 animate-pulse">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500 text-white">
                OPERATIONAL BOTTLENECK
              </span>
              <span className="text-xs font-mono text-slate-400">
                {criticalAlerts.length} urgent bottleneck{criticalAlerts.length > 1 ? 's' : ''} detected
              </span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-white tracking-tight">
              {topAlert.title}
            </h4>
            <p className="text-xs text-rose-200/80 mt-0.5 leading-relaxed max-w-3xl">
              {topAlert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={handleAudit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Audit Capacity
          </button>
          <button
            onClick={() => resolveAlert(topAlert._id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all"
          >
            Acknowledge & Resolve
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
