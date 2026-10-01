let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join specific ward or patient telemetry channel
    socket.on('join:ward', (ward) => {
      socket.join(`ward:${ward}`);
      console.log(`[Socket.io] Client ${socket.id} joined ward:${ward}`);
    });

    socket.on('leave:ward', (ward) => {
      socket.leave(`ward:${ward}`);
    });

    socket.on('join:patient', (patientId) => {
      socket.join(`patient:${patientId}`);
    });

    socket.on('leave:patient', (patientId) => {
      socket.leave(`patient:${patientId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

const emitVitalsTick = (patientId, bedId, vitals) => {
  if (ioInstance) {
    ioInstance.emit('vitals:tick', {
      patientId,
      bedId,
      vitals,
      timestamp: new Date(),
    });
  }
};

const emitBedUpdate = (bed) => {
  if (ioInstance) {
    ioInstance.emit('bed:update', bed);
  }
};

const emitAlert = (alert) => {
  if (ioInstance) {
    ioInstance.emit('alert:new', alert);
  }
};

const emitAlertResolved = (alertId) => {
  if (ioInstance) {
    ioInstance.emit('alert:resolved', { alertId });
  }
};

const emitTriageUpdate = (triageData) => {
  if (ioInstance) {
    ioInstance.emit('triage:new', triageData);
  }
};

const emitTaskUpdate = (task) => {
  if (ioInstance) {
    ioInstance.emit('task:update', task);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitVitalsTick,
  emitBedUpdate,
  emitAlert,
  emitAlertResolved,
  emitTriageUpdate,
  emitTaskUpdate,
};
