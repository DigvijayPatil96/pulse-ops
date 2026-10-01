import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Wind,
  Thermometer,
  UserCheck,
  Stethoscope,
  Sparkles,
  BedDouble,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { VitalsLiveWave } from './VitalsLiveWave';
import { getTriageBadgeStyle, getWardColor } from '../../utils/triageUtils';
import { checkVitalStatus } from '../../utils/vitalsThresholds';
import { useHospital } from '../../context/HospitalContext';

export const BedStatusCard = ({ bed, onOpenChart, onQuickVitals, onAssignPatient }) => {
  const { releaseBed, assignBed } = useHospital();
  const patient = bed.currentPatient;
  const vitals = patient?.latestVitals || {};

  const hrStatus = checkVitalStatus('heartRate', vitals.heartRate);
  const spo2Status = checkVitalStatus('spo2', vitals.spo2);
  const bpStatus = checkVitalStatus('systolicBP', vitals.systolicBP);

  const isCriticalAcuity = patient?.triagePriority === 'CRITICAL' || vitals.isAbnormal;
  const triageBadge = patient ? getTriageBadgeStyle(patient.triagePriority, patient.esiScore) : null;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
        isCriticalAcuity
          ? 'bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-900 border-rose-500/40 shadow-xl shadow-rose-950/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg'
      }`}
    >
      {/* Top Header: Bed Number, Ward & Status */}
      <div className="p-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-base text-white tracking-wider">
              {bed.bedNumber}
            </span>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getWardColor(
                bed.ward
              )}`}
            >
              {bed.ward}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {bed.status === 'occupied' && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TELEMETRY ACTIVE
              </span>
            )}
            {bed.status === 'available' && (
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                READY FOR INTAKE
              </span>
            )}
            {bed.status === 'cleaning' && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded-full">
                SANITIZING
              </span>
            )}
          </div>
        </div>

        {/* Patient Header if Occupied */}
        {bed.status === 'occupied' && patient ? (
          <div className="mt-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm hover:text-cyan-400 transition-colors">
                  {patient.fullName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {patient.age}y • {patient.gender?.[0]}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]" title={patient.chiefComplaint}>
                {patient.chiefComplaint}
              </p>
            </div>

            {/* Triage Badge */}
            {triageBadge && (
              <div
                className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${triageBadge.bg} ${triageBadge.border} ${triageBadge.text} ${triageBadge.glow}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${triageBadge.dot}`} />
                {triageBadge.label}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs font-mono">
            {bed.status === 'available' ? 'No patient assigned' : 'Sanitization cycle in progress'}
          </div>
        )}
      </div>

      {/* Middle: Live Simulated Telemetry Stream if Occupied */}
      {bed.status === 'occupied' && patient && (
        <div className="p-4 space-y-3">
          {/* ECG Live Rhythm Canvas */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> LEAD II ECG
              </span>
              <span className={hrStatus.status === 'critical' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {hrStatus.text}
              </span>
            </div>
            <VitalsLiveWave
              heartRate={vitals.heartRate || 75}
              isAbnormal={vitals.isAbnormal || hrStatus.status === 'critical'}
              height={44}
            />
          </div>

          {/* Vitals Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Heart Rate */}
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                hrStatus.status === 'critical'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                <Heart className={`w-3 h-3 ${hrStatus.status === 'critical' ? 'text-rose-400 animate-ping' : 'text-rose-400'}`} />
                <span>HR (bpm)</span>
              </div>
              <div className="mt-1 font-mono font-extrabold text-lg text-white">
                {vitals.heartRate || '--'}
              </div>
            </div>

            {/* SpO2 */}
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                spo2Status.status === 'critical'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>SpO2</span>
              </div>
              <div className="mt-1 font-mono font-extrabold text-lg text-white">
                {vitals.spo2 ? `${vitals.spo2}%` : '--'}
              </div>
            </div>

            {/* Blood Pressure */}
            <div
              className={`p-2 rounded-xl border text-center transition-all ${
                bpStatus.status === 'critical'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                <Stethoscope className="w-3 h-3 text-emerald-400" />
                <span>BP (mmHg)</span>
              </div>
              <div className="mt-1 font-mono font-extrabold text-xs sm:text-sm text-white pt-1">
                {vitals.systolicBP && vitals.diastolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP}` : '--'}
              </div>
            </div>

            {/* Temp & Resp Rate */}
            <div className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                <Thermometer className="w-3 h-3 text-amber-400" />
                <span>TEMP/RR</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-200 font-bold pt-1">
                {vitals.temperature ? `${vitals.temperature}°C` : '--'} • {vitals.respiratoryRate || '--'}
              </div>
            </div>
          </div>

          {/* Assigned Staff Status */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Attending: {patient.assignedDoctor?.name || 'Unassigned'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              MRN: {patient.mrn}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {bed.status === 'occupied' && patient ? (
          <>
            <button
              onClick={() => onQuickVitals && onQuickVitals(patient)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
            >
              Update Vitals
            </button>
            <button
              onClick={() => onOpenChart && onOpenChart(patient)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors text-center"
            >
              Patient Chart
            </button>
            <button
              onClick={() => releaseBed(bed._id)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 text-xs transition-colors"
              title="Discharge / Release Bed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        ) : bed.status === 'available' ? (
          <button
            onClick={() => onAssignPatient && onAssignPatient(bed)}
            className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Assign Incoming Patient
          </button>
        ) : (
          <button
            onClick={() => useHospital().assignBed(bed._id, null)} // or update status
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Mark Bed Ready
          </button>
        )}
      </div>
    </div>
  );
};
