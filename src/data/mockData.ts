import { Patient, LabResult, Visit, RiskAssessment, Analytics } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Jose Miguel Reyes',
    age: 45,
    gender: 'Male',
    email: 'jose.reyes@email.com',
    phone: '+63 (917) 123-4567',
    address: '123 Rizal Street, Quezon City, Metro Manila 1100',
    emergencyContact: {
      name: 'Carmen Reyes',
      phone: '+63 (917) 123-4568',
      relationship: 'Spouse'
    },
    medicalHistory: ['Lung Cancer', 'Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Shellfish'],
    status: 'Ongoing',
    cancerType: 'Lung Cancer',
    stage: 'Stage II',
    diagnosisDate: '2024-01-15',
    cancerHistory: true,
    smokingStatus: 'Current Smoker',
    alcoholFrequency: 'Every Week',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 75,
    height: 170,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-20T14:15:00Z'
  },
  {
    id: '2',
    name: 'Rosa Linda Mendoza',
    age: 52,
    gender: 'Female',
    email: 'rosa.mendoza@email.com',
    phone: '+63 (918) 234-5678',
    address: '456 Bonifacio Avenue, Makati City, Metro Manila 1200',
    emergencyContact: {
      name: 'Carlo Mendoza',
      phone: '+63 (918) 234-5679',
      relationship: 'Son'
    },
    medicalHistory: ['Breast Cancer (2019)', 'Osteoporosis'],
    allergies: ['Latex'],
    status: 'Cancer-Free',
    cancerType: 'Breast Cancer',
    stage: 'Stage I',
    diagnosisDate: '2019-02-10',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 58,
    height: 162,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-03-18T11:45:00Z'
  },
  {
    id: '3',
    name: 'Antonio Luis Cruz',
    age: 38,
    gender: 'Male',
    email: 'antonio.cruz@email.com',
    phone: '+63 (919) 345-6789',
    address: '789 Mabini Street, Pasig City, Metro Manila 1600',
    emergencyContact: {
      name: 'Grace Cruz',
      phone: '+63 (919) 345-6790',
      relationship: 'Wife'
    },
    medicalHistory: ['Colorectal Cancer', 'Asthma'],
    allergies: ['Dust mites', 'Pollen'],
    status: 'Under Observation',
    cancerType: 'Colorectal Cancer',
    stage: 'Stage I',
    diagnosisDate: '2024-02-15',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 72,
    height: 175,
    createdAt: '2024-03-01T13:20:00Z',
    updatedAt: '2024-03-22T16:30:00Z'
  },
  {
    id: '4',
    name: 'Maria Esperanza Santos',
    age: 29,
    gender: 'Female',
    email: 'maria.santos@email.com',
    phone: '+63 (920) 456-7890',
    address: '321 Magsaysay Boulevard, Cebu City, Cebu 6000',
    emergencyContact: {
      name: 'Pedro Santos',
      phone: '+63 (920) 456-7891',
      relationship: 'Father'
    },
    medicalHistory: ['Breast Cancer', 'Gestational Diabetes'],
    allergies: ['Sulfa drugs'],
    status: 'Ongoing',
    cancerType: 'Breast Cancer',
    stage: 'Stage II',
    diagnosisDate: '2024-01-20',
    cancerHistory: false,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Never',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 55,
    height: 158,
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-03-15T09:30:00Z'
  },
  {
    id: '5',
    name: 'Carlos Eduardo Villanueva',
    age: 67,
    gender: 'Male',
    email: 'carlos.villanueva@email.com',
    phone: '+63 (921) 567-8901',
    address: '654 Roxas Avenue, Davao City, Davao del Sur 8000',
    emergencyContact: {
      name: 'Elena Villanueva',
      phone: '+63 (921) 567-8902',
      relationship: 'Spouse'
    },
    medicalHistory: ['Prostate Cancer (2021)', 'High Cholesterol', 'Arthritis'],
    allergies: ['None known'],
    status: 'Deceased',
    cancerType: 'Prostate Cancer',
    stage: 'Stage IV',
    diagnosisDate: '2021-01-05',
    cancerHistory: true,
    smokingStatus: 'Current Smoker',
    alcoholFrequency: 'Everyday',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 68,
    height: 165,
    createdAt: '2024-01-05T08:45:00Z',
    updatedAt: '2024-03-10T16:20:00Z'
  },
  {
    id: '6',
    name: 'Ana Cristina Dela Cruz',
    age: 41,
    gender: 'Female',
    email: 'ana.delacruz@email.com',
    phone: '+63 (922) 678-9012',
    address: '987 Burgos Street, Iloilo City, Iloilo 5000',
    emergencyContact: {
      name: 'Roberto Dela Cruz',
      phone: '+63 (922) 678-9013',
      relationship: 'Husband'
    },
    medicalHistory: ['Lung Cancer', 'Fibromyalgia', 'Anxiety Disorder'],
    allergies: ['Codeine', 'Peanuts'],
    status: 'Recurrence',
    cancerType: 'Lung Cancer',
    stage: 'Stage III',
    diagnosisDate: '2023-02-01',
    cancerHistory: true,
    smokingStatus: 'Current Smoker',
    alcoholFrequency: 'Every Week',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 62,
    height: 160,
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-03-25T12:45:00Z'
  },
  {
    id: '7',
    name: 'Miguel Angel Fernandez',
    age: 55,
    gender: 'Male',
    email: 'miguel.fernandez@email.com',
    phone: '+63 (923) 789-0123',
    address: '147 Jose Rizal Street, Baguio City, Benguet 2600',
    emergencyContact: {
      name: 'Luz Fernandez',
      phone: '+63 (923) 789-0124',
      relationship: 'Wife'
    },
    medicalHistory: ['Colorectal Cancer', 'Stroke (2020)', 'Hypertension'],
    allergies: ['Aspirin'],
    status: 'Cancer-Free',
    cancerType: 'Colorectal Cancer',
    stage: 'Stage II',
    diagnosisDate: '2022-01-12',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 78,
    height: 172,
    createdAt: '2024-01-12T10:20:00Z',
    updatedAt: '2024-03-28T15:10:00Z'
  },
  {
    id: '8',
    name: 'Gloria Beatriz Garcia',
    age: 63,
    gender: 'Female',
    email: 'gloria.garcia@email.com',
    phone: '+63 (924) 890-1234',
    address: '258 Luna Street, Zamboanga City, Zamboanga del Sur 7000',
    emergencyContact: {
      name: 'Manuel Garcia',
      phone: '+63 (924) 890-1235',
      relationship: 'Son'
    },
    medicalHistory: ['Breast Cancer', 'Diabetes Type 1', 'Kidney Disease'],
    allergies: ['Iodine'],
    status: 'Under Observation',
    cancerType: 'Breast Cancer',
    stage: 'Stage I',
    diagnosisDate: '2023-01-08',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Never',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 65,
    height: 155,
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-03-12T11:25:00Z'
  },
  {
    id: '9',
    name: 'Rafael Domingo Torres',
    age: 32,
    gender: 'Male',
    email: 'rafael.torres@email.com',
    phone: '+63 (925) 901-2345',
    address: '369 Aguinaldo Avenue, Cagayan de Oro, Misamis Oriental 9000',
    emergencyContact: {
      name: 'Isabel Torres',
      phone: '+63 (925) 901-2346',
      relationship: 'Mother'
    },
    medicalHistory: ['Lung Cancer', 'Depression', 'Migraines'],
    allergies: ['Latex', 'Eggs'],
    status: 'Ongoing',
    cancerType: 'Lung Cancer',
    stage: 'Stage I',
    diagnosisDate: '2024-02-15',
    cancerHistory: false,
    smokingStatus: 'Current Smoker',
    alcoholFrequency: 'Every Week',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 70,
    height: 178,
    createdAt: '2024-02-15T13:45:00Z',
    updatedAt: '2024-03-20T10:15:00Z'
  },
  {
    id: '10',
    name: 'Carmen Luisa Rodriguez',
    age: 48,
    gender: 'Female',
    email: 'carmen.rodriguez@email.com',
    phone: '+63 (926) 012-3456',
    address: '741 Del Pilar Street, Bacolod City, Negros Occidental 6100',
    emergencyContact: {
      name: 'Diego Rodriguez',
      phone: '+63 (926) 012-3457',
      relationship: 'Husband'
    },
    medicalHistory: ['Colorectal Cancer', 'Ovarian Cysts', 'Iron Deficiency Anemia'],
    allergies: ['Morphine'],
    status: 'Recurrence',
    cancerType: 'Colorectal Cancer',
    stage: 'Stage III',
    diagnosisDate: '2023-01-25',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 72,
    height: 163,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-03-18T14:30:00Z'
  },
  {
    id: '11',
    name: 'Roberto Luis Aguilar',
    age: 39,
    gender: 'Male',
    email: 'roberto.aguilar@email.com',
    phone: '+63 (927) 123-4567',
    address: '852 Quezon Boulevard, Tacloban City, Leyte 6500',
    emergencyContact: {
      name: 'Teresa Aguilar',
      phone: '+63 (927) 123-4568',
      relationship: 'Wife'
    },
    medicalHistory: ['Prostate Cancer', 'ADHD', 'Sleep Apnea'],
    allergies: ['Dust'],
    status: 'Cancer-Free',
    cancerType: 'Prostate Cancer',
    stage: 'Stage I',
    diagnosisDate: '2022-02-20',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 82,
    height: 180,
    createdAt: '2024-02-20T15:30:00Z',
    updatedAt: '2024-03-22T09:45:00Z'
  },
  {
    id: '12',
    name: 'Lorna Mae Gutierrez',
    age: 57,
    gender: 'Female',
    email: 'lorna.gutierrez@email.com',
    phone: '+63 (928) 234-5678',
    address: '963 Mabuhay Street, General Santos City, South Cotabato 9500',
    emergencyContact: {
      name: 'Fernando Gutierrez',
      phone: '+63 (928) 234-5679',
      relationship: 'Husband'
    },
    medicalHistory: ['Breast Cancer', 'Osteoarthritis', 'High Blood Pressure'],
    allergies: ['Penicillin', 'Nuts'],
    status: 'Ongoing',
    cancerType: 'Breast Cancer',
    stage: 'Stage II',
    diagnosisDate: '2024-01-10',
    cancerHistory: false,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Never',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 68,
    height: 160,
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-03-15T16:20:00Z'
  },
  {
    id: '13',
    name: 'Emilio Jose Ramos',
    age: 61,
    gender: 'Male',
    email: 'emilio.ramos@email.com',
    phone: '+63 (929) 345-6789',
    address: '174 Lapu-Lapu Avenue, Butuan City, Agusan del Norte 8600',
    emergencyContact: {
      name: 'Nora Ramos',
      phone: '+63 (929) 345-6790',
      relationship: 'Wife'
    },
    medicalHistory: ['Lung Cancer', 'Emphysema', 'Heart Disease'],
    allergies: ['Sulfa drugs', 'Shellfish'],
    status: 'Deceased',
    cancerType: 'Lung Cancer',
    stage: 'Stage IV',
    diagnosisDate: '2023-03-01',
    cancerHistory: true,
    smokingStatus: 'Current Smoker',
    alcoholFrequency: 'Everyday',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 58,
    height: 168,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-03-10T14:30:00Z'
  },
  {
    id: '14',
    name: 'Patricia Elena Morales',
    age: 44,
    gender: 'Female',
    email: 'patricia.morales@email.com',
    phone: '+63 (930) 456-7890',
    address: '285 Katipunan Street, Puerto Princesa City, Palawan 5300',
    emergencyContact: {
      name: 'Victor Morales',
      phone: '+63 (930) 456-7891',
      relationship: 'Husband'
    },
    medicalHistory: ['Colorectal Cancer', 'Thyroid Disorder'],
    allergies: ['Iodine contrast'],
    status: 'Under Observation',
    cancerType: 'Colorectal Cancer',
    stage: 'Stage II',
    diagnosisDate: '2023-05-15',
    cancerHistory: false,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 60,
    height: 165,
    createdAt: '2024-02-05T13:45:00Z',
    updatedAt: '2024-03-20T11:10:00Z'
  },
  {
    id: '15',
    name: 'Fernando Gabriel Silva',
    age: 36,
    gender: 'Male',
    email: 'fernando.silva@email.com',
    phone: '+63 (931) 567-8901',
    address: '396 Heroes Street, Legazpi City, Albay 4500',
    emergencyContact: {
      name: 'Angela Silva',
      phone: '+63 (931) 567-8902',
      relationship: 'Sister'
    },
    medicalHistory: ['Prostate Cancer', 'Anxiety'],
    allergies: ['Latex'],
    status: 'Ongoing',
    cancerType: 'Prostate Cancer',
    stage: 'Stage I',
    diagnosisDate: '2024-02-01',
    cancerHistory: false,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Every Week',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 76,
    height: 174,
    createdAt: '2024-02-01T10:30:00Z',
    updatedAt: '2024-03-25T15:45:00Z'
  },
  {
    id: '16',
    name: 'Sandra Vilma Castro',
    age: 53,
    gender: 'Female',
    email: 'sandra.castro@email.com',
    phone: '+63 (932) 678-9012',
    address: '407 Freedom Boulevard, Laoag City, Ilocos Norte 2900',
    emergencyContact: {
      name: 'Ricardo Castro',
      phone: '+63 (932) 678-9013',
      relationship: 'Husband'
    },
    medicalHistory: ['Breast Cancer', 'Diabetes Type 2'],
    allergies: ['Aspirin', 'Codeine'],
    status: 'Cancer-Free',
    cancerType: 'Breast Cancer',
    stage: 'Stage I',
    diagnosisDate: '2021-05-10',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Never',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 64,
    height: 157,
    createdAt: '2024-01-22T14:20:00Z',
    updatedAt: '2024-03-18T10:35:00Z'
  },
  {
    id: '17',
    name: 'Eduardo Miguel Herrera',
    age: 58,
    gender: 'Male',
    email: 'eduardo.herrera@email.com',
    phone: '+63 (933) 789-0123',
    address: '518 Unity Street, Tuguegarao City, Cagayan 3500',
    emergencyContact: {
      name: 'Carmen Herrera',
      phone: '+63 (933) 789-0124',
      relationship: 'Wife'
    },
    medicalHistory: ['Lung Cancer', 'COPD', 'Hypertension'],
    allergies: ['Penicillin'],
    status: 'Recurrence',
    cancerType: 'Lung Cancer',
    stage: 'Stage III',
    diagnosisDate: '2022-08-15',
    cancerHistory: true,
    smokingStatus: 'Current Smoker',
    alcoholFrequency: 'Every Week',
    processedFoodPreference: 'Frequent',
    fruitVegetableIntake: 'Non-Frequent',
    weight: 71,
    height: 169,
    createdAt: '2024-01-30T11:50:00Z',
    updatedAt: '2024-03-22T13:25:00Z'
  },
  {
    id: '18',
    name: 'Melissa Grace Jimenez',
    age: 35,
    gender: 'Female',
    email: 'melissa.jimenez@email.com',
    phone: '+63 (934) 890-1234',
    address: '629 Progress Avenue, Naga City, Camarines Sur 4400',
    emergencyContact: {
      name: 'Carlos Jimenez',
      phone: '+63 (934) 890-1235',
      relationship: 'Father'
    },
    medicalHistory: ['Colorectal Cancer', 'IBS'],
    allergies: ['Morphine', 'Dairy'],
    status: 'Under Observation',
    cancerType: 'Colorectal Cancer',
    stage: 'Stage I',
    diagnosisDate: '2023-12-01',
    cancerHistory: false,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 59,
    height: 164,
    createdAt: '2024-02-12T09:40:00Z',
    updatedAt: '2024-03-28T16:15:00Z'
  },
  {
    id: '19',
    name: 'Alfredo Ramon Pascual',
    age: 49,
    gender: 'Male',
    email: 'alfredo.pascual@email.com',
    phone: '+63 (935) 901-2345',
    address: '730 Victory Lane, Malolos City, Bulacan 3000',
    emergencyContact: {
      name: 'Linda Pascual',
      phone: '+63 (935) 901-2346',
      relationship: 'Wife'
    },
    medicalHistory: ['Prostate Cancer', 'Enlarged Prostate'],
    allergies: ['Sulfa drugs'],
    status: 'Cancer-Free',
    cancerType: 'Prostate Cancer',
    stage: 'Stage II',
    diagnosisDate: '2020-03-15',
    cancerHistory: true,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Occasional',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 80,
    height: 176,
    createdAt: '2024-01-15T12:30:00Z',
    updatedAt: '2024-03-20T14:50:00Z'
  },
  {
    id: '20',
    name: 'Diana Rosa Velasco',
    age: 42,
    gender: 'Female',
    email: 'diana.velasco@email.com',
    phone: '+63 (936) 012-3456',
    address: '841 Peace Street, San Fernando City, La Union 2500',
    emergencyContact: {
      name: 'Mario Velasco',
      phone: '+63 (936) 012-3457',
      relationship: 'Husband'
    },
    medicalHistory: ['Breast Cancer', 'Fibrocystic Breast Disease'],
    allergies: ['Iodine', 'Eggs'],
    status: 'Ongoing',
    cancerType: 'Breast Cancer',
    stage: 'Stage III',
    diagnosisDate: '2024-01-08',
    cancerHistory: false,
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Never',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: 66,
    height: 161,
    createdAt: '2024-01-08T15:20:00Z',
    updatedAt: '2024-03-25T12:40:00Z'
  }
];

