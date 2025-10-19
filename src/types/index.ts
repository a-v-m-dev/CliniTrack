export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  allergies: string[];
  status: PatientStatus;
  cancerType?: string;
  stage?: 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV' | 'Unknown';
  diagnosisDate?: string;
  // Lifestyle and risk factors for AI assessment
  cancerHistory: boolean;
  smokingStatus: 'Current Smoker' | 'Non-Smoker';
  alcoholFrequency: 'Everyday' | 'Every Week' | 'Occasional' | 'Never';
  processedFoodPreference: 'Frequent' | 'Non-Frequent';
  fruitVegetableIntake: 'Frequent' | 'Non-Frequent';
  weight?: number; // in kg
  height?: number; // in cm
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  type: 'Blood Test' | 'Imaging' | 'Biopsy' | 'Urine Test' | 'Other';
  name: string;
  date: string;
  results: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
  uploadedBy: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
  doctorId: string;
  doctorName: string;
  vitals?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };
  followUpRequired?: boolean;
  followUpDate?: string;
  riskAssessment?: RiskAssessment;
}

export interface RiskAssessment {
  id: string;
  patientId: string;
  visitId: string;
  symptoms: string[];
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskScore: number;
  riskFactors: string[];
  confidence: number;
  factors: string[];
  recommendation: string;
  date: string;
  createdAt: string;
  doctorNotes?: string;
  doctorOverride?: boolean;
  // Cancer-specific fields
  suspectedCancerTypes?: string[];
  suggestedStage?: 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV' | 'Undetermined';
  recommendedTests?: string[];
  urgencyLevel?: 'Routine' | 'Priority' | 'Urgent' | 'Emergency';
}

export interface Analytics {
  totalPatients: number;
  newPatientsThisMonth: number;
  ongoingPatients: number;
  recurrenceCases: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
  followUpAlerts: number;
  commonSymptoms: { symptom: string; count: number }[];
  statusTrends: {
    month: string;
    ongoing: number;
    recurrence: number;
    cancerFree: number;
  }[];
}

export type PatientStatus = 'Ongoing' | 'Recurrence' | 'Cancer-Free' | 'Under Observation' | 'Deceased';