import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Bell, AlertTriangle, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { useSocket } from '../../context/SocketContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { alerts, resolveAlert } = useHospital();
  const { isConnected } = useSocket();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Live Stream Indicator */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                PULSE<span className="text-cyan-400 font-extrabold">OPS</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-400 font-semibold tracking-wider">
                v2.6 AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Smart Hospital Automation & Patient Tracking</p>
          </div>
        </Link>

        {/* Live Telemetry Ping */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
          <span className="text-slate-400 font-mono text-[11px]">
            {isConnected ? 'STREAM CONNECTED (3s INTERVAL)' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Right Controls: Alerts Drawer & Profile */}
      <div className="flex items-center gap-3">
        {/* System Bottleneck / Critical Alarms Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className={`relative p-2 rounded-lg border transition-all ${
              criticalAlerts.length > 0
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Operational Alerts"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 min-w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold shadow-md">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Drawer */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white">Hospital Operational Alerts</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{alerts.length} active</span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                    No active bottlenecks or alarms detected. System running nominally.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert._id}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                          : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white tracking-tight">{alert.title}</span>
                        <button
                          onClick={() => resolveAlert(alert._id)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono shrink-0 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">{alert.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Ward: {alert.ward || 'General'}</span>
                        <span>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Staff Profile Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                  user.role === 'doctor'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {user.role === 'doctor' ? 'DR' : 'RN'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                  <span>{user.department || 'Clinical Staff'}</span>
                  <span>•</span>
                  <span className="text-cyan-400">{user.role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
