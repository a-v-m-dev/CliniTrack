import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { NewPatientForm } from './components/secretary/NewPatientForm';
import { ExistingPatients } from './components/secretary/ExistingPatients';
import { PatientProfiles } from './components/doctor/PatientProfiles';

import { RiskAssessmentComponent } from './components/doctor/RiskAssessment';
import { Analytics } from './components/doctor/Analytics';
import { Reports } from './components/reports/Reports';
import { SettingsPage } from './components/settings/SettingsPage';
import { HelpPage } from './components/help/HelpPage';
import { Toaster } from './components/ui/sonner';
import { mockPatients, mockLabResults, mockVisits, mockRiskAssessments } from './data/mockData';
import { Patient, LabResult, Visit, RiskAssessment } from './types';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeView, setActiveView] = useState('dashboard');
  
  // Application state
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [labResults, setLabResults] = useState<LabResult[]>(mockLabResults);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>(mockRiskAssessments);

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('clinitrack_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('clinitrack_labResults', JSON.stringify(labResults));
  }, [labResults]);

  useEffect(() => {
    localStorage.setItem('clinitrack_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('clinitrack_riskAssessments', JSON.stringify(riskAssessments));
  }, [riskAssessments]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPatients = localStorage.getItem('clinitrack_patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    }

    const storedLabResults = localStorage.getItem('clinitrack_labResults');
    if (storedLabResults) {
      setLabResults(JSON.parse(storedLabResults));
    }

    const storedVisits = localStorage.getItem('clinitrack_visits');
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }

    const storedRiskAssessments = localStorage.getItem('clinitrack_riskAssessments');
    if (storedRiskAssessments) {
      setRiskAssessments(JSON.parse(storedRiskAssessments));
    }
  }, []);

  // Handler functions
  const handlePatientCreated = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
  };

  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleLabResultAdd = (result: LabResult) => {
    setLabResults(prev => [...prev, result]);
  };

  const handleRiskAssessmentCreate = (assessment: RiskAssessment) => {
    setRiskAssessments(prev => [...prev, assessment]);
  };



  // Loading state
  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading CliniTrack...</p>
        </div>
      </div>
    );
  }

  // Authentication views
  if (!user) {
    return (
      <AuthLayout>
        {authView === 'login' && (
          <LoginForm
            onForgotPassword={() => setAuthView('forgot')}
            onRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'register' && (
          <RegisterForm onBackToLogin={() => setAuthView('login')} />
        )}
        {authView === 'forgot' && (
          <ForgotPasswordForm onBackToLogin={() => setAuthView('login')} />
        )}
      </AuthLayout>
    );
  }

  // Main application view
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardOverview
            patients={patients}
            labResults={labResults}
            visits={visits}
            riskAssessments={riskAssessments}
            onViewChange={setActiveView}
          />
        );
      
      // Secretary views
      case 'new-patient':
        return <NewPatientForm onPatientCreated={handlePatientCreated} />;
      
      case 'existing-patient':
        return (
          <ExistingPatients
            patients={patients}
            labResults={labResults}
            onPatientUpdate={handlePatientUpdate}
            onLabResultAdd={handleLabResultAdd}
          />
        );
      
      // Doctor views
      case 'patients':
        return (
          <PatientProfiles
            patients={patients}
            labResults={labResults}
            visits={visits}
            riskAssessments={riskAssessments}
          />
        );
      
      case 'risk-assessment':
        return (
          <RiskAssessmentComponent
            patients={patients}
            onRiskAssessmentCreate={handleRiskAssessmentCreate}
          />
        );
      
      case 'analytics':
        return (
          <Analytics
            patients={patients}
            riskAssessments={riskAssessments}
          />
        );
      
      // Common views
      case 'reports':
        return (
          <Reports
            patients={patients}
            riskAssessments={riskAssessments}
          />
        );
      
      case 'settings':
        return <SettingsPage />;
      
      case 'help':
        return <HelpPage />;
      
      default:
        return (
          <DashboardOverview
            patients={patients}
            labResults={labResults}
            visits={visits}
            riskAssessments={riskAssessments}
            onViewChange={setActiveView}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {renderActiveView()}
          </div>
          
          {/* Copyright Footer */}
          <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-6 py-4 max-w-7xl">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-muted-foreground">
                <span>© {new Date().getFullYear()} CliniTrack. All rights reserved.</span>
                <span>Version 1.0.0</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}