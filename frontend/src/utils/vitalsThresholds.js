export const checkVitalStatus = (type, value) => {
  switch (type) {
    case 'heartRate':
      if (value > 130 || value < 45) return { status: 'critical', text: 'Critical HR' };
      if (value > 100 || value < 55) return { status: 'warning', text: 'Tachy/Brady' };
      return { status: 'normal', text: 'Normal Sinus' };

    case 'spo2':
      if (value < 90) return { status: 'critical', text: 'Desaturation' };
      if (value < 94) return { status: 'warning', text: 'Low O2' };
      return { status: 'normal', text: 'Adequate O2' };

    case 'systolicBP':
      if (value > 180 || value < 80) return { status: 'critical', text: 'Severe BP' };
      if (value > 140 || value < 90) return { status: 'warning', text: 'Elevated/Low BP' };
      return { status: 'normal', text: 'Normotensive' };

    case 'respiratoryRate':
      if (value > 30 || value < 8) return { status: 'critical', text: 'Dyspnea/Apnea' };
      if (value > 22 || value < 10) return { status: 'warning', text: 'Tachypnea' };
      return { status: 'normal', text: 'Eupneic' };

    case 'temperature':
      if (value > 39.0 || value < 35.0) return { status: 'critical', text: 'High Pyrexia' };
      if (value > 38.0) return { status: 'warning', text: 'Febrile' };
      return { status: 'normal', text: 'Normothermic' };

    default:
      return { status: 'normal', text: 'Normal' };
  }
};
