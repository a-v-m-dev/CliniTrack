import React, { useState } from 'react';
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
import { generateRiskAssessment, calculateBMI } from '../../data/mockData';

interface RiskAssessmentProps {
  patients: Patient[];
  onRiskAssessmentCreate: (assessment: RiskAssessment) => void;
}

export function RiskAssessmentComponent({ patients, onRiskAssessmentCreate }: RiskAssessmentProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [doctorOverride, setDoctorOverride] = useState(false);
  const [overrideRiskLevel, setOverrideRiskLevel] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newAssessment = generateRiskAssessment(symptoms, selectedPatient.age, selectedPatient.gender, selectedPatient);
    newAssessment.patientId = selectedPatient.id;
    
    setAssessment(newAssessment);
    setIsAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!assessment || !selectedPatient) return;

    setIsSubmitting(true);

    // Create final assessment with doctor's input
    const finalAssessment: RiskAssessment = {
      ...assessment,
      visitId: Math.random().toString(36).substr(2, 9),
      doctorNotes: doctorNotes || undefined,
      doctorOverride: doctorOverride,
      riskLevel: doctorOverride ? overrideRiskLevel : assessment.riskLevel
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    onRiskAssessmentCreate(finalAssessment);
    
    // Reset form
    setSelectedPatientId('');
    setSymptoms([]);
    setAssessment(null);
    setDoctorNotes('');
    setDoctorOverride(false);
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
                Enter patient symptoms to get AI-powered risk analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>Select Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient for assessment" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.age} years, {patient.gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPatient && (
            <>
              {/* Patient Info */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
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
                    <p className="text-sm font-medium mb-2">Selected symptoms:</p>
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
                      Analyzing symptoms...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
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