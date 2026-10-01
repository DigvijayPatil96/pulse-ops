import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Activity,
  PlusCircle,
  User,
  Heart,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import { getTriageBadgeStyle } from '../../utils/triageUtils';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

export const PatientChartModal = ({ patientId, onClose }) => {
  const { user } = useAuth();
  const { tasks, markTaskStatus } = useHospital();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState(user?.role === 'doctor' ? 'Doctor Order' : 'Nursing Assessment');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      setPatient(res.data.patient);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchDetails();
    }
  }, [patientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      await api.post(`/patients/${patientId}/chart-notes`, {
        note: noteContent,
        category: noteCategory,
      });
      setNoteContent('');
      await fetchDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          Loading Patient Medical Record...
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const triageBadge = getTriageBadgeStyle(patient.triagePriority, patient.esiScore);
  const patientTasks = tasks.filter((t) => t.patient?._id === patient._id || t.patient === patient._id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono">
              {patient.fullName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight">{patient.fullName}</h2>
                <div
                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${triageBadge.bg} ${triageBadge.border} ${triageBadge.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${triageBadge.dot}`} />
                  {triageBadge.label}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>MRN: {patient.mrn}</span>
                <span>•</span>
                <span>
                  {patient.age}y • {patient.gender} • Blood: {patient.bloodGroup || 'O+'}
                </span>
                <span>•</span>
                <span className="text-cyan-400 font-semibold">
                  Bed: {patient.currentBed?.bedNumber || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Clinical Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diagnosis & Complaint */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Chief Complaint & Diagnosis
              </span>
              <p className="mt-1 text-xs text-white font-medium">{patient.chiefComplaint}</p>
              <p className="mt-2 text-xs text-cyan-300 font-mono">{patient.diagnosis}</p>
            </div>

            {/* Allergies & Status */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Known Allergies
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {patient.allergies && patient.allergies.length > 0 ? (
                  patient.allergies.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-rose-950/50 border border-rose-800 text-[11px] text-rose-300 font-mono"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No known allergies</span>
                )}
              </div>
            </div>

            {/* Care Team */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Assigned Clinical Staff
              </span>
              <div className="mt-2 space-y-1 text-xs">
                <div className="text-slate-300">
                  <span className="text-slate-500">Attending:</span>{' '}
                  {patient.assignedDoctor?.name || 'Unassigned'}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Nurse:</span>{' '}
                  {patient.assignedNurse?.name || 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Tasks Board */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Active Clinical Tasks ({patientTasks.length})
              </span>
            </div>

            {patientTasks.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">No active tasks for this patient.</p>
            ) : (
              <div className="space-y-2">
                {patientTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => markTaskStatus(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          t.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-slate-700 hover:border-cyan-500'
                        }`}
                      >
                        {t.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <span className={`font-semibold ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {t.title}
                        </span>
                        {t.autoGeneratedByAI && (
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400 font-semibold">
                            AI ORDER
                          </span>
                        )}
                        <p className="text-[11px] text-slate-400">{t.description}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        t.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Append Chart Note Form */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-cyan-400" /> Append Clinical Note / Doctor Order
            </span>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 px-3 py-2 font-mono focus:outline-none"
                >
                  <option value="Doctor Order">Doctor Order</option>
                  <option value="Progress Note">Progress Note</option>
                  <option value="Nursing Assessment">Nursing Assessment</option>
                  <option value="Medication">Medication Order</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter clinical observation, medication change or diagnostic order..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-600/30 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>

          {/* Notes History Feed */}
          <div>
            <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-3">
              Clinical Progress & Orders Timeline
            </span>
            <div className="space-y-3">
              {patient.chartNotes && patient.chartNotes.length > 0 ? (
                patient.chartNotes.map((note, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{note.authorName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-400 font-mono">
                          {note.category}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans pt-1">{note.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-mono">No historical chart notes recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
