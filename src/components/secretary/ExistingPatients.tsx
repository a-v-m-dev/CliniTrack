import React, { useState, useEffect } from 'react';
import PouchDB from 'pouchdb-browser';
import { Patient, LabResult } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, User as UserIcon, Phone, Mail, Calendar, Edit, Upload, FileText, Trash2, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { pdfjs } from "react-pdf"

interface User {
  _id: string;
  type: 'user';
  name: string;
  email: string;
  role: 'secretary' | 'doctor';
  createdAt: string;
}

interface StoredLabResult {
  _id: string;
  type: 'labResult';
  patientId: string;
  name: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  fileData: string;
  date: string;
  uploadedBy: string;
  labType?: string;
}

// New Activity Log Interface
interface ActivityLog {
  _id: string;
  type: 'activity';
  activityType: 'patient_edit' | 'lab_upload';
  patientId: string;
  patientName: string;
  labType?: string; // For lab uploads: Blood Test, Imaging, etc.
  labFileName?: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

interface ExistingPatientsProps {
  patients: Patient[];
  labResults: LabResult[];
  onPatientUpdate: (patient: Patient) => void;
  onLabResultAdd: (result: LabResult) => void;
}

// new for viewer
type SelectedFile =
  | { type: 'image'; src: string }
  | { type: 'pdf'; src: string }
  | null;

export function ExistingPatients({ patients, labResults, onPatientUpdate, onLabResultAdd }: ExistingPatientsProps) {
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patientLabFiles, setPatientLabFiles] = useState<StoredLabResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>(null);