export const mockLabResults: LabResult[] = [
  {
    id: '1',
    patientId: '1',
    type: 'Blood Test',
    name: 'Complete Blood Count',
    date: '2024-03-15T00:00:00Z',
    results: 'WBC: 8.5 (Normal), RBC: 4.2 (Normal), Hemoglobin: 12.8 g/dL (Normal), Hematocrit: 38% (Normal), Platelets: 280,000 (Normal)',
    uploadedBy: 'Dr. Juan Dela Cruz'
  },
  {
    id: '2',
    patientId: '2',
    type: 'Imaging',
    name: 'Mammogram',
    date: '2024-03-10T00:00:00Z',
    results: 'No suspicious masses or calcifications detected. Breast tissue appears normal with no signs of malignancy.',
    uploadedBy: 'Dr. Juan Dela Cruz'
  },
  {
    id: '3',
    patientId: '3',
    type: 'Biopsy',
    name: 'Colonoscopy with Biopsy',
    date: '2024-03-20T00:00:00Z',
    results: 'Small polyp removed from sigmoid colon. Pathology shows benign adenomatous polyp with no signs of malignancy.',
    uploadedBy: 'Dr. Juan Dela Cruz'
  },
  {
    id: '4',
    patientId: '4',
    type: 'Blood Test',
    name: 'Tumor Markers',
    date: '2024-03-12T00:00:00Z',
    results: 'CA 15-3: 28 U/mL (Elevated - Normal <30), CEA: 3.2 ng/mL (Normal <5.0), CA 125: 15 U/mL (Normal <35)',
    uploadedBy: 'Dr. Juan Dela Cruz'
  },
  {
    id: '5',
    patientId: '1',
    type: 'Imaging',
    name: 'Chest CT Scan',
    date: '2024-03-18T00:00:00Z',
    results: 'Stable lung nodule in right upper lobe measuring 2.1 cm. No new lesions identified. Mediastinal lymph nodes unchanged.',
    uploadedBy: 'Dr. Juan Dela Cruz'
  }
];

