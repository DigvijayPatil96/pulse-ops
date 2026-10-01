import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  const [beds, setBeds] = useState([]);
  const [bedStats, setBedStats] = useState({ total: 0, occupied: 0, available: 0, cleaning: 0, occupancyRate: 0 });
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [latestAlertToast, setLatestAlertToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastTickTime, setLastTickTime] = useState(null);

  const fetchBeds = useCallback(async () => {
    try {
      const res = await api.get('/beds');
      setBeds(res.data.beds || []);
      if (res.data.stats) setBedStats(res.data.stats);
    } catch (err) {
      console.error('[HospitalContext] Failed to fetch beds:', err.message);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('[HospitalContext] Failed to fetch patients:', err.message);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get('/alerts?isResolved=false');
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('[HospitalContext] Failed to fetch alerts:', err.message);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('[HospitalContext] Failed to fetch tasks:', err.message);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    await Promise.all([fetchBeds(), fetchPatients(), fetchAlerts(), fetchTasks()]);
    setLoading(false);
  }, [isAuthenticated, fetchBeds, fetchPatients, fetchAlerts, fetchTasks]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  // Real-Time Socket Event Subscriptions
  useEffect(() => {
    if (!socket) return;

    // Handle high-frequency vitals ticks
    const handleVitalsTick = ({ patientId, bedId, vitals }) => {
      setLastTickTime(Date.now());

      setBeds((prevBeds) =>
        prevBeds.map((bed) => {
          if (bed.currentPatient && bed.currentPatient._id === patientId) {
            return {
              ...bed,
              currentPatient: {
                ...bed.currentPatient,
                latestVitals: vitals,
              },
            };
          }
          return bed;
        })
      );

      setPatients((prevPatients) =>
        prevPatients.map((p) => {
          if (p._id === patientId) {
            return { ...p, latestVitals: vitals };
          }
          return p;
        })
      );
    };

    // Handle bed allocation / status changes
    const handleBedUpdate = (updatedBed) => {
      setBeds((prevBeds) => {
        const index = prevBeds.findIndex((b) => b._id === updatedBed._id);
        if (index !== -1) {
          const newBeds = [...prevBeds];
          newBeds[index] = { ...newBeds[index], ...updatedBed };
          return newBeds;
        }
        return [...prevBeds, updatedBed];
      });
      fetchBeds(); // re-sync stats
    };

    // Handle new operational bottleneck / clinical alarms
    const handleNewAlert = (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      setLatestAlertToast(newAlert);
      // Auto-dismiss toast after 6 seconds
      setTimeout(() => {
        setLatestAlertToast((current) => (current?._id === newAlert._id ? null : current));
      }, 6000);
    };

    // Handle resolved alert
    const handleAlertResolved = ({ alertId }) => {
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    };

    // Handle task updates
    const handleTaskUpdate = (updatedTask) => {
      setTasks((prev) => {
        const exists = prev.find((t) => t._id === updatedTask._id);
        if (exists) {
          return prev.map((t) => (t._id === updatedTask._id ? updatedTask : t));
        }
        return [updatedTask, ...prev];
      });
    };

    // Handle AI Triage updates
    const handleTriageNew = () => {
      fetchPatients();
      fetchBeds();
      fetchTasks();
    };

    socket.on('vitals:tick', handleVitalsTick);
    socket.on('bed:update', handleBedUpdate);
    socket.on('alert:new', handleNewAlert);
    socket.on('alert:resolved', handleAlertResolved);
    socket.on('task:update', handleTaskUpdate);
    socket.on('triage:new', handleTriageNew);

    return () => {
      socket.off('vitals:tick', handleVitalsTick);
      socket.off('bed:update', handleBedUpdate);
      socket.off('alert:new', handleNewAlert);
      socket.off('alert:resolved', handleAlertResolved);
      socket.off('task:update', handleTaskUpdate);
      socket.off('triage:new', handleTriageNew);
    };
  }, [socket, fetchBeds, fetchPatients, fetchTasks]);

  const resolveAlert = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      console.error('[HospitalContext] Failed to resolve alert:', err.message);
    }
  };

  const updateVitals = async (patientId, vitalsData) => {
    const res = await api.patch(`/patients/${patientId}/vitals`, vitalsData);
    return res.data;
  };

  const assignBed = async (bedId, patientId) => {
    const res = await api.patch(`/beds/${bedId}/assign`, { patientId });
    await fetchBeds();
    return res.data;
  };

  const releaseBed = async (bedId) => {
    const res = await api.patch(`/beds/${bedId}/release`);
    await fetchBeds();
    return res.data;
  };

  const markTaskStatus = async (taskId, status) => {
    const res = await api.patch(`/tasks/${taskId}/status`, { status });
    return res.data;
  };

  return (
    <HospitalContext.Provider
      value={{
        beds,
        bedStats,
        patients,
        alerts,
        tasks,
        latestAlertToast,
        setLatestAlertToast,
        loading,
        lastTickTime,
        refreshAllData,
        resolveAlert,
        updateVitals,
        assignBed,
        releaseBed,
        markTaskStatus,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => useContext(HospitalContext);
