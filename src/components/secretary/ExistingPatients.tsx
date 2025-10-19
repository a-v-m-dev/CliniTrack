import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb-browser';
import { Patient, LabResult } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, User, Phone, Mail, Calendar, Edit, Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

interface ExistingPatientsProps {
  labResults: LabResult[];
  onPatientUpdate: (patient: Patient) => void;
  onLabResultAdd: (result: LabResult) => void;
}

export function ExistingPatients({ labResults, onPatientUpdate, onLabResultAdd }: ExistingPatientsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [newLabResult, setNewLabResult] = useState({
    type: '',
    name: '',
    results: '',
    file: null as File | null
  });
  const [showLabUpload, setShowLabUpload] = useState(false);

  const db = new PouchDB('CliniTrack');

// Fetch all patients from PouchDB
// Fetch all patients from PouchDB
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const result = await db.allDocs({ include_docs: true });

        // Cast to any so we can describe the shape we expect
        const rows = (result as any).rows as Array<{ id: string; doc?: any }>;

        // Keep only rows that have a doc, exclude user docs, and ensure doc looks like a Patient
        const filteredPatients: Patient[] = rows
          .filter(r => !!r.doc && !String(r.id).startsWith('clinitrack_user')) // remove user docs
          .map(r => r.doc)
          .filter(
            (doc): doc is Patient =>
              !!doc &&
              typeof doc.id === 'string' &&
              typeof doc.name === 'string' &&
              typeof doc.createdAt === 'string'
          );

        setPatients(filteredPatients);
        console.log('✅ Loaded patients from PouchDB:', filteredPatients);
      } catch (err) {
        console.error('Failed to fetch patients from PouchDB:', err);
      }
    };

    fetchPatients();
  }, [db]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getPatientLabResults = (patientId: string) => {
    return labResults.filter(result => result.patientId === patientId);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData(patient);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (selectedPatient && editFormData) {
      const updatedPatient: Patient = {
        ...selectedPatient,
        ...editFormData,
        updatedAt: new Date().toISOString()
      };

      try {
        const existingDoc = await db.get(selectedPatient.id);
        await db.put({ ...existingDoc, ...updatedPatient });
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        setSelectedPatient(updatedPatient);
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to update patient in PouchDB:', err);
      }
    }
  };

const handleLabUpload = (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedPatient || !newLabResult.type || !newLabResult.name || !newLabResult.results) return;

  const labResult: LabResult = {
    id: Math.random().toString(36).substr(2, 9),
    patientId: selectedPatient.id,
    type: newLabResult.type as any,
    name: newLabResult.name,
    date: new Date().toISOString(),
    results: newLabResult.results,
    file: newLabResult.file
      ? {
          name: newLabResult.file.name,
          url: URL.createObjectURL(newLabResult.file),
          type: newLabResult.file.type
        }
      : undefined,
    uploadedBy: 'Mary Adams'
  };

  // Use parent callback to update lab results
  onLabResultAdd(labResult);
  setNewLabResult({ type: '', name: '', results: '', file: null });
  setShowLabUpload(false);
};