export const mockVisits: Visit[] = [
  {
    id: '1',
    patientId: '1',
    date: '2024-03-20T00:00:00Z',
    symptoms: ['Persistent cough', 'Shortness of breath', 'Chest pain'],
    diagnosis: 'Lung Cancer - Stage II, stable disease',
    treatment: 'Continue current chemotherapy regimen (Carboplatin + Paclitaxel). Next cycle scheduled in 3 weeks.',
    notes: 'Patient tolerating treatment well. Slight improvement in respiratory symptoms. Continue supportive care.',
    doctorId: '1',
    doctorName: 'Dr. Juan Dela Cruz',
    vitals: {
      bloodPressure: '135/85',
      heartRate: '78',
      temperature: '98.6°F',
      weight: '68 kg',
      height: '170 cm'
    },
    followUpRequired: true,
    followUpDate: '2024-04-10T00:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    date: '2024-03-18T00:00:00Z',
    symptoms: [],
    diagnosis: 'Breast Cancer - Complete remission, routine surveillance',
    treatment: 'Continue hormone therapy (Tamoxifen). Annual mammogram scheduled.',
    notes: 'Patient doing very well. No signs of recurrence. Continue current management plan.',
    doctorId: '1',
    doctorName: 'Dr. Juan Dela Cruz',
    vitals: {
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.4°F',
      weight: '58 kg',
      height: '162 cm'
    },
    followUpRequired: true,
    followUpDate: '2024-09-18T00:00:00Z'
  },
  {
    id: '3',
    patientId: '4',
    date: '2024-03-15T00:00:00Z',
    symptoms: ['Breast lump', 'Nipple discharge'],
    diagnosis: 'Breast Cancer - Stage II, responding to neoadjuvant therapy',
    treatment: 'Continue neoadjuvant chemotherapy. Surgery planned after completion of current regimen.',
    notes: 'Tumor showing good response to treatment. Patient managing side effects well with supportive medications.',
    doctorId: '1',
    doctorName: 'Dr. Juan Dela Cruz',
    vitals: {
      bloodPressure: '118/75',
      heartRate: '68',
      temperature: '98.2°F',
      weight: '55 kg',
      height: '158 cm'
    },
    followUpRequired: true,
    followUpDate: '2024-04-05T00:00:00Z'
  }
];

