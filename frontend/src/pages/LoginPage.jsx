import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Stethoscope, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      await quickLogin(role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hospital-darkest flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-xl shadow-cyan-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            PULSE<span className="text-cyan-400">OPS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Smart Hospital Automation & Patient Tracking Dashboard
          </p>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Instant Demo Access
            </span>
            <span className="text-[10px] font-mono text-slate-500">1-Click Sign In</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('doctor')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                  Doctor Role
                </span>
                <Stethoscope className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
              </div>
              <div className="font-bold text-xs text-white">Dr. Sarah Chen</div>
              <div className="text-[10px] text-slate-400 font-mono">Chief of ICU</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('nurse')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                  Nurse Role
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <div className="font-bold text-xs text-white">Elena Rostova, RN</div>
              <div className="text-[10px] text-slate-400 font-mono">Triage Lead</div>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs text-center font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Staff Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.chen@hospital.org"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Clinical Session
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          Protected Healthcare Information System • HIPAA/Audit Compliant
        </div>
      </div>
    </div>
  );
};
