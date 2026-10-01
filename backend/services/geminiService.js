const { getGeminiClient } = require('../config/gemini');

/**
 * Heuristic clinical fallback for ESI triage when Gemini API is unavailable or offline
 */
const runClinicalFallbackTriage = ({ chiefComplaint, vitals, nurseNotes }) => {
  const { heartRate, systolicBP, diastolicBP, spo2, respiratoryRate, temperature } = vitals || {};

  let esiScore = 4;
  let severity = 'STABLE';
  let recommendedWard = 'General';
  let actions = ['Standard nurse assessment', 'Hydration and observation'];
  let requiredRole = 'nurse';
  let rationale = 'Patient presents with stable baseline vital parameters without acute distress.';

  const isSevereVitals =
    spo2 < 90 ||
    heartRate > 135 ||
    heartRate < 45 ||
    systolicBP > 190 ||
    systolicBP < 80 ||
    respiratoryRate > 30 ||
    respiratoryRate < 8;

  const isModerateVitals =
    (spo2 >= 90 && spo2 < 94) ||
    (heartRate > 105 && heartRate <= 135) ||
    (systolicBP >= 160 && systolicBP <= 190) ||
    temperature > 39.2;

  const notesLower = (nurseNotes + ' ' + chiefComplaint).toLowerCase();

  const cardiacKeywords = ['chest pain', 'stemi', 'infarction', 'cardiac arrest', 'angina', 'crushing pressure'];
  const respKeywords = ['shortness of breath', 'stridor', 'gasping', 'cyanosis', 'anaphylaxis', 'asphyxia'];
  const neuroKeywords = ['stroke', 'altered mental', 'unresponsive', 'seizure', 'hemiplegia', 'slurred speech'];
  const traumaKeywords = ['gunshot', 'stab', 'head trauma', 'hemorrhage', 'arterial bleed', 'compound fracture'];

  if (
    isSevereVitals ||
    cardiacKeywords.some((k) => notesLower.includes(k)) ||
    respKeywords.some((k) => notesLower.includes(k)) ||
    neuroKeywords.some((k) => notesLower.includes(k)) ||
    traumaKeywords.some((k) => notesLower.includes(k))
  ) {
    esiScore = 1;
    severity = 'CRITICAL';
    recommendedWard = 'ICU';
    requiredRole = 'doctor';
    actions = [
      'Stat Physician bedside evaluation',
      'Continuous multi-lead cardiac & SpO2 monitoring',
      'Establish dual large-bore IV access',
      'Stat Arterial Blood Gas (ABG) & Emergency Lab Panel',
      'Prepare emergency airway / crash cart standby',
    ];
    rationale = `High-acuity alert: Patient vital markers indicate imminent cardiopulmonary risk or severe hemodynamic collapse (SpO2: ${spo2}%, HR: ${heartRate} bpm, BP: ${systolicBP}/${diastolicBP} mmHg). Requires immediate physician intervention.`;
  } else if (isModerateVitals || notesLower.includes('severe pain') || notesLower.includes('fracture') || notesLower.includes('syncope')) {
    esiScore = 2;
    severity = 'URGENT';
    recommendedWard = 'Emergency';
    requiredRole = 'doctor';
    actions = [
      'Physician review within 15 minutes',
      'Targeted diagnostic imaging / ECG',
      'Administer analgesia / IV fluids as indicated',
      'Continuous telemetry monitoring',
    ];
    rationale = `Urgent triage alert: Vital parameter deviation and clinical presentation warrant rapid intervention to avoid clinical deterioration.`;
  } else if (notesLower.includes('moderate pain') || notesLower.includes('fever') || notesLower.includes('vomiting')) {
    esiScore = 3;
    severity = 'SEMI_URGENT';
    recommendedWard = 'Emergency';
    requiredRole = 'nurse';
    actions = ['Routine lab panel draw', 'Symptomatic medication administration', 'Re-evaluate vitals every 30 minutes'];
    rationale = `Moderate acuity: Patient requires multiple diagnostic evaluations but maintains adequate hemodynamic stability.`;
  }

  return {
    esiScore,
    severity,
    recommendedWard,
    clinicalRationale: rationale,
    immediateActions: actions,
    requiredStaffRole: requiredRole,
    isFallback: true,
    modelUsed: 'heuristic-emergency-protocol-v1',
  };
};