export const mockRiskAssessments: RiskAssessment[] = [
  {
    id: '1',
    patientId: '1',
    visitId: '1',
    symptoms: ['Persistent cough', 'Shortness of breath', 'Chest pain'],
    riskLevel: 'Moderate',
    riskScore: 45,
    riskFactors: ['Lung cancer indicator: Persistent cough', 'Lung cancer indicator: Shortness of breath', 'High-risk symptom: Chest pain'],
    confidence: 85,
    factors: ['Lung cancer indicator: Persistent cough', 'Lung cancer indicator: Shortness of breath', 'High-risk symptom: Chest pain'],
    recommendation: 'Priority scheduling: Arrange oncological evaluation within 1-2 weeks. Consider staging studies if cancer suspected.',
    date: '2024-03-20T00:00:00Z',
    createdAt: '2024-03-20T00:00:00Z',
    suspectedCancerTypes: ['Lung Cancer'],
    suggestedStage: 'Stage II',
    recommendedTests: ['Chest X-ray', 'CT Scan', 'Biopsy'],
    urgencyLevel: 'Priority'
  },
  {
    id: '2',
    patientId: '4',
    visitId: '3',
    symptoms: ['Breast lump', 'Nipple discharge'],
    riskLevel: 'High',
    riskScore: 70,
    riskFactors: ['Breast cancer indicator: Breast lump', 'Breast cancer indicator: Nipple discharge'],
    confidence: 90,
    factors: ['Breast cancer indicator: Breast lump', 'Breast cancer indicator: Nipple discharge'],
    recommendation: 'High priority: Schedule oncological consultation within 48-72 hours. Comprehensive diagnostic workup needed.',
    date: '2024-03-15T00:00:00Z',
    createdAt: '2024-03-15T00:00:00Z',
    suspectedCancerTypes: ['Breast Cancer'],
    suggestedStage: 'Stage II',
    recommendedTests: ['Mammogram', 'Ultrasound', 'Biopsy'],
    urgencyLevel: 'Urgent'
  }
];

