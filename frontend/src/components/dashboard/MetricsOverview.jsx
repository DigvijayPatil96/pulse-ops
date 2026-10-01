import React from 'react';
import { BedDouble, Users, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const MetricsOverview = () => {
  const { beds, bedStats, patients, alerts } = useHospital();

  const criticalCount = patients.filter((p) => p.triagePriority === 'CRITICAL').length;
  const icuBeds = beds.filter((b) => b.ward === 'ICU');
  const availableIcu = icuBeds.filter((b) => b.status === 'available').length;

  const stats = [
    {
      label: 'Bed Occupancy',
      value: `${bedStats.occupancyRate || 0}%`,
      sub: `${bedStats.occupied || 0} of ${bedStats.total || 0} Beds Full`,
      icon: BedDouble,
      color: bedStats.occupancyRate >= 80 ? 'text-rose-400' : 'text-cyan-400',
      border: bedStats.occupancyRate >= 80 ? 'border-rose-500/30' : 'border-slate-800',
      bg: 'bg-slate-900/60',
    },
    {
      label: 'Critical Patients (ESI 1)',
      value: criticalCount,
      sub: 'Continuous Telemetry Monitored',
      icon: ShieldAlert,
      color: criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400',
      border: criticalCount > 0 ? 'border-rose-500/30' : 'border-slate-800',
      bg: criticalCount > 0 ? 'bg-rose-950/20' : 'bg-slate-900/60',
    },
    {
      label: 'ICU Capacity Reserve',
      value: `${availableIcu} / ${icuBeds.length}`,
      sub: availableIcu <= 1 ? 'Capacity Saturated' : 'Beds Ready',
      icon: AlertCircle,
      color: availableIcu <= 1 ? 'text-amber-400' : 'text-cyan-400',
      border: availableIcu <= 1 ? 'border-amber-500/30' : 'border-slate-800',
      bg: 'bg-slate-900/60',
    },
    {
      label: 'AI Triage Orchestration',
      value: 'ACTIVE',
      sub: 'Gemini 2.5 Flash Engine',
      icon: Cpu,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-md transition-all hover:border-slate-700`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{stat.label}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-mono">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
