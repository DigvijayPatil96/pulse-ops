import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, BedDouble, Stethoscope, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const Sidebar = () => {
  const { alerts, tasks } = useHospital();

  const navItems = [
    {
      to: '/',
      label: 'Patient Tracker',
      sublabel: 'Active Beds & Vitals',
      icon: LayoutDashboard,
    },
    {
      to: '/triage',
      label: 'AI Triage Engine',
      sublabel: 'Gemini Orchestration',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      to: '/beds',
      label: 'Bed Matrix',
      sublabel: 'Capacity & Transfers',
      icon: BedDouble,
    },
    {
      to: '/portal',
      label: 'Staff Portal',
      sublabel: 'Charts & Task List',
      icon: Stethoscope,
      badgeCount: tasks.filter((t) => t.status === 'pending').length,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 backdrop-blur-md hidden md:flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Hospital Navigation
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 border border-slate-800/80 transition-colors">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-cyan-950 border border-cyan-700 text-cyan-300 rounded">
                    {item.badge}
                  </span>
                )}

                {item.badgeCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-blue-900/60 border border-blue-700/60 text-blue-300 rounded-full">
                    {item.badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Clinical Shift Info Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" /> ACTIVE SHIFT
          </span>
          <span className="text-emerald-400">DAY 07:00-19:00</span>
        </div>
        <p className="text-[11px] leading-tight text-slate-400">
          Intelligent patient routing active. High-acuity ICU & ER alerts are prioritized.
        </p>
      </div>
    </aside>
  );
};
