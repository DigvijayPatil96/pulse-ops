import React, { useState } from 'react';
import {
  UserCheck,
  Stethoscope,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  FileText,
  Heart,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import { PatientChartModal } from '../components/staff/PatientChartModal';
import { QuickVitalsModal } from '../components/staff/QuickVitalsModal';
import { getTriageBadgeStyle } from '../utils/triageUtils';

export const StaffPortalPage = () => {
  const { user } = useAuth();
  const { patients, tasks, markTaskStatus, refreshAllData } = useHospital();

  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'tasks'
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'pending' | 'completed'

  // Modals
  const [selectedChartPatient, setSelectedChartPatient] = useState(null);
  const [selectedVitalsPatient, setSelectedVitalsPatient] = useState(null);

  // My patients
  const myPatients = patients.filter((p) => {
    if (!user) return false;
    const docId = p.assignedDoctor?._id || p.assignedDoctor;
    const nurseId = p.assignedNurse?._id || p.assignedNurse;
    return docId === user._id || docId === user.id || nurseId === user._id || nurseId === user.id;
  });

  // My tasks
  const myTasks = tasks.filter((t) => {
    if (!user) return false;
    const assignedId = t.assignedTo?._id || t.assignedTo;
    return assignedId === user._id || assignedId === user.id;
  });

  const filteredTasks = myTasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Staff Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 border border-cyan-800 text-cyan-400">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {user?.department} Department • {user?.specialty || 'General Medicine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Patients</span>
            <span className="text-base font-bold font-mono text-cyan-400">{myPatients.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Assigned Tasks</span>
            <span className="text-base font-bold font-mono text-amber-400">{myTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('patients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'patients'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          My Assigned Patients ({myPatients.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'tasks'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Clinical Task Board ({myTasks.length})
        </button>
      </div>

      {/* Tab 1: My Assigned Patients */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Active Caseload
            </span>
          </div>

          {myPatients.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs font-mono">
              You currently have no direct patient assignments. Check the Hospital Dashboard or AI Triage to assign patients.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPatients.map((patient) => {
                const vitals = patient.latestVitals || {};
                const triageBadge = getTriageBadgeStyle(patient.triagePriority, patient.esiScore);

                return (
                  <div
                    key={patient._id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-sm">{patient.fullName}</h3>
                          <span className="text-xs text-slate-400 font-mono">
                            MRN: {patient.mrn} • {patient.age}y • {patient.gender}
                          </span>
                        </div>
                        <div
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${triageBadge.bg} ${triageBadge.border} ${triageBadge.text}`}
                        >
                          {triageBadge.label}
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                        {patient.chiefComplaint}
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Heart className="w-3.5 h-3.5 text-rose-400" /> HR: {vitals.heartRate || '--'} bpm
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" /> SpO2: {vitals.spo2 || '--'}%
                        </span>
                        <span className="text-slate-400">
                          BP: {vitals.systolicBP || '--'}/{vitals.diastolicBP || '--'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedVitalsPatient(patient)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
                      >
                        Update Vitals
                      </button>
                      <button
                        onClick={() => setSelectedChartPatient(patient)}
                        className="flex-1 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors text-center"
                      >
                        Open Chart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Clinical Task Board */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Staff Clinical Action Items
            </span>

            <div className="flex items-center gap-1.5">
              {['ALL', 'pending', 'completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase ${
                    taskFilter === filter
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs font-mono">
              No tasks currently pending in this category.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    task.status === 'completed'
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() =>
                        markTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')
                      }
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-700 hover:border-cyan-500'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-xs ${
                            task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.autoGeneratedByAI && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                            AI ORDER
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          Patient: {task.patient?.fullName || 'N/A'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        task.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedChartPatient && (
        <PatientChartModal
          patientId={selectedChartPatient._id}
          onClose={() => setSelectedChartPatient(null)}
        />
      )}

      {selectedVitalsPatient && (
        <QuickVitalsModal
          patient={selectedVitalsPatient}
          onClose={() => setSelectedVitalsPatient(null)}
        />
      )}
    </div>
  );
};