// Helper function to calculate BMI
export function calculateBMI(weight?: number, height?: number): number | null {
  if (!weight || !height || weight <= 0 || height <= 0) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// Enhanced AI cancer risk assessment with lifestyle factors
export function generateRiskAssessment(symptoms: string[], patientAge: number, patientGender: string, patient?: Patient): RiskAssessment {
  // Cancer-specific symptom categories
  const breastCancerSymptoms = ['breast lump', 'nipple discharge', 'breast pain', 'skin dimpling', 'breast swelling', 'nipple changes'];
  const lungCancerSymptoms = ['persistent cough', 'shortness of breath', 'chest pain', 'coughing blood', 'hoarseness', 'recurrent respiratory infections'];
  const colorectalCancerSymptoms = ['blood in stool', 'abdominal pain', 'change in bowel habits', 'fatigue', 'abdominal cramping', 'rectal bleeding'];
  
  // Critical symptoms requiring immediate attention
  const emergencySymptoms = ['hemoptysis', 'coughing blood', 'severe weight loss', 'severe pain', 'difficulty breathing', 'blood in stool'];
  const highRiskSymptoms = ['unexplained weight loss', 'persistent pain', 'lump', 'swelling', 'skin changes', 'new growth'];
  const moderateRiskSymptoms = ['fatigue', 'loss of appetite', 'nausea', 'fever', 'weakness'];
  
  let riskScore = 0;
  let stageScore = 0;
  const factors: string[] = [];
  const suspectedCancerTypes: string[] = [];
  const recommendedTests: string[] = [];
  
  // Analyze symptoms for cancer type indicators
  let breastIndicators = 0;
  let lungIndicators = 0;
  let colorectalIndicators = 0;
  
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    
    // Check for breast cancer indicators
    if (breastCancerSymptoms.some(bcs => lowerSymptom.includes(bcs.toLowerCase()))) {
      breastIndicators++;
      riskScore += 25;
      factors.push(`Breast cancer indicator: ${symptom}`);
    }
    
    // Check for lung cancer indicators
    if (lungCancerSymptoms.some(lcs => lowerSymptom.includes(lcs.toLowerCase()))) {
      lungIndicators++;
      riskScore += 25;
      factors.push(`Lung cancer indicator: ${symptom}`);
    }
    
    // Check for colorectal cancer indicators
    if (colorectalCancerSymptoms.some(ccs => lowerSymptom.includes(ccs.toLowerCase()))) {
      colorectalIndicators++;
      riskScore += 25;
      factors.push(`Colorectal cancer indicator: ${symptom}`);
    }
    
    // Emergency symptoms
    if (emergencySymptoms.some(es => lowerSymptom.includes(es.toLowerCase()))) {
      riskScore += 40;
      stageScore += 30;
      factors.push(`Emergency symptom: ${symptom}`);
    } else if (highRiskSymptoms.some(hrs => lowerSymptom.includes(hrs.toLowerCase()))) {
      riskScore += 20;
      stageScore += 15;
      factors.push(`High-risk symptom: ${symptom}`);
    } else if (moderateRiskSymptoms.some(mrs => lowerSymptom.includes(mrs.toLowerCase()))) {
      riskScore += 10;
      stageScore += 5;
      factors.push(`Moderate-risk symptom: ${symptom}`);
    } else {
      riskScore += 5;
      factors.push(`Reported symptom: ${symptom}`);
    }
  });
  
  // NEW: Incorporate lifestyle and medical history factors
  if (patient) {
    // Cancer history
    if (patient.cancerHistory) {
      riskScore += 30;
      stageScore += 15;
      factors.push('Previous cancer history - significant risk factor');
    }
    
    // Smoking status
    if (patient.smokingStatus === 'Current Smoker') {
      riskScore += 25;
      stageScore += 10;
      factors.push('Current smoker - major cancer risk factor');
      if (lungIndicators > 0) {
        riskScore += 15; // Additional risk for lung symptoms + smoking
        factors.push('Smoking + respiratory symptoms - high lung cancer risk');
      }
    }
    
    // Alcohol frequency
    switch (patient.alcoholFrequency) {
      case 'Everyday':
        riskScore += 20;
        stageScore += 8;
        factors.push('Daily alcohol consumption - increased cancer risk');
        break;
      case 'Every Week':
        riskScore += 10;
        stageScore += 3;
        factors.push('Regular alcohol consumption - moderate risk factor');
        break;
      case 'Occasional':
        riskScore += 3;
        factors.push('Occasional alcohol consumption - minimal risk');
        break;
    }
    
    // Processed food preference
    if (patient.processedFoodPreference === 'Frequent') {
      riskScore += 15;
      stageScore += 5;
      factors.push('High processed food intake - increased cancer risk');
      if (colorectalIndicators > 0) {
        riskScore += 10; // Additional risk for colorectal symptoms + processed foods
        factors.push('High processed food intake + GI symptoms - colorectal cancer risk');
      }
    }
    
    // Fruit and vegetable intake (protective factor)
    if (patient.fruitVegetableIntake === 'Non-Frequent') {
      riskScore += 12;
      factors.push('Low fruit/vegetable intake - reduced protective factors');
    } else {
      riskScore -= 8; // Protective effect
      factors.push('Adequate fruit/vegetable intake - protective factor');
    }
    
    // BMI calculation and risk assessment
    const bmi = calculateBMI(patient.weight, patient.height);
    if (bmi) {
      if (bmi >= 30) {
        riskScore += 20;
        stageScore += 8;
        factors.push(`Obesity (BMI: ${bmi}) - significant cancer risk factor`);
      } else if (bmi >= 25) {
        riskScore += 10;
        stageScore += 3;
        factors.push(`Overweight (BMI: ${bmi}) - moderate cancer risk factor`);
      } else if (bmi < 18.5) {
        riskScore += 15;
        stageScore += 5;
        factors.push(`Underweight (BMI: ${bmi}) - possible malnutrition/cancer cachexia`);
      } else {
        riskScore -= 5; // Protective effect of normal weight
        factors.push(`Normal BMI (${bmi}) - healthy weight range`);
      }
    }
  }
  
  // Determine suspected cancer types
  if (breastIndicators >= 1) {
    suspectedCancerTypes.push('Breast Cancer');
    if (patientGender === 'Female') {
      recommendedTests.push('Mammogram', 'Ultrasound', 'Biopsy');
    }
  }
  if (lungIndicators >= 1) {
    suspectedCancerTypes.push('Lung Cancer');
    recommendedTests.push('Chest X-ray', 'CT Scan', 'Biopsy');
  }
  if (colorectalIndicators >= 1) {
    suspectedCancerTypes.push('Colorectal Cancer');
    recommendedTests.push('Colonoscopy', 'Biopsy', 'CT Scan (Abdomen & Pelvis)');
  }
  
  // Age-based risk factors
  if (patientAge >= 70) {
    riskScore += 25;
    stageScore += 10;
    factors.push('Elderly age (≥70) - increased cancer risk');
  } else if (patientAge >= 60) {
    riskScore += 15;
    stageScore += 5;
    factors.push('Advanced age (60-69) - elevated cancer risk');
  } else if (patientAge >= 50) {
    riskScore += 10;
    factors.push('Middle age (50-59) - moderate cancer risk');
  }
  
  // Gender-specific risk factors
  if (patientGender === 'Female' && patientAge >= 50 && breastIndicators > 0) {
    riskScore += 15;
    factors.push('Female gender with breast-related symptoms');
  }
  if (patientGender === 'Male' && patientAge >= 50 && lungIndicators > 0) {
    riskScore += 10;
    factors.push('Male gender with respiratory symptoms');
  }
  
  // Ensure minimum score is 0
  riskScore = Math.max(0, riskScore);
  
  // Determine risk level and urgency
  let riskLevel: 'Low' | 'Moderate' | 'High';
  let urgencyLevel: 'Routine' | 'Priority' | 'Urgent' | 'Emergency';
  let recommendation: string;
  let suggestedStage: 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV' | 'Undetermined';
  
  // Stage prediction based on symptom severity and lifestyle factors
  if (stageScore >= 50) {
    suggestedStage = 'Stage IV';
  } else if (stageScore >= 35) {
    suggestedStage = 'Stage III';
  } else if (stageScore >= 20) {
    suggestedStage = 'Stage II';
  } else if (stageScore >= 8) {
    suggestedStage = 'Stage I';
  } else {
    suggestedStage = 'Undetermined';
  }
  
  if (riskScore >= 80) {
    riskLevel = 'High';
    urgencyLevel = 'Emergency';
    recommendation = 'URGENT: Immediate oncological evaluation required. Emergency department assessment recommended within 24 hours. Multiple high-risk factors identified.';
  } else if (riskScore >= 50) {
    riskLevel = 'High';
    urgencyLevel = 'Urgent';
    recommendation = 'High priority: Schedule oncological consultation within 48-72 hours. Comprehensive diagnostic workup needed including lifestyle modification counseling.';
  } else if (riskScore >= 25) {
    riskLevel = 'Moderate';
    urgencyLevel = 'Priority';
    recommendation = 'Priority scheduling: Arrange oncological evaluation within 1-2 weeks. Consider staging studies if cancer suspected. Address modifiable risk factors.';
  } else {
    riskLevel = 'Low';
    urgencyLevel = 'Routine';
    recommendation = 'Routine follow-up: Monitor symptoms and schedule standard screening as appropriate for age and risk factors. Continue healthy lifestyle practices.';
  }
  
  // Add general tests if no specific cancer type suspected
  if (suspectedCancerTypes.length === 0 && riskScore >= 25) {
    recommendedTests.push('Complete Blood Count', 'Comprehensive Metabolic Panel', 'Tumor Markers');
  }
  
  const confidence = Math.min(95, Math.max(65, 85 + (suspectedCancerTypes.length * 5) - Math.abs(riskScore - 45) + (patient ? 10 : 0)));
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    patientId: '',
    visitId: '',
    symptoms,
    riskLevel,
    riskScore,
    riskFactors: factors,
    confidence,
    factors,
    recommendation,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    suspectedCancerTypes: suspectedCancerTypes.length > 0 ? suspectedCancerTypes : undefined,
    suggestedStage,
    recommendedTests: recommendedTests.length > 0 ? recommendedTests : undefined,
    urgencyLevel
  };
}

export const mockAnalytics: Analytics = {
  totalPatients: 20,
  newPatientsThisMonth: 8,
  ongoingPatients: 7,
  recurrenceCases: 3,
  riskDistribution: {
    low: 5,
    moderate: 8,
    high: 7
  },
  followUpAlerts: 12,
  commonSymptoms: [
    { symptom: 'Persistent cough', count: 8 },
    { symptom: 'Breast lump', count: 6 },
    { symptom: 'Abdominal pain', count: 4 },
    { symptom: 'Unexplained weight loss', count: 5 },
    { symptom: 'Fatigue', count: 7 }
  ],
  statusTrends: [
    { month: 'Jan 2024', ongoing: 5, recurrence: 2, cancerFree: 3 },
    { month: 'Feb 2024', ongoing: 6, recurrence: 2, cancerFree: 4 },
    { month: 'Mar 2024', ongoing: 7, recurrence: 3, cancerFree: 5 }
  ]
};