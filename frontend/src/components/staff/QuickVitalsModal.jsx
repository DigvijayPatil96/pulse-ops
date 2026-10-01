import React, { useState } from 'react';
import { X, Heart, Activity, Thermometer, Stethoscope, Save } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const QuickVitalsModal = ({ patient, onClose }) => {
  const { updateVitals } = useHospital();
  const current = patient?.latestVitals || {};

  const [formData, setFormData] = useState({
    heartRate: current.heartRate || 75,
    systolicBP: current.systolicBP || 120,
    diastolicBP: current.diastolicBP || 80,
    spo2: current.spo2 || 98,
    respiratoryRate: current.respiratoryRate || 16,
    temperature: current.temperature || 37.0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateVitals(patient._id, formData);
      setSuccessMsg('Telemetry updated and broadcasted in real-time!');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Manual Telemetry Override</h3>
            <p className="text-xs text-slate-400 font-mono">
              Patient: {patient?.fullName} ({patient?.mrn})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-mono">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> Heart Rate (bpm)
              </label>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                min="30"
                max="250"
                required
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> SpO2 (%)
              </label>
              <input
                type="number"
                name="spo2"
                value={formData.spo2}
                onChange={handleChange}
                min="40"
                max="100"
                required
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-emerald-400" /> Systolic BP
              </label>
              <input
                type="number"
                name="systolicBP"
                value={formData.systolicBP}
                onChange={handleChange}
                min="50"
                max="260"
                required
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-emerald-400" /> Diastolic BP
              </label>
              <input
                type="number"
                name="diastolicBP"
                value={formData.diastolicBP}
                onChange={handleChange}
                min="30"
                max="160"
                required
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                Resp Rate (br/min)
              </label>
              <input
                type="number"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleChange}
                min="6"
                max="60"
                required
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" /> Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                min="32"
                max="43"
                required
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {submitting ? 'Broadcasting...' : 'Save & Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
