import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Activity,
  Stethoscope,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { useHospital } from '../context/HospitalContext';
import { getTriageBadgeStyle, getWardColor } from '../utils/triageUtils';

export const AITriagePage = () => {
  const { patients, refreshAllData } = useHospital();

  // Intake Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(58);
  const [patientGender, setPatientGender] = useState('Male');
  const [chiefComplaint, setChiefComplaint] = useState(
    'Crushing retrosternal chest pain radiating to left arm and jaw, onset 45 minutes ago with severe diaphoresis'
  );
  const [symptoms, setSymptoms] = useState([
    'Substernal Chest Pain',
    'Diaphoresis',
    'Shortness of Breath',
    'Dizziness',
  ]);
  const [nurseNotes, setNurseNotes] = useState(
    'Patient is pale, clutching chest in tripod position. States pain is 10/10. Mild cyanosis around nailbeds. Skin cool and clammy. Immediate physician exam requested.'
  );

  const [vitals, setVitals] = useState({
    heartRate: 122,
    systolicBP: 168,
    diastolicBP: 102,
    spo2: 89,
    respiratoryRate: 26,
    temperature: 37.4,
  });

  const [evaluating, setEvaluating] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [triageHistory, setTriageHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/triage/history');
      setTriageHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Demo Case Presets for Instant 1-Click Evaluation
  const loadPreset = (preset) => {
    if (preset === 'STEMI') {
      setPatientName('Robert Kingsley');
      setPatientAge(62);
      setPatientGender('Male');
      setChiefComplaint('Acute crushing retrosternal pressure radiating to left arm and jaw with profuse diaphoresis');
      setSymptoms(['Chest Pain', 'Shortness of Breath', 'Diaphoresis', 'Nausea']);
      setNurseNotes('Patient exhibits levine sign, distress, cool clammy extremities. Vital signs unstable. ECG shows ST elevation.');
      setVitals({ heartRate: 124, systolicBP: 172, diastolicBP: 104, spo2: 88, respiratoryRate: 28, temperature: 37.1 });
    } else if (preset === 'ASTHMA') {
      setPatientName('Chloe Vance');
      setPatientAge(27);
      setPatientGender('Female');
      setChiefComplaint('Severe acute bronchospasm refractory to 4 doses of albuterol inhaler');
      setSymptoms(['Severe Wheezing', 'Accessory Muscle Use', 'Tachypnea']);
      setNurseNotes('Patient speaking in 2-word phrases. Marked intercostal retractions and suprasternal notch indrawing.');
      setVitals({ heartRate: 116, systolicBP: 138, diastolicBP: 88, spo2: 91, respiratoryRate: 30, temperature: 37.0 });
    } else if (preset === 'ABDOMINAL') {
      setPatientName('Ethan Gallagher');
      setPatientAge(39);
      setPatientGender('Male');
      setChiefComplaint('Gradual right lower quadrant abdominal pain with low-grade fever and anorexia');
      setSymptoms(['Abdominal Pain', 'Nausea', 'Low-grade Fever']);
      setNurseNotes('Positive McBurney sign. Patient walking guardedly. Hemodynamically stable.');
      setVitals({ heartRate: 78, systolicBP: 122, diastolicBP: 76, spo2: 99, respiratoryRate: 16, temperature: 38.1 });
    }
  };

  const handleVitalsChange = (field, val) => {
    setVitals((prev) => ({
      ...prev,
      [field]: parseFloat(val) || 0,
    }));
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setEvaluating(true);
    setErrorMsg('');
    setTriageResult(null);

    try {
      let targetPatientId = selectedPatientId;

      // If creating new incoming patient
      if (isNewPatient || !targetPatientId) {
        const createRes = await api.post('/patients', {
          fullName: patientName || 'Unregistered Intake Patient',
          age: patientAge,
          gender: patientGender,
          chiefComplaint,
          initialVitals: vitals,
        });
        targetPatientId = createRes.data.patient._id;
      }

      // Run AI Triage
      const res = await api.post('/triage/evaluate', {
        patientId: targetPatientId,
        chiefComplaint,
        symptoms,
        nurseNotes,
        vitals,
      });

      setTriageResult(res.data);
      await fetchHistory();
      await refreshAllData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'AI Triage evaluation failed. Please verify connection.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Triage & Workflow Orchestration
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Google Gemini 2.5 Flash Autonomous Clinical Assessment & Task Dispatch
          </p>
        </div>

        {/* 1-Click Demo Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Load Preset:
          </span>
          <button
            type="button"
            onClick={() => loadPreset('STEMI')}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-mono transition-colors"
          >
            Acute STEMI (ESI 1)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('ASTHMA')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 text-amber-300 text-xs font-mono transition-colors"
          >
            Asthma Crisis (ESI 2)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('ABDOMINAL')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Appendicitis (ESI 4)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Intake Form vs. Live AI Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Intake Form (7 cols) */}
        <form onSubmit={handleEvaluate} className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Patient Demographics & Intake
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatient(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono ${
                    isNewPatient ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  New Intake
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewPatient(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono ${
                    !isNewPatient ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Existing Patient
                </button>
              </div>
            </div>

            {/* Demographics */}
            {isNewPatient ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-mono text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Robert Kingsley"
                    className="mt-1 w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400">Age & Gender</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                      className="w-16 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-2 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white font-mono focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-mono text-slate-400">Select Existing Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    const found = patients.find((p) => p._id === e.target.value);
                    if (found) {
                      setChiefComplaint(found.chiefComplaint);
                      if (found.latestVitals) setVitals(found.latestVitals);
                    }
                  }}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} (MRN: {p.mrn}) • {p.triagePriority}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Chief Complaint */}
            <div>
              <label className="text-[11px] font-mono text-slate-400">Chief Complaint & Symptoms</label>
              <textarea
                rows={2}
                required
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe presenting complaint..."
                className="mt-1 w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white focus:outline-none leading-relaxed"
              />
            </div>

            {/* Vitals Telemetry Input Matrix */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                Initial Vital Parameters (Bedside Telemetry)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Heart Rate (bpm)
                  </span>
                  <input
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                    className="mt-1 w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" /> SpO2 (%)
                  </span>
                  <input
                    type="number"
                    value={vitals.spo2}
                    onChange={(e) => handleVitalsChange('spo2', e.target.value)}
                    className="mt-1 w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3 text-emerald-400" /> BP Systolic (mmHg)
                  </span>
                  <input
                    type="number"
                    value={vitals.systolicBP}
                    onChange={(e) => handleVitalsChange('systolicBP', e.target.value)}
                    className="mt-1 w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3 text-emerald-400" /> BP Diastolic (mmHg)
                  </span>
                  <input
                    type="number"
                    value={vitals.diastolicBP}
                    onChange={(e) => handleVitalsChange('diastolicBP', e.target.value)}
                    className="mt-1 w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">Resp Rate (br/min)</span>
                  <input
                    type="number"
                    value={vitals.respiratoryRate}
                    onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
                    className="mt-1 w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" /> Temp (°C)
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                    className="mt-1 w-full bg-transparent font-mono font-bold text-base text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Nurse Clinical Assessment Observations */}
            <div>
              <label className="text-[11px] font-mono text-slate-400">
                Triage Nurse Clinical Observations & Free-Text Logs
              </label>
              <textarea
                rows={3}
                required
                value={nurseNotes}
                onChange={(e) => setNurseNotes(e.target.value)}
                placeholder="Enter nursing inspection details, physical presentation, patient orientation..."
                className="mt-1 w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white focus:outline-none leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={evaluating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-cyan-200 ${evaluating ? 'animate-spin' : ''}`} />
              {evaluating ? 'Gemini AI Orchestrating Workflow...' : 'Execute AI Triage & Auto-Assign Staff'}
            </button>
          </div>
        </form>

        {/* Right Column: AI Live Results & Workflow Dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {evaluating ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Google Gemini Analyzing Presentation</h4>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-xs">
                  Computing ESI score, physiological trajectory, ward assignment, and staff dispatch...
                </p>
              </div>
            </div>
          ) : triageResult ? (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    AI Triage Assessment
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                  {triageResult.evaluation?.modelUsed}
                </span>
              </div>

              {/* Triage Severity Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  triageResult.evaluation?.severity === 'CRITICAL'
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                    : triageResult.evaluation?.severity === 'URGENT'
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">
                    TRIAGE SEVERITY LEVEL
                  </span>
                  <div className="text-xl font-extrabold tracking-tight mt-0.5">
                    ESI LEVEL {triageResult.evaluation?.esiScore} • {triageResult.evaluation?.severity}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase block text-slate-400">
                    Recommended Ward
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-1 rounded border mt-0.5 inline-block ${getWardColor(
                      triageResult.evaluation?.recommendedWard
                    )}`}
                  >
                    {triageResult.evaluation?.recommendedWard}
                  </span>
                </div>
              </div>

              {/* Clinical Rationale */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Physiological Analysis & Risk
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {triageResult.evaluation?.clinicalRationale}
                </p>
              </div>

              {/* Auto-Assigned Staff */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Auto-Assigned Primary Responder
                    </span>
                    <span className="text-xs font-bold text-white">
                      {triageResult.assignedStaff?.name || 'Emergency Attending Physician'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 capitalize bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {triageResult.assignedStaff?.role || 'doctor'}
                </span>
              </div>

              {/* Immediate Clinical Actions & Tasks */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-2">
                  Immediate Clinical Protocol ({triageResult.autoGeneratedTasks?.length || 0} Auto-Generated Tasks)
                </span>
                <div className="space-y-2">
                  {triageResult.evaluation?.immediateActions?.map((action, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs min-h-[400px] flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-500/40" />
              <div className="max-w-xs">
                <h4 className="font-semibold text-slate-300">Awaiting Triage Submission</h4>
                <p className="mt-1 text-slate-500">
                  Submit incoming patient logs or select a 1-click preset to trigger Gemini AI severity classification and staff task dispatch.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Triage Log */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Recent AI Triage History
          </span>
          <span className="text-[11px] font-mono text-slate-500">{triageHistory.length} evaluations</span>
        </div>

        <div className="space-y-2.5">
          {triageHistory.map((item) => (
            <div
              key={item._id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                    item.aiSeverity === 'CRITICAL'
                      ? 'bg-rose-950 border-rose-800 text-rose-300'
                      : item.aiSeverity === 'URGENT'
                      ? 'bg-amber-950 border-amber-800 text-amber-300'
                      : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                  }`}
                >
                  ESI {item.esiScore} • {item.aiSeverity}
                </div>
                <div>
                  <span className="font-bold text-white">{item.patient?.fullName || 'Anonymous Patient'}</span>
                  <span className="text-slate-400 text-[11px] ml-2 font-mono">
                    MRN: {item.patient?.mrn || 'N/A'}
                  </span>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.clinicalRationale}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono shrink-0">
                <span>Ward: {item.recommendedWard}</span>
                <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
