import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PouchDB from 'pouchdb-browser';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Activity, Brain, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Patient, RiskAssessment } from '../../types';
import { calculateBMI } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Search } from "lucide-react";


interface RiskAssessmentProps {
  patients: Patient[];
  onRiskAssessmentCreate: (assessment: RiskAssessment) => void;
}

// NEW RISK CALCULATION FUNCTIONS
function calculateNewRiskScore(input: {
  age: number;
  stage?: string;
  status?: string;
  cancerType?: string;
  symptoms: string[];
  symptomSeverity?: number;
  comorbidities?: string[];
  patient: any;
}): number {
  let totalScore = 0;

  // 1. Age Score (0-15 points)
  const ageScore =
    input.age >= 75 ? 15 :
      input.age >= 65 ? 12 :
        input.age >= 55 ? 9 :
          input.age >= 45 ? 6 :
            input.age >= 35 ? 3 : 0;
  totalScore += ageScore;

  // 2. Stage Score (0-25 points)
  const stage = input.stage?.toUpperCase() || 'UNDETERMINED';
  const stageScore =
    stage === 'IV' ? 25 :
      stage === 'III' ? 18 :
        stage === 'II' ? 10 :
          stage === 'I' ? 4 : 0;
  totalScore += stageScore;

  // 3. Status Score (0-20 points)
  const statusScore =
    input.status === 'Deceased' ? 20 :
      input.status === 'Recurrence' ? 18 :
        input.status === 'Ongoing Treatment' ? 14 :
          input.status === 'New' ? 10 : 0;
  totalScore += statusScore;

  // 4. Type Score (0-15 points)
  const cancerType = input.cancerType?.toLowerCase() || '';
  const typeScore =
    cancerType.includes('lung') || cancerType.includes('pancreatic') ? 15 :
      cancerType.includes('liver') || cancerType.includes('brain') ? 13 :
        cancerType.includes('breast') || cancerType.includes('colorectal') ? 10 :
          cancerType.includes('prostate') || cancerType.includes('thyroid') ? 6 : 8;
  totalScore += typeScore;

  // 5. Symptom Score (0-15 points)
  const symptomCount = input.symptoms.length;
  const baseSymptomScore = Math.min(symptomCount * 2, 10);
  const severityBonus = (input.symptomSeverity || 5) > 7 ? 5 : 0;
  const symptomScore = Math.min(baseSymptomScore + severityBonus, 15);
  totalScore += symptomScore;

  // 6. Severity Score (0-10 points)
  const severityScore = input.symptomSeverity
    ? Math.round((input.symptomSeverity / 10) * 10)
    : 5;
  totalScore += severityScore;

  // 7. Comorbidity Score (0-10 points)
  const comorbidityCount = input.comorbidities?.length ||
    input.patient?.medicalHistory?.length || 0;
  const comorbidityScore = Math.min(comorbidityCount * 2, 10);
  totalScore += comorbidityScore;

  // Additional lifestyle factors (0-10 points)
  let lifestyleScore = 0;
  if (input.patient?.smokingStatus === 'Current Smoker') lifestyleScore += 5;
  else if (input.patient?.smokingStatus === 'Former Smoker') lifestyleScore += 3;
  if (input.patient?.alcoholFrequency === 'Daily') lifestyleScore += 3;
  else if (input.patient?.alcoholFrequency === 'Weekly') lifestyleScore += 2;
  if (input.patient?.cancerHistory) lifestyleScore += 5;
  totalScore += Math.min(lifestyleScore, 10);

  return Math.min(Math.round(totalScore), 100);
}

function getRiskLevelFromScore(score: number): 'Low' | 'Moderate' | 'High' {
  if (score >= 65) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
}

function getUrgencyLevel(score: number, stage?: string): string {
  if (score >= 80 || stage === 'IV') return 'Emergency';
  if (score >= 65 || stage === 'III') return 'Urgent';
  if (score >= 50) return 'Priority';
  return 'Routine';
}