  const { user: authUser } = useAuth();
  const db = new PouchDB('CliniTrack');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!authUser?.email) return;

      try {
        const userDocId = `user_${authUser.email}`;
        const userDoc = await db.get(userDocId) as User;
        setCurrentUser(userDoc);
      } catch (err: any) {
        if (err.name === 'not_found') {
          console.warn('Current user not found in PouchDB');
        } else {
          console.error('Failed to fetch current user:', err);
        }
      }
    };

    fetchCurrentUser();
  }, [authUser?.email]);

  useEffect(() => {
    const fetchPatientLabFiles = async () => {
      if (!selectedPatient) return;

      try {
        const allDocs = await db.allDocs({ include_docs: true });
        const labFiles = allDocs.rows
          .map((row: { doc: any; }) => row.doc)
          .filter((doc: any) => doc?.type === 'labResult' && doc.patientId === selectedPatient.id) as StoredLabResult[];

        setPatientLabFiles(labFiles);
      } catch (err) {
        console.error('Failed to fetch lab files:', err);
      }
    };

    fetchPatientLabFiles();
  }, [selectedPatient]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const getPatientLabResults = (patientId: string) => {
    return labResults.filter(result => result.patientId === patientId);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditFormData(patient);
    setIsEditing(true);
  };

  // Log activity helper function
  const logActivity = async (activityType: 'patient_edit' | 'lab_upload', patient: Patient, labType?: string, labFileName?: string) => {
    try {
      const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const activity: ActivityLog = {
        _id: activityId,
        type: 'activity',
        activityType,
        patientId: patient.id,
        patientName: patient.name,
        labType,
        labFileName,
        performedBy: currentUser?.name || authUser?.name || 'System User',
        timestamp: new Date().toISOString(),
        details: activityType === 'patient_edit'
          ? `Updated patient information for ${patient.name}`
          : `Uploaded ${labType || 'file'} for ${patient.name}`
      };

      await db.put(activity);
      console.log('✅ Activity logged:', activity);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
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
        onPatientUpdate(updatedPatient);
        setSelectedPatient(updatedPatient);
        setIsEditing(false);

        // Log the patient edit activity
        await logActivity('patient_edit', updatedPatient);
      } catch (err) {
        console.error('Failed to update patient in PouchDB:', err);
      }
    }
  };

  const handleLabUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newLabResult.file) return;

    try {
      const fileData = await newLabResult.file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(fileData).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const labResultId = `lab_${selectedPatient.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.put({
        _id: labResultId,
        type: 'labResult',
        patientId: selectedPatient.id,
        name: newLabResult.name || newLabResult.file.name,
        fileType: newLabResult.file.type,
        fileName: newLabResult.file.name,
        fileSize: newLabResult.file.size,
        fileData: base64Data,
        date: new Date().toISOString(),
        uploadedBy: currentUser?.name || authUser?.name || 'System User',
        results: newLabResult.results || '',
        labType: newLabResult.type || 'Other'
      });

      console.log('✅ Lab file saved to PouchDB:', newLabResult.file.name);

      // Log the lab upload activity
      await logActivity('lab_upload', selectedPatient, newLabResult.type || 'Other', newLabResult.file.name);

      // Refresh the lab files list
      const allDocs = await db.allDocs({ include_docs: true });
      const labFiles = allDocs.rows
        .map((row: { doc: any; }) => row.doc)
        .filter((doc: any) => doc?.type === 'labResult' && doc.patientId === selectedPatient.id) as StoredLabResult[];

      setPatientLabFiles(labFiles);

      setNewLabResult({ type: '', name: '', results: '', file: null });
      setShowLabUpload(false);
    } catch (err) {
      console.error('Failed to save lab file to PouchDB:', err);
    }
  };

  const handleDeleteLabFile = async (labFileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const doc = await db.get(labFileId);
      await db.remove(doc);

      setPatientLabFiles(prev => prev.filter(f => f._id !== labFileId));
      console.log('✅ Lab file deleted from PouchDB');
    } catch (err) {
      console.error('Failed to delete lab file:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // image
  const getBase64ImageSrc = (fileData: string, fileType: string) => {
    return `data:${fileType};base64,${fileData}`;
  };

  // pdf
  const base64ToPdfBlobUrl = (base64: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    return URL.createObjectURL(blob);
  };

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Existing Patients</CardTitle>
          <CardDescription>
            Search and manage existing patient records ({patients.length} total patients)
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
                  <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
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
                              {patient.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{patient.email}</span>
                                </div>
                              )}
                              {patient.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{patient.phone}</span>
                                </div>
                              )}
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

                          {/* modal view patient details */}
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
                                          {selectedPatient.email && (
                                            <div><strong>Email:</strong> {selectedPatient.email}</div>
                                          )}
                                          {selectedPatient.phone && (
                                            <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                                          )}
                                          {selectedPatient.address && (
                                            <div className="col-span-2"><strong>Address:</strong> {selectedPatient.address}</div>
                                          )}
                                          {selectedPatient.emergencyContact?.name && (
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
                                        {selectedPatient.medicalHistory?.length > 0 ? (
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
                                        {selectedPatient.allergies?.length > 0 ? (
                                          selectedPatient.allergies.map((allergy, index) => (
                                            <Badge key={index} variant="destructive">{allergy}</Badge>
                                          ))
                                        ) : (
                                          <span className="text-muted-foreground text-sm">No allergies recorded</span>
                                        )}
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Lab Files & Images */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Lab/Imaging Files ({patientLabFiles.length})</h3>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setShowLabUpload(true)}
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload New File
                                        </Button>
                                      </div>

                                      {showLabUpload && (
                                        <Card className="p-4">
                                          <form onSubmit={handleLabUpload} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label>Type *</Label>
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
                                              <Label>Results/Notes (optional)</Label>
                                              <Textarea
                                                value={newLabResult.results}
                                                onChange={(e) => setNewLabResult(prev => ({ ...prev, results: e.target.value }))}
                                                placeholder="Enter test results or notes..."
                                                rows={3}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>File *</Label>
                                              <Input
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg,image/*"
                                                onChange={(e) => setNewLabResult(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                                              />
                                            </div>
                                            <div className="flex space-x-2">
                                              <Button type="submit" disabled={!newLabResult.file || !newLabResult.type}>
                                                Upload File
                                              </Button>
                                              <Button type="button" variant="outline" onClick={() => setShowLabUpload(false)}>
                                                Cancel
                                              </Button>
                                            </div>
                                          </form>
                                        </Card>
                                      )}

                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {patientLabFiles.map((labFile) => {
                                          const isImage = labFile.fileType.startsWith('image/');
                                          const isPdf = labFile.fileType === 'application/pdf';

                                          const fileSrc = getBase64ImageSrc(
                                            labFile.fileData,
                                            labFile.fileType
                                          );

                                          return (
                                            <Card key={labFile._id} className="overflow-hidden">
                                              {/* image */}
                                              {isImage && (
                                                <div
                                                  className="aspect-video bg-muted cursor-pointer relative group"
                                                  onClick={() =>
                                                    setSelectedFile({ type: 'image', src: fileSrc })
                                                  }
                                                >
                                                  <img
                                                    src={fileSrc}
                                                    alt={labFile.name}
                                                    className="w-full h-full object-cover"
                                                  />
                                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-white" />
                                                  </div>
                                                </div>
                                              )}
                                            
                                              {/* pdf */}
                                              {isPdf && (
                                                <div
                                                  className="aspect-video bg-muted flex items-center justify-center cursor-pointer"
                                                  onClick={() =>
                                                    setSelectedFile({
                                                      type: 'pdf',
                                                      src: base64ToPdfBlobUrl(labFile.fileData)
                                                    })
                                                  }
                                                >
                                                  <FileText className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                              )}

                                              <CardContent className="p-3">
                                                <div className="space-y-2">
                                                  <div>
                                                    <p className="font-medium text-sm truncate">{labFile.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(labFile.date)}</p>
                                                  </div>
                                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{formatFileSize(labFile.fileSize)}</span>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 px-2"
                                                      onClick={() => handleDeleteLabFile(labFile._id)}
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                  <p className="text-xs">Uploaded by: {labFile.uploadedBy}</p>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          );
                                        })}

                                        {patientLabFiles.length === 0 && (
                                          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                                            No lab files uploaded yet
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

      {/* Image Preview Modal */}
      {selectedFile && (
        <Dialog open onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className='mb-2'>
                {selectedFile.type === 'image' ? 'Image Preview' : 'PDF Preview'}
              </DialogTitle>
            </DialogHeader>

            {selectedFile.type === 'image' && (
              <img
                src={selectedFile.src}
                alt="Lab result preview"
                className="w-full max-h-[70vh] object-contain"
              />
            )}

            {selectedFile?.type === 'pdf' && (
              <div className="h-[100vh] overflow-auto">
                <iframe
                  src={selectedFile.src}  style={{ width: "100%", height: "80vh", border: "none" }}
                />

              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}