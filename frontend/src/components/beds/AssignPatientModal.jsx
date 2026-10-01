import React, { useState } from 'react';
import { X, BedDouble, UserPlus, CheckCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const AssignPatientModal = ({ bed, onClose }) => {
  const { patients, assignBed } = useHospital();
  // Filter patients that either have no bed or are in triage
  const eligiblePatients = patients.filter(
    (p) => !p.currentBed || p.status === 'triage' || p.currentBed._id !== bed._id
  );

  const [selectedPatientId, setSelectedPatientId] = useState(
    eligiblePatients.length > 0 ? eligiblePatients[0]._id : ''
  );
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSubmitting(true);
    try {
      await assignBed(bed._id, selectedPatientId);
      onClose();
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
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-cyan-400" /> Bed Allocation: {bed.bedNumber}
            </h3>
            <p className="text-xs text-slate-400 font-mono">Ward: {bed.ward}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-2">
              Select Incoming or Triage Patient:
            </label>
            {eligiblePatients.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                All admitted patients currently have assigned beds. Use the AI Triage intake to register new incoming patients.
              </p>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none"
              >
                {eligiblePatients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName} (MRN: {p.mrn}) • {p.triagePriority} • {p.chiefComplaint}
                  </option>
                ))}
              </select>
            )}
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
              disabled={submitting || eligiblePatients.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {submitting ? 'Allocating...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
