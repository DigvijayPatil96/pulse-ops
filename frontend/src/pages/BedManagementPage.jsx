import React, { useState } from 'react';
import { BedDouble, ShieldAlert, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { AssignPatientModal } from '../components/beds/AssignPatientModal';
import { getWardColor } from '../utils/triageUtils';
import api from '../services/api';

export const BedManagementPage = () => {
  const { beds, refreshAllData } = useHospital();
  const [selectedWardFilter, setSelectedWardFilter] = useState('ALL');
  const [assignBedTarget, setAssignBedTarget] = useState(null);

  const wards = ['ICU', 'Emergency', 'Cardiology', 'General'];

  const getWardStats = (wardName) => {
    const wardBeds = beds.filter((b) => b.ward === wardName);
    const occupied = wardBeds.filter((b) => b.status === 'occupied').length;
    const available = wardBeds.filter((b) => b.status === 'available').length;
    const cleaning = wardBeds.filter((b) => b.status === 'cleaning').length;
    const total = wardBeds.length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, cleaning, rate };
  };

  const updateStatus = async (bedId, status) => {
    try {
      await api.patch(`/beds/${bedId}/status`, { status });
      await refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBeds =
    selectedWardFilter === 'ALL' ? beds : beds.filter((b) => b.ward === selectedWardFilter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Hospital Bed & Ward Capacity Management
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Intelligent Bed Allocation, Step-Down Transfer & Sanitization Status
        </p>
      </div>

      {/* Ward Capacity Progress Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wards.map((wardName) => {
          const stats = getWardStats(wardName);
          const isSaturated = stats.rate >= 75;

          return (
            <div
              key={wardName}
              className={`p-4 rounded-2xl border ${
                isSaturated
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900/70 border-slate-800'
              } backdrop-blur-md`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{wardName} Unit</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    isSaturated ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                >
                  {stats.rate}% Occupied
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSaturated ? 'bg-rose-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${stats.rate}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Occupied: {stats.occupied}/{stats.total}</span>
                <span className="text-emerald-400">Ready: {stats.available}</span>
                <span className="text-amber-400">Clean: {stats.cleaning}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ward Filter Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['ALL', ...wards].map((w) => (
          <button
            key={w}
            onClick={() => setSelectedWardFilter(w)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              selectedWardFilter === w
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {w === 'ALL' ? 'All Units' : `${w} Ward`}
          </button>
        ))}
      </div>

      {/* Bed Matrix Table / Grid */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Bed Inventory & Status ({filteredBeds.length} Total Units)
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredBeds.map((bed) => (
            <div
              key={bed._id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-extrabold text-sm text-white">
                  {bed.bedNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{bed.bedNumber}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded border ${getWardColor(bed.ward)}`}>
                      {bed.ward}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        bed.status === 'occupied'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : bed.status === 'available'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {bed.currentPatient ? (
                      <span>
                        Patient: <strong className="text-slate-200">{bed.currentPatient.fullName}</strong> (MRN: {bed.currentPatient.mrn})
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">Equipment: {bed.equipment?.join(', ') || 'Standard Bed'}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status Toggles & Allocation Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {bed.status === 'available' && (
                  <button
                    onClick={() => setAssignBedTarget(bed)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
                  >
                    Assign Patient
                  </button>
                )}

                {bed.status === 'cleaning' && (
                  <button
                    onClick={() => updateStatus(bed._id, 'available')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
                  >
                    Mark Ready for Intake
                  </button>
                )}

                {bed.status === 'occupied' && (
                  <button
                    onClick={() => useHospital().releaseBed(bed._id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Release Bed
                  </button>
                )}

                <button
                  onClick={() => updateStatus(bed._id, bed.status === 'cleaning' ? 'available' : 'cleaning')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Toggle Sanitization Status"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      {assignBedTarget && (
        <AssignPatientModal
          bed={assignBedTarget}
          onClose={() => setAssignBedTarget(null)}
        />
      )}
    </div>
  );
};
