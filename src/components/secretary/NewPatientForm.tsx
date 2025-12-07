import PouchDB from 'pouchdb-browser';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Patient } from '../../types';

interface NewPatientFormProps {
  onPatientCreated: (patient: Patient) => void;
}

export function NewPatientForm({ onPatientCreated }: NewPatientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalHistory: '',
    allergies: '',
    status: 'Under Observation',
    cancerType: 'None',
    stage: 'Unknown',
    diagnosisDate: '',
    cancerHistory: 'false',
    smokingStatus: 'Non-Smoker',
    alcoholFrequency: 'Never',
    processedFoodPreference: 'Non-Frequent',
    fruitVegetableIntake: 'Frequent',
    weight: '',
    height: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    file: File
    preview?: string
  }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Array.from(files).forEach(file => {
    //   const newFile = {
    //     id: Math.random().toString(36).substr(2, 9),
    //     name: file.name,
    //     type: file.type,
    //     size: file.size
    //   };
    //   setUploadedFiles(prev => [...prev, newFile]);
    // });

    // new
    for (const file of Array.from(files)) {
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      }

      const newFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
        preview
      }
      setUploadedFiles(prev => [...prev, newFile])
    }
  };

  const removeFile = (fileId: string) => {
    // setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    //new
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const db = new PouchDB('CliniTrack');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.age || !formData.gender || !formData.phone) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 150) {
      setError('Please enter a valid age');
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        },
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(item => item.trim()) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : [],
        status: formData.status as any,
        cancerType: formData.cancerType !== 'None' ? formData.cancerType : undefined,
        stage: formData.stage !== 'Unknown' ? (formData.stage as any) : undefined,
        diagnosisDate: formData.diagnosisDate || undefined,
        cancerHistory: formData.cancerHistory === 'true',
        smokingStatus: formData.smokingStatus as any,
        alcoholFrequency: formData.alcoholFrequency as any,
        processedFoodPreference: formData.processedFoodPreference as any,
        fruitVegetableIntake: formData.fruitVegetableIntake as any,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        // Save to local PouchDB
        await db.put({
          _id: newPatient.id,
          ...newPatient
        });

        console.log('✅ Patient saved locally to PouchDB:', newPatient.name);

        // Save uploaded files as attachments or separate lab result documents
        for (const uploadedFile of uploadedFiles) {
          const fileData = await uploadedFile.file.arrayBuffer();
          const base64Data = btoa(
            new Uint8Array(fileData).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          const labResultId = `lab_${newPatient.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          await db.put({
            _id: labResultId,
            type: 'labResult',
            patientId: newPatient.id,
            name: uploadedFile.name,
            fileType: uploadedFile.type,
            fileName: uploadedFile.name,
            fileSize: uploadedFile.size,
            fileData: base64Data,
            date: new Date().toISOString(),
            uploadedBy: 'Secretary'
          });

          console.log('✅ File saved to PouchDB:', uploadedFile.name);
        }

      } catch (err) {
        console.error('❌ Failed to save to PouchDB:', err);
      }


      onPatientCreated(newPatient);
      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          age: '',
          gender: '',
          email: '',
          phone: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelationship: '',
          medicalHistory: '',
          allergies: '',
          status: 'Under Observation',
          cancerType: 'None',
          stage: 'Unknown',
          diagnosisDate: '',
          cancerHistory: 'false',
          smokingStatus: 'Non-Smoker',
          alcoholFrequency: 'Never',
          processedFoodPreference: 'Non-Frequent',
          fruitVegetableIntake: 'Frequent',
          weight: '',
          height: ''
        });
        setUploadedFiles([]);
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError('Failed to create patient record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Patient Registered Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                The patient record has been created and is now available for doctor review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register New Patient</CardTitle>
          <CardDescription>
            Enter patient demographics and upload any lab/imaging files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Demographics */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter patient's full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter age"
                    min="0"
                    max="150"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value: string) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-medium">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Enter contact name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="Enter contact phone"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Child"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    placeholder="Enter medical history (separate with commas)"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="Enter known allergies (separate with commas)"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Cancer Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Cancer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Patient Status *</Label>
                  <Select value={formData.status} onValueChange={(value: string) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Cancer-Free">Cancer-Free</SelectItem>
                      <SelectItem value="Under Observation">Under Observation</SelectItem>
                      <SelectItem value="Recurrence">Recurrence</SelectItem>
                      <SelectItem value="Deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancerType">Cancer Type</Label>
                  <Select value={formData.cancerType} onValueChange={(value: string) => handleInputChange('cancerType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancer type (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Breast Cancer">Breast Cancer</SelectItem>
                      <SelectItem value="Lung Cancer">Lung Cancer</SelectItem>
                      <SelectItem value="Colorectal Cancer">Colorectal Cancer</SelectItem>
                      <SelectItem value="Prostate Cancer">Prostate Cancer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Cancer Stage</Label>
                  <Select value={formData.stage} onValueChange={(value: string) => handleInputChange('stage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                      <SelectItem value="Stage I">Stage I</SelectItem>
                      <SelectItem value="Stage II">Stage II</SelectItem>
                      <SelectItem value="Stage III">Stage III</SelectItem>
                      <SelectItem value="Stage IV">Stage IV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
                  <Input
                    id="diagnosisDate"
                    type="date"
                    value={formData.diagnosisDate}
                    onChange={(e) => handleInputChange('diagnosisDate', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Lifestyle & Risk Factors */}
            <div className="space-y-4">
              <h3 className="font-medium">Lifestyle & Risk Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cancerHistory">Previous Cancer History</Label>
                  <Select value={formData.cancerHistory} onValueChange={(value: string) => handleInputChange('cancerHistory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancer history" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smokingStatus">Smoking Status</Label>
                  <Select value={formData.smokingStatus} onValueChange={(value: string) => handleInputChange('smokingStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select smoking status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Non-Smoker">Non-Smoker</SelectItem>
                      <SelectItem value="Current Smoker">Current Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcoholFrequency">Alcohol Consumption</Label>
                  <Select value={formData.alcoholFrequency} onValueChange={(value: string) => handleInputChange('alcoholFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alcohol frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never">Never</SelectItem>
                      <SelectItem value="Occasional">Occasional</SelectItem>
                      <SelectItem value="Every Week">Every Week</SelectItem>
                      <SelectItem value="Everyday">Everyday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processedFoodPreference">Processed Food Intake</Label>
                  <Select value={formData.processedFoodPreference} onValueChange={(value: string) => handleInputChange('processedFoodPreference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select processed food frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Non-Frequent">Non-Frequent</SelectItem>
                      <SelectItem value="Frequent">Frequent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fruitVegetableIntake">Fruit & Vegetable Intake</Label>
                  <Select value={formData.fruitVegetableIntake} onValueChange={(value: string) => handleInputChange('fruitVegetableIntake', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fruit/vegetable intake" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Non-Frequent">Non-Frequent</SelectItem>
                      <SelectItem value="Frequent">Frequent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Enter weight in kilograms"
                    min="1"
                    max="300"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="Enter height in centimeters"
                    min="50"
                    max="250"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {formData.weight && formData.height && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">BMI Calculation</p>
                  <p className="text-sm text-muted-foreground">
                    BMI: {((Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2))).toFixed(1)}
                    {Number(formData.weight) && Number(formData.height) && (() => {
                      const bmi = Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2);
                      if (bmi < 18.5) return ' (Underweight)';
                      if (bmi < 25) return ' (Normal weight)';
                      if (bmi < 30) return ' (Overweight)';
                      return ' (Obese)';
                    })()}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="font-medium">Lab/Imaging Files</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="mt-2">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-primary hover:text-primary/80">
                          Click to upload files
                        </span>
                        <span className="text-muted-foreground"> or drag and drop</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                        {/* new */}
                        {file.preview ? (
                          <div className="aspect-video bg-muted relative">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-0 h-6 w-6"
                              onClick={() => removeFile(file.id)}
                              disabled={isSubmitting}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                              <p className="text-xs truncate">{file.name}</p>
                              <p className="text-xs text-gray-300">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({formatFileSize(file.size)})
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file.id)}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Record...
                  </>
                ) : (
                  'Create Patient Record'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}