export function RiskAssessmentComponent({ patients, onRiskAssessmentCreate }: RiskAssessmentProps) {
  const { user: authUser } = useAuth();
  const { user } = useAuth();

  const db = new PouchDB('CliniTrack');

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [doctorOverride, setDoctorOverride] = useState(false);
  const [overrideRiskLevel, setOverrideRiskLevel] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // new
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [justSelected, setJustSelected] = useState(false);


  // sync name -> id
  // Real-time patient dropdown search
  useEffect(() => {
    const input = selectedPatientName.trim().toLowerCase();

    if (justSelected) {
      setJustSelected(false);
      return;
    }

    if (input === "") {
      setFilteredPatients([]);
      setShowDropdown(false);
      setSelectedPatientId("");
      return;
    }

    // Filter patients by name
    const matches = patients.filter((p) =>
      p.name.toLowerCase().includes(input)
    );

    setFilteredPatients(matches);
    setShowDropdown(true);

    // Auto-select ONLY if exact match
    const exact = patients.find(
      (p) => p.name.toLowerCase() === input
    );
    setSelectedPatientId(exact ? exact.id : "");
  }, [selectedPatientName, patients]);


  // NEW: Additional fields for enhanced assessment
  const [patientStage, setPatientStage] = useState<string>('Undetermined');
  const [patientStatus, setPatientStatus] = useState<string>('New');
  const [symptomSeverity, setSymptomSeverity] = useState<number>(5);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const cancerSymptoms = {
    'Breast Cancer': [
      'Breast lump', 'Nipple discharge', 'Breast pain', 'Skin dimpling',
      'Breast swelling', 'Nipple changes', 'Breast skin changes'
    ],
    'Lung Cancer': [
      'Persistent cough', 'Shortness of breath', 'Chest pain', 'Coughing blood',
      'Hoarseness', 'Recurrent respiratory infections', 'Unexplained weight loss'
    ],
    'Colorectal Cancer': [
      'Blood in stool', 'Abdominal pain', 'Change in bowel habits', 'Rectal bleeding',
      'Abdominal cramping', 'Fatigue', 'Unexplained weight loss'
    ],
    'General Cancer': [
      'Fatigue', 'Loss of appetite', 'Nausea', 'Fever', 'Night sweats',
      'Weakness', 'Skin changes', 'New growth', 'Persistent pain'
    ]
  };

  const allSymptoms = [
    ...cancerSymptoms['Breast Cancer'],
    ...cancerSymptoms['Lung Cancer'],
    ...cancerSymptoms['Colorectal Cancer'],
    ...cancerSymptoms['General Cancer']
  ].filter((symptom, index, self) => self.indexOf(symptom) === index);

  const addSymptom = (symptom: string) => {
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptomToRemove: string) => {
    setSymptoms(symptoms.filter(s => s !== symptomToRemove));
  };

  const handleAnalyze = async () => {
    if (!selectedPatient || symptoms.length === 0) return;

    setIsAnalyzing(true);
    setAssessment(null);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Determine suspected cancer types
    const suspectedTypes: string[] = [];
    const breastSymptoms = ['breast lump', 'nipple discharge', 'breast pain'];
    const lungSymptoms = ['persistent cough', 'shortness of breath', 'chest pain', 'coughing blood'];
    const colorectalSymptoms = ['blood in stool', 'abdominal pain', 'change in bowel habits'];

    const lowerSymptoms = symptoms.map(s => s.toLowerCase());

    if (breastSymptoms.some(s => lowerSymptoms.some(ls => ls.includes(s)))) {
      suspectedTypes.push('Breast Cancer');
    }
    if (lungSymptoms.some(s => lowerSymptoms.some(ls => ls.includes(s)))) {
      suspectedTypes.push('Lung Cancer');
    }
    if (colorectalSymptoms.some(s => lowerSymptoms.some(ls => ls.includes(s)))) {
      suspectedTypes.push('Colorectal Cancer');
    }
    if (suspectedTypes.length === 0) {
      suspectedTypes.push('General Cancer');
    }

    // Calculate risk score using NEW FORMULA
    const riskScore = calculateNewRiskScore({
      age: selectedPatient.age,
      stage: patientStage !== 'Undetermined' ? patientStage : undefined,
      status: patientStatus,
      cancerType: suspectedTypes[0],
      symptoms,
      symptomSeverity,
      comorbidities: selectedPatient.medicalHistory,
      patient: selectedPatient
    });

    const riskLevel = getRiskLevelFromScore(riskScore);
    const urgencyLevel = getUrgencyLevel(riskScore, patientStage);

    // Build risk factors list
    const factors: string[] = [];
    factors.push(`Risk Score: ${riskScore}/100 (New Formula Applied)`);
    if (selectedPatient.age >= 65) factors.push(`Age ${selectedPatient.age} - increased risk factor`);
    if (patientStage && patientStage !== 'Undetermined') factors.push(`Cancer Stage: ${patientStage}`);
    if (patientStatus) factors.push(`Patient Status: ${patientStatus}`);
    if (symptoms.length >= 5) factors.push(`Multiple symptoms present (${symptoms.length})`);
    if (selectedPatient.cancerHistory) factors.push('Previous cancer history');
    if (selectedPatient.smokingStatus === 'Current Smoker') factors.push('Current smoker');
    if (selectedPatient.medicalHistory?.length > 0) {
      factors.push(`Comorbidities: ${selectedPatient.medicalHistory.join(', ')}`);
    }
    if (symptomSeverity >= 8) factors.push(`Severe symptoms (Severity: ${symptomSeverity}/10)`);

    // Generate recommendations
    let recommendation = '';
    if (riskLevel === 'High') {
      recommendation = `Immediate medical attention required. Risk score: ${riskScore}/100. Comprehensive diagnostic workup recommended including imaging studies and specialist consultation.`;
    } else if (riskLevel === 'Moderate') {
      recommendation = `Schedule follow-up within 1-2 weeks. Risk score: ${riskScore}/100. Additional testing may be warranted based on clinical judgment.`;
    } else {
      recommendation = `Monitor symptoms. Risk score: ${riskScore}/100. Routine follow-up recommended. Educate patient on warning signs.`;
    }

    // Recommended tests
    const recommendedTests: string[] = [];
    suspectedTypes.forEach(type => {
      if (type.includes('Breast')) {
        recommendedTests.push('Mammography', 'Breast Ultrasound', 'Biopsy');
      }
      if (type.includes('Lung')) {
        recommendedTests.push('Chest X-ray', 'CT Scan', 'Sputum Cytology', 'Bronchoscopy');
      }
      if (type.includes('Colorectal')) {
        recommendedTests.push('Colonoscopy', 'Fecal Occult Blood Test', 'CT Colonography');
      }
    });

    const newAssessment: RiskAssessment = {
      id: '',
      patientId: selectedPatient.id,
      visitId: '',
      riskLevel,
      confidence: Math.min(85 + Math.floor(Math.random() * 15), 99),
      factors,
      recommendation,
      suspectedCancerTypes: suspectedTypes,
      suggestedStage: patientStage,
      urgencyLevel,
      recommendedTests: [...new Set(recommendedTests)],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setAssessment(newAssessment);
    setIsAnalyzing(false);
  };

  /* new submit with toast */
  const handleSubmit = async () => {
    if (!assessment || !selectedPatient) return;

    setIsSubmitting(true);

    const finalAssessment: RiskAssessment = {
      ...assessment,
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visitId: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      doctorNotes: doctorNotes || undefined,
      doctorOverride: doctorOverride,
      riskLevel: doctorOverride ? overrideRiskLevel : assessment.riskLevel,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      await toast.promise(
        (async () => {
          await db.put({
            _id: finalAssessment.id,
            type: 'riskAssessment',
            ...finalAssessment
          });

          console.log('✅ Risk assessment saved to PouchDB:', finalAssessment.id);

          try {
            const patientDoc = await db.get(selectedPatient.id)
            await db.put({
              ...patientDoc,
              status: patientStatus,
              stage: patientStage !== 'Undetermined' ? patientStage : patientDoc.stage,
              lastAssessmentDate: new Date().toISOString(),
              lastAssessmentRisk: finalAssessment.riskLevel,
              updatedAt: new Date().toISOString()
            })
            console.log('✅ Patient record updated with assessment data');
          } catch (patientErr) {
            console.error('Failed to update patient record:', patientErr);
          }

          const visitId = finalAssessment.visitId;
          const newVisit = {
            _id: visitId,
            type: 'visit',
            id: visitId,
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            date: new Date().toISOString(),
            doctorName: authUser?.name || 'Doctor',
            symptoms: symptoms,
            diagnosis: assessment.suspectedCancerTypes?.join(', ') || 'General Assessment',
            treatment: doctorNotes || assessment.recommendation || 'Risk assessment completed',
            notes: doctorNotes || undefined,
            riskLevel: finalAssessment.riskLevel,
            riskAssessmentId: finalAssessment.id,
            stage: patientStage !== 'Undetermined' ? patientStage : undefined,
            status: patientStatus,
            createdAt: new Date().toISOString()
          };

          await db.put(newVisit)

          const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.put({
            _id: activityId,
            type: 'activity',
            activityType: 'risk_assessment',
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            riskLevel: finalAssessment.riskLevel,
            diagnosis: finalAssessment.suspectedCancerTypes?.join(', ') || 'General Assessment',
            performedBy: authUser?.name || 'Doctor',
            timestamp: new Date().toISOString(),
            details: `Risk assessment completed: ${finalAssessment.riskLevel} risk`
          });

          console.log('✅ Activity logged for risk assessment');

          await new Promise(resolve => setTimeout(resolve, 1000));
        })(),

        {
          pending: "Saving risk assessment...",
          success: "Risk assessment and visit saved successfully!",
          error: "Failed to save risk assessment."
        }
      )

      // After the save
      onRiskAssessmentCreate(finalAssessment);

      // Reset form
      setSelectedPatientId('');
      setSelectedPatientName('');
      setSymptoms([]);
      setAssessment(null);
      setDoctorNotes('');
      setDoctorOverride(false);
      setPatientStage('Undetermined');
      setPatientStatus('New');
      setSymptomSeverity(5);

    } catch (err) {
      console.error('Failed to save risk assessment to PouchDB:', err);
    }


    setIsSubmitting(false);
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Moderate': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Low': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'destructive';
      case 'Moderate': return 'secondary';
      case 'Low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>AI Risk Assessment</CardTitle>
              <CardDescription>
                {/*               Using new scoring system: Age + Stage + Status + Type + Symptoms + Severity + Comorbidity */}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* new Search Patient */}
          <div className="space-y-2">
            {user?.role === 'doctor' && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search Patient..."
                  value={selectedPatientName}
                  onChange={(e) => setSelectedPatientName(e.target.value)}
                  onFocus={() => {
                    if (filteredPatients.length > 0) setShowDropdown(true);
                  }}
                  className="pl-10"
                />

                {/* new DROPDOWN RESULTS */}
                {showDropdown && (
                  <div className="dropdown-fixed  mt-1 w-full border rounded-lg shadow-lg max-h-60 overflow-y-auto" >

                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setJustSelected(true);
                            setSelectedPatientName(p.name);
                            setSelectedPatientId(p.id);
                            setShowDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-yellow-500 cursor-pointer"
                        >
                          {p.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 italic">
                        No matching patients found
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>


          {selectedPatient && (
            <>
              {/* Patient Info */}
              <div className="bg-muted p-4 rounded-lg space-y-3 z-40">
                <h3 className="font-medium">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Name: {selectedPatient.name}</div>
                  <div>Age: {selectedPatient.age}</div>
                  <div>Gender: {selectedPatient.gender}</div>
                  <div>Medical History: {selectedPatient.medicalHistory.join(', ') || 'None'}</div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Risk Factors & Lifestyle</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Cancer History: {selectedPatient.cancerHistory ? 'Yes' : 'No'}</div>
                    <div>Smoking: {selectedPatient.smokingStatus}</div>
                    <div>Alcohol: {selectedPatient.alcoholFrequency}</div>
                    <div>Processed Foods: {selectedPatient.processedFoodPreference}</div>
                    <div>Fruits/Vegetables: {selectedPatient.fruitVegetableIntake}</div>
                    {selectedPatient.weight && selectedPatient.height && (
                      <div>BMI: {calculateBMI(selectedPatient.weight, selectedPatient.height)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* NEW: Clinical Assessment Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <Label>Cancer Stage (if known)</Label>
                  <Select value={patientStage} onValueChange={setPatientStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Undetermined">Undetermined</SelectItem>
                      <SelectItem value="I">Stage I</SelectItem>
                      <SelectItem value="II">Stage II</SelectItem>
                      <SelectItem value="III">Stage III</SelectItem>
                      <SelectItem value="IV">Stage IV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Patient Status</Label>
                  <Select value={patientStatus} onValueChange={setPatientStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Ongoing Treatment">Ongoing Treatment</SelectItem>
                      <SelectItem value="Recurrence">Recurrence</SelectItem>
                      <SelectItem value="Deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Symptom Severity: {symptomSeverity}/10</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symptomSeverity}
                    onChange={(e) => setSymptomSeverity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {symptomSeverity <= 3 ? 'Mild' : symptomSeverity <= 6 ? 'Moderate' : 'Severe'}
                  </div>
                </div>
              </div>

              {/* Symptom Input */}
              <div className="space-y-4">
                <Label>Symptoms</Label>

                {/* Cancer-Specific Symptoms */}
                <div className="space-y-4">
                  {Object.entries(cancerSymptoms).map(([cancerType, typeSymptoms]) => (
                    <div key={cancerType}>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{cancerType} Symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {typeSymptoms.filter(s => !symptoms.includes(s)).map((symptom) => (
                          <Button
                            key={symptom}
                            variant="outline"
                            size="sm"
                            onClick={() => addSymptom(symptom)}
                            className="h-8 text-xs"
                          >
                            + {symptom}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual Symptom Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter custom symptom..."
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom(newSymptom)}
                  />
                  <Button
                    onClick={() => addSymptom(newSymptom)}
                    disabled={!newSymptom}
                  >
                    Add
                  </Button>
                </div>

                {/* Selected Symptoms */}
                {symptoms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected symptoms ({symptoms.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="cursor-pointer" onClick={() => removeSymptom(symptom)}>
                          {symptom} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={symptoms.length === 0 || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with new formula...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 w-4 mr-2" />
                      Analyze Risk Level
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Assessment Results */}
      {assessment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getRiskIcon(assessment.riskLevel)}
                <span>AI Risk Assessment Results</span>
              </CardTitle>
              <Badge variant={getRiskBadgeVariant(assessment.riskLevel)} className="text-sm">
                {assessment.riskLevel} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(assessment.riskLevel)}
                  <div>
                    <h4 className="font-medium">Risk Level</h4>
                    <p className="text-2xl font-bold">{assessment.riskLevel}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Confidence</h4>
                    <p className="text-2xl font-bold">{assessment.confidence}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Risk Factors</h4>
                    <p className="text-2xl font-bold">{assessment.factors.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Urgency</h4>
                    <p className="text-lg font-bold">{assessment.urgencyLevel || 'Routine'}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cancer-Specific Analysis */}
            {(assessment.suspectedCancerTypes?.length || assessment.suggestedStage || assessment.recommendedTests?.length) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {assessment.suspectedCancerTypes && assessment.suspectedCancerTypes.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Suspected Cancer Types</h4>
                    <div className="space-y-1">
                      {assessment.suspectedCancerTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="mr-1">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {assessment.suggestedStage && assessment.suggestedStage !== 'Undetermined' && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Suggested Stage</h4>
                    <Badge
                      variant={assessment.suggestedStage.includes('IV') ? 'destructive' :
                        assessment.suggestedStage.includes('III') ? 'secondary' : 'default'}
                      className="text-sm"
                    >
                      {assessment.suggestedStage}
                    </Badge>
                  </Card>
                )}

                {assessment.recommendedTests && assessment.recommendedTests.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Recommended Tests</h4>
                    <div className="space-y-1">
                      {assessment.recommendedTests.slice(0, 3).map((test, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          • {test}
                        </div>
                      ))}
                      {assessment.recommendedTests.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          + {assessment.recommendedTests.length - 3} more
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Risk Factors */}
            <div>
              <h4 className="font-medium mb-2">Risk Factors Identified:</h4>
              <ul className="space-y-2">
                {assessment.factors.map((factor, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Recommendation */}
            <Alert className={assessment.urgencyLevel === 'Emergency' ? 'border-red-500' :
              assessment.urgencyLevel === 'Urgent' ? 'border-orange-500' :
                assessment.urgencyLevel === 'Priority' ? 'border-yellow-500' : ''}>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Recommendation:</strong> {assessment.recommendation}

                {assessment.recommendedTests && assessment.recommendedTests.length > 0 && (
                  <div className="mt-3">
                    <strong>Recommended Diagnostic Tests:</strong>
                    <ul className="list-disc list-inside mt-1 text-sm">
                      {assessment.recommendedTests.map((test, index) => (
                        <li key={index}>{test}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Doctor's Input */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Clinical Notes</h4>

              <div className="space-y-2">
                <Label htmlFor="doctorNotes">Your Clinical Assessment</Label>
                <Textarea
                  id="doctorNotes"
                  placeholder="Add your clinical notes, observations, or corrections to the AI assessment..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="doctorOverride"
                  checked={doctorOverride}
                  onChange={(e) => setDoctorOverride(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="doctorOverride">Override AI risk assessment</Label>
              </div>

              {doctorOverride && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Override Risk Level</Label>
                    <Select value={overrideRiskLevel} onValueChange={(value) => setOverrideRiskLevel(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Risk</SelectItem>
                        <SelectItem value="Moderate">Moderate Risk</SelectItem>
                        <SelectItem value="High">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Clinical Stage Assessment</Label>
                    <Select defaultValue={assessment?.suggestedStage || 'Undetermined'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undetermined">Undetermined</SelectItem>
                        <SelectItem value="Stage I">Stage I (Early/Localized)</SelectItem>
                        <SelectItem value="Stage II">Stage II (Local Spread)</SelectItem>
                        <SelectItem value="Stage III">Stage III (Regional Spread)</SelectItem>
                        <SelectItem value="Stage IV">Stage IV (Distant Metastasis)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Assessment...
                  </>
                ) : (
                  'Save Risk Assessment'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}