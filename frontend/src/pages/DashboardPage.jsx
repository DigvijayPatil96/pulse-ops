import React, { useState } from 'react';
import { Search, Filter, RefreshCw, UserPlus, Sparkles } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { BottleneckBanner } from '../components/dashboard/BottleneckBanner';
import { BedStatusCard } from '../components/dashboard/BedStatusCard';
import { PatientChartModal } from '../components/staff/PatientChartModal';
import { QuickVitalsModal } from '../components/staff/QuickVitalsModal';
import { AssignPatientModal } from '../components/beds/AssignPatientModal';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { beds, loading, refreshAllData, lastTickTime } = useHospital();

  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [chartPatient, setChartPatient] = useState(null);
  const [vitalsPatient, setVitalsPatient] = useState(null);
  const [assignBedTarget, setAssignBedTarget] = useState(null);

  const wards = ['ALL', 'ICU', 'Emergency', 'Cardiology', 'General'];
  const statuses = ['ALL', 'occupied', 'available', 'cleaning'];

  const filteredBeds = beds.filter((bed) => {
    const matchesWard = selectedWard === 'ALL' || bed.ward === selectedWard;
    const matchesStatus = selectedStatus === 'ALL' || bed.status === selectedStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bed.currentPatient &&
        (bed.currentPatient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bed.currentPatient.mrn.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesWard && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Hospital Operations Command Center
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active Multi-Ward Telemetry & AI Patient Routing
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/triage"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            AI Triage Intake
          </Link>
          <button
            onClick={refreshAllData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Refresh All Operations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Operational Bottleneck Alert Banner */}
      <BottleneckBanner />

      {/* Real-Time Acuity & Bed Metrics */}
      <MetricsOverview />

      {/* Ward Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        {/* Ward Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {wards.map((ward) => (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 ${
                selectedWard === ward
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {ward === 'ALL' ? 'All Units' : ward}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bed, Patient, MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="occupied">Occupied</option>
            <option value="available">Ready</option>
            <option value="cleaning">Cleaning</option>
          </select>
        </div>
      </div>

      {/* Dynamic Hospital Beds Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Active Hospital Units ({filteredBeds.length})
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {lastTickTime ? `Telemetry tick synced ${new Date(lastTickTime).toLocaleTimeString()}` : 'Live Stream Listening'}
          </span>
        </div>

        {filteredBeds.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            No hospital beds match the designated ward or status filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredBeds.map((bed) => (
              <BedStatusCard
                key={bed._id}
                bed={bed}
                onOpenChart={(patient) => setChartPatient(patient)}
                onQuickVitals={(patient) => setVitalsPatient(patient)}
                onAssignPatient={(targetBed) => setAssignBedTarget(targetBed)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {chartPatient && (
        <PatientChartModal
          patientId={chartPatient._id}
          onClose={() => setChartPatient(null)}
        />
      )}

      {vitalsPatient && (
        <QuickVitalsModal
          patient={vitalsPatient}
          onClose={() => setVitalsPatient(null)}
        />
      )}

      {assignBedTarget && (
        <AssignPatientModal
          bed={assignBedTarget}
          onClose={() => setAssignBedTarget(null)}
        />
      )}
    </div>
  );
};
