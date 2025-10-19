import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, User, Calendar, FileText, Activity, AlertTriangle, Clock } from 'lucide-react';
import { Patient, LabResult, Visit, RiskAssessment } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';

interface PatientProfilesProps {
  patients: Patient[];
  labResults: LabResult[];
  visits: Visit[];
  riskAssessments: RiskAssessment[];
}

export function PatientProfiles({ patients, labResults, visits, riskAssessments }: PatientProfilesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientLabResults = (patientId: string) => {
    return labResults.filter(result => result.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getPatientVisits = (patientId: string) => {
    return visits.filter(visit => visit.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getPatientRiskAssessments = (patientId: string) => {
    return riskAssessments.filter(assessment => assessment.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getLatestRiskAssessment = (patientId: string) => {
    const assessments = getPatientRiskAssessments(patientId);
    return assessments.length > 0 ? assessments[0] : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'destructive';
      case 'Moderate': return 'secondary';
      case 'Low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Ongoing': return 'default';
      case 'Cancer-Free': return 'default';
      case 'Under Observation': return 'secondary';
      case 'Recurrence': return 'destructive';
      case 'Deceased': return 'destructive';
      default: return 'outline';
    }
  };

  const isFollowUpDue = (lastVisitDate: string) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return new Date(lastVisitDate) < threeMonthsAgo;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Profiles</CardTitle>
          <CardDescription>
            View complete patient records, visit history, and risk assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 font-medium">No patients found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No patients have been registered yet.'}
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const patientVisits = getPatientVisits(patient.id);
                  const latestRisk = getLatestRiskAssessment(patient.id);
                  const lastVisit = patientVisits[0];
                  const followUpDue = lastVisit && isFollowUpDue(lastVisit.date);
                  
                  return (
                    <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h3 className="font-medium">{patient.name}</h3>
                              <Badge variant="outline">
                                {patient.age} years, {patient.gender}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(patient.status)}>
                                {patient.status}
                              </Badge>
                              {latestRisk && (
                                <Badge variant={getRiskBadgeVariant(latestRisk.riskLevel)}>
                                  {latestRisk.riskLevel} Risk
                                </Badge>
                              )}
                              {followUpDue && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Follow-up Due
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div>Email: {patient.email}</div>
                              <div>Phone: {patient.phone}</div>
                              {patient.cancerType && (
                                <div className="flex items-center space-x-1">
                                  <Activity className="h-3 w-3" />
                                  <span>{patient.cancerType} {patient.stage && `(${patient.stage})`}</span>
                                </div>
                              )}
                              {patient.diagnosisDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Diagnosed: {formatDate(patient.diagnosisDate + 'T00:00:00Z')}</span>
                                </div>
                              )}
                              {lastVisit && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Last visit: {formatDate(lastVisit.date)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{getPatientLabResults(patient.id).length} lab result(s)</span>
                              </div>
                            </div>

                            {latestRisk && (
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                <strong>Latest AI Assessment:</strong> {latestRisk.recommendation}
                              </div>
                            )}
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                View Profile
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Patient Profile: {patient.name}</DialogTitle>
                                <DialogDescription>
                                  Complete medical record and visit history
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedPatient && (
                                <Tabs defaultValue="overview" className="space-y-4">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="visits">Visit History</TabsTrigger>
                                    <TabsTrigger value="labs">Lab Results</TabsTrigger>
                                    <TabsTrigger value="risk">Risk Reports</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Patient Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                          <div><strong>Name:</strong> {selectedPatient.name}</div>
                                          <div><strong>Age:</strong> {selectedPatient.age}</div>
                                          <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                                          <div><strong>Email:</strong> {selectedPatient.email}</div>
                                          <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                                          <div><strong>Address:</strong> {selectedPatient.address}</div>
                                          {selectedPatient.emergencyContact.name && (
                                            <div>
                                              <strong>Emergency Contact:</strong><br />
                                              {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship})<br />
                                              {selectedPatient.emergencyContact.phone}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Medical Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <strong className="text-sm">Medical History:</strong>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {selectedPatient.medicalHistory.length > 0 ? (
                                                selectedPatient.medicalHistory.map((condition, index) => (
                                                  <Badge key={index} variant="secondary" className="text-xs">{condition}</Badge>
                                                ))
                                              ) : (
                                                <span className="text-muted-foreground text-xs">None recorded</span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <strong className="text-sm">Allergies:</strong>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {selectedPatient.allergies.length > 0 ? (
                                                selectedPatient.allergies.map((allergy, index) => (
                                                  <Badge key={index} variant="destructive" className="text-xs">{allergy}</Badge>
                                                ))
                                              ) : (
                                                <span className="text-muted-foreground text-xs">None recorded</span>
                                              )}
                                            </div>
                                          </div>

                                          {latestRisk && (
                                            <div>
                                              <strong className="text-sm">Current Risk Level:</strong>
                                              <div className="mt-1">
                                                <Badge variant={getRiskBadgeVariant(latestRisk.riskLevel)} className="text-xs">
                                                  {latestRisk.riskLevel} Risk ({latestRisk.confidence}% confidence)
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {latestRisk.recommendation}
                                              </p>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          {getPatientVisits(selectedPatient.id).slice(0, 3).map((visit) => (
                                            <div key={visit.id} className="border-l-2 border-primary pl-4">
                                              <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{formatDate(visit.date)}</span>
                                              </div>
                                              <p className="text-sm text-muted-foreground mt-1">{visit.diagnosis}</p>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {visit.symptoms.map((symptom, index) => (
                                                  <Badge key={index} variant="outline" className="text-xs">{symptom}</Badge>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                          
                                          {getPatientVisits(selectedPatient.id).length === 0 && (
                                            <p className="text-muted-foreground text-sm">No visits recorded</p>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>

                                  <TabsContent value="visits" className="space-y-4">
                                    <div className="space-y-4">
                                      {getPatientVisits(selectedPatient.id).map((visit) => (
                                        <Card key={visit.id}>
                                          <CardHeader>
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="text-lg">{formatDate(visit.date)}</CardTitle>
                                              <Badge variant="outline">{visit.doctorName}</Badge>
                                            </div>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div>
                                              <strong className="text-sm">Symptoms:</strong>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {visit.symptoms.map((symptom, index) => (
                                                  <Badge key={index} variant="outline" className="text-xs">{symptom}</Badge>
                                                ))}
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <strong className="text-sm">Diagnosis:</strong>
                                              <p className="text-sm mt-1">{visit.diagnosis}</p>
                                            </div>
                                            
                                            <div>
                                              <strong className="text-sm">Treatment:</strong>
                                              <p className="text-sm mt-1">{visit.treatment}</p>
                                            </div>
                                            
                                            {visit.notes && (
                                              <div>
                                                <strong className="text-sm">Notes:</strong>
                                                <p className="text-sm mt-1 text-muted-foreground">{visit.notes}</p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                      
                                      {getPatientVisits(selectedPatient.id).length === 0 && (
                                        <div className="text-center py-8">
                                          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                          <h3 className="mt-2 font-medium">No visits recorded</h3>
                                          <p className="text-muted-foreground">This patient has no visit history yet.</p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="labs" className="space-y-4">
                                    <div className="space-y-4">
                                      {getPatientLabResults(selectedPatient.id).map((result) => (
                                        <Card key={result.id}>
                                          <CardHeader>
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="text-lg">{result.name}</CardTitle>
                                              <div className="flex items-center space-x-2">
                                                <Badge variant="outline">{result.type}</Badge>
                                                <span className="text-sm text-muted-foreground">{formatDate(result.date)}</span>
                                              </div>
                                            </div>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="space-y-2">
                                              <div>
                                                <strong className="text-sm">Results:</strong>
                                                <pre className="text-sm mt-1 whitespace-pre-wrap font-mono bg-muted p-2 rounded text-muted-foreground">
                                                  {result.results}
                                                </pre>
                                              </div>
                                              
                                              {result.file && (
                                                <div>
                                                  <strong className="text-sm">Attached File:</strong>
                                                  <div className="mt-1">
                                                    <Button variant="outline" size="sm">
                                                      <FileText className="h-3 w-3 mr-1" />
                                                      {result.file.name}
                                                    </Button>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              <p className="text-xs text-muted-foreground">
                                                Uploaded by {result.uploadedBy}
                                              </p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                      
                                      {getPatientLabResults(selectedPatient.id).length === 0 && (
                                        <div className="text-center py-8">
                                          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                          <h3 className="mt-2 font-medium">No lab results</h3>
                                          <p className="text-muted-foreground">No lab results have been uploaded for this patient.</p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="risk" className="space-y-4">
                                    <div className="space-y-4">
                                      {getPatientRiskAssessments(selectedPatient.id).map((assessment) => (
                                        <Card key={assessment.id}>
                                          <CardHeader>
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="text-lg flex items-center space-x-2">
                                                <Activity className="h-5 w-5" />
                                                <span>Risk Assessment</span>
                                              </CardTitle>
                                              <div className="flex items-center space-x-2">
                                                <Badge variant={getRiskBadgeVariant(assessment.riskLevel)}>
                                                  {assessment.riskLevel} Risk
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">{formatDate(assessment.date)}</span>
                                              </div>
                                            </div>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div>
                                              <strong className="text-sm">Analyzed Symptoms:</strong>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {assessment.symptoms.map((symptom, index) => (
                                                  <Badge key={index} variant="outline" className="text-xs">{symptom}</Badge>
                                                ))}
                                              </div>
                                            </div>

                                            <div>
                                              <strong className="text-sm">Risk Factors:</strong>
                                              <ul className="text-sm mt-1 space-y-1">
                                                {assessment.factors.map((factor, index) => (
                                                  <li key={index} className="flex items-center space-x-2">
                                                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                                    <span>{factor}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>

                                            <div>
                                              <strong className="text-sm">AI Recommendation:</strong>
                                              <div className="bg-muted p-3 rounded mt-1">
                                                <p className="text-sm">{assessment.recommendation}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                  Confidence: {assessment.confidence}%
                                                </p>
                                              </div>
                                            </div>

                                            {assessment.doctorNotes && (
                                              <div>
                                                <strong className="text-sm">Doctor's Notes:</strong>
                                                <p className="text-sm mt-1 bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                                                  {assessment.doctorNotes}
                                                  {assessment.doctorOverride && (
                                                    <span className="block text-xs text-blue-600 mt-1">
                                                      ⚠️ Doctor override applied
                                                    </span>
                                                  )}
                                                </p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                      
                                      {getPatientRiskAssessments(selectedPatient.id).length === 0 && (
                                        <div className="text-center py-8">
                                          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                                          <h3 className="mt-2 font-medium">No risk assessments</h3>
                                          <p className="text-muted-foreground">No AI risk assessments have been performed for this patient.</p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}