// Helper functions should be outside
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Existing Patients</CardTitle>
          <CardDescription>
            Search and manage existing patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                  const patientLabResults = getPatientLabResults(patient.id);

                  return (
                    <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h3 className="font-medium">{patient.name}</h3>
                              <Badge variant="outline">{patient.age} years, {patient.gender}</Badge>
                              <Badge variant={getStatusBadgeVariant(patient.status)}>{patient.status}</Badge>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{patient.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{patient.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Added {formatDate(patient.createdAt)}</span>
                              </div>
                            </div>

                            {patientLabResults.length > 0 && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span>{patientLabResults.length} lab result(s)</span>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPatient(patient)}
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Patient Details</DialogTitle>
                                  <DialogDescription>
                                    View and manage patient information
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedPatient && (
                                  <div className="space-y-6">
                                    {/* Patient Information */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Patient Information</h3>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditPatient(selectedPatient)}
                                        >
                                          <Edit className="h-4 w-4 mr-2" /> Edit
                                        </Button>
                                      </div>

                                      {isEditing ? (
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                              value={editFormData.name || ''}
                                              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Age</Label>
                                            <Input
                                              type="number"
                                              value={editFormData.age || ''}
                                              onChange={(e) => setEditFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                              type="email"
                                              value={editFormData.email || ''}
                                              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input
                                              value={editFormData.phone || ''}
                                              onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                          </div>
                                          <div className="col-span-2 space-y-2">
                                            <Label>Address</Label>
                                            <Textarea
                                              value={editFormData.address || ''}
                                              onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                                            />
                                          </div>
                                          <div className="col-span-2 flex space-x-2">
                                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div><strong>Name:</strong> {selectedPatient.name}</div>
                                          <div><strong>Age:</strong> {selectedPatient.age}</div>
                                          <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                                          <div><strong>Email:</strong> {selectedPatient.email}</div>
                                          <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                                          <div className="col-span-2"><strong>Address:</strong> {selectedPatient.address}</div>
                                          {selectedPatient.emergencyContact.name && (
                                            <div className="col-span-2">
                                              <strong>Emergency Contact:</strong> {selectedPatient.emergencyContact.name} 
                                              ({selectedPatient.emergencyContact.relationship}) - {selectedPatient.emergencyContact.phone}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <Separator />

                                    {/* Medical History */}
                                    <div className="space-y-2">
                                      <h3 className="font-medium">Medical History</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedPatient.medicalHistory.length > 0 ? (
                                          selectedPatient.medicalHistory.map((condition, index) => (
                                            <Badge key={index} variant="secondary">{condition}</Badge>
                                          ))
                                        ) : (
                                          <span className="text-muted-foreground text-sm">No medical history recorded</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Allergies */}
                                    <div className="space-y-2">
                                      <h3 className="font-medium">Allergies</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedPatient.allergies.length > 0 ? (
                                          selectedPatient.allergies.map((allergy, index) => (
                                            <Badge key={index} variant="destructive">{allergy}</Badge>
                                          ))
                                        ) : (
                                          <span className="text-muted-foreground text-sm">No allergies recorded</span>
                                        )}
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Lab Results */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Lab Results</h3>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setShowLabUpload(true)}
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload New Result
                                        </Button>
                                      </div>

                                      {showLabUpload && (
                                        <Card className="p-4">
                                          <form onSubmit={handleLabUpload} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select value={newLabResult.type} onValueChange={(value) => setNewLabResult(prev => ({ ...prev, type: value }))}>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="Blood Test">Blood Test</SelectItem>
                                                    <SelectItem value="Imaging">Imaging</SelectItem>
                                                    <SelectItem value="Biopsy">Biopsy</SelectItem>
                                                    <SelectItem value="Urine Test">Urine Test</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Test Name</Label>
                                                <Input
                                                  value={newLabResult.name}
                                                  onChange={(e) => setNewLabResult(prev => ({ ...prev, name: e.target.value }))}
                                                  placeholder="e.g., Complete Blood Count"
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Results</Label>
                                              <Textarea
                                                value={newLabResult.results}
                                                onChange={(e) => setNewLabResult(prev => ({ ...prev, results: e.target.value }))}
                                                placeholder="Enter test results..."
                                                rows={3}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>File (optional)</Label>
                                              <Input
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg"
                                                onChange={(e) => setNewLabResult(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                                              />
                                            </div>
                                            <div className="flex space-x-2">
                                              <Button type="submit">Upload Result</Button>
                                              <Button type="button" variant="outline" onClick={() => setShowLabUpload(false)}>Cancel</Button>
                                            </div>
                                          </form>
                                        </Card>
                                      )}

                                      <div className="space-y-2">
                                        {getPatientLabResults(selectedPatient.id).map((result) => (
                                          <Card key={result.id} className="p-3">
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline">{result.type}</Badge>
                                                  <h4 className="font-medium">{result.name}</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                  {formatDate(result.date)} • Uploaded by {result.uploadedBy}
                                                </p>
                                                <p className="text-sm mt-2">{result.results}</p>
                                                {result.file && (
                                                  <div className="mt-2">
                                                    <Button variant="outline" size="sm">
                                                      <FileText className="h-3 w-3 mr-1" />
                                                      {result.file.name}
                                                    </Button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </Card>
                                        ))}

                                        {getPatientLabResults(selectedPatient.id).length === 0 && (
                                          <div className="text-center py-4 text-muted-foreground text-sm">
                                            No lab results uploaded yet
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
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