/**
 * Execute Gemini AI Triage analysis using the Google Gen AI SDK
 */
const evaluatePatientTriage = async ({ patientName, age, gender, chiefComplaint, symptoms, vitals, nurseNotes }) => {
  const aiClient = getGeminiClient();

  if (!aiClient) {
    console.log('[AI Engine] No Gemini API key detected in .env; executing heuristic emergency triage rule engine.');
    return runClinicalFallbackTriage({ chiefComplaint, vitals, nurseNotes });
  }

  const prompt = `
You are an expert Chief Emergency Medicine Triage Physician at an advanced Trauma & Intensive Care Center.
Analyze the following patient presentation, vital signs, and nurse intake observations using the standardized Emergency Severity Index (ESI) algorithm:

Patient Profile:
- Name: ${patientName || 'Anonymous'}
- Age: ${age}, Gender: ${gender}
- Chief Complaint: ${chiefComplaint}
- Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms || 'None reported'}
- Recorded Vitals:
  * Heart Rate: ${vitals.heartRate} bpm
  * Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
  * SpO2: ${vitals.spo2}%
  * Respiratory Rate: ${vitals.respiratoryRate} breaths/min
  * Body Temperature: ${vitals.temperature} °C
- Nurse Intake Assessment: "${nurseNotes}"

Clinical Tasks:
1. Determine the ESI Score (1: Resuscitation/Immediate, 2: Emergent, 3: Urgent, 4: Less Urgent, 5: Non-Urgent).
2. Classify Triage Severity as: "CRITICAL", "URGENT", "SEMI_URGENT", or "STABLE".
3. Recommend best Hospital Ward placement: "ICU", "Emergency", "Cardiology", or "General".
4. Provide a succinct 2-sentence clinical rationale explaining the physiological threat and justifying the priority.
5. Provide an array of 3 to 5 immediate, prioritized clinical actions (medications, tests, interventions).
6. Designate the required primary responder role: "doctor" or "nurse".

Output strictly valid JSON with no markdown formatting or backticks:
{
  "esiScore": 1,
  "severity": "CRITICAL",
  "recommendedWard": "ICU",
  "clinicalRationale": "Rationale string here",
  "immediateActions": ["Action 1", "Action 2", "Action 3"],
  "requiredStaffRole": "doctor"
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text ? response.text.trim() : '';
    // Clean potential markdown fences just in case
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanedText);

    // Validate expected fields
    const validSeverities = ['CRITICAL', 'URGENT', 'SEMI_URGENT', 'STABLE'];
    const validWards = ['ICU', 'Emergency', 'Cardiology', 'General'];

    return {
      esiScore: Number(parsed.esiScore) || 3,
      severity: validSeverities.includes(parsed.severity) ? parsed.severity : 'URGENT',
      recommendedWard: validWards.includes(parsed.recommendedWard) ? parsed.recommendedWard : 'Emergency',
      clinicalRationale: parsed.clinicalRationale || 'AI triage assessment completed based on presenting vitals and complaints.',
      immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions : ['Conduct physician exam', 'Monitor vitals'],
      requiredStaffRole: parsed.requiredStaffRole === 'nurse' ? 'nurse' : 'doctor',
      isFallback: false,
      modelUsed: 'gemini-2.5-flash',
    };
  } catch (error) {
    console.error('[AI Engine] Gemini API call failed:', error.message);
    console.log('[AI Engine] Engaging clinical fallback protocol...');
    return runClinicalFallbackTriage({ chiefComplaint, vitals, nurseNotes });
  }
};

module.exports = {
  evaluatePatientTriage,
  runClinicalFallbackTriage,
};
