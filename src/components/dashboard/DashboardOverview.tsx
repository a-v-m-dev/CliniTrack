import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Users, UserPlus, Activity, AlertTriangle, Calendar, 
  TrendingUp, Clock, Bell, FileText 
} from 'lucide-react';
import { Patient, LabResult, Visit, RiskAssessment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardOverviewProps {
  patients: Patient[];
  labResults: LabResult[];
  visits: Visit[];
  riskAssessments: RiskAssessment[];
  onViewChange: (view: string) => void;
}

export function DashboardOverview({ 
  patients, 
  labResults, 
  visits, 
  riskAssessments, 
  onViewChange 
}: DashboardOverviewProps) {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate metrics
  const totalPatients = patients.length;
  const recentPatients = patients.filter(p => {
    const createdDate = new Date(p.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }).length;

  const recentLabResults = labResults
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const highRiskPatients = riskAssessments.filter(r => r.riskLevel === 'High').length;
  const recentVisits = visits
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Follow-up alerts (patients not seen in 3+ months)
  const followUpAlerts = patients.filter(patient => {
    const patientVisits = visits.filter(v => v.patientId === patient.id);
    if (patientVisits.length === 0) return true;
    
    const lastVisit = patientVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return new Date(lastVisit.date) < threeMonthsAgo;
  });

  const secretaryMetrics = [
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      subtitle: `+${recentPatients} this month`,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Recent Lab Uploads',
      value: recentLabResults.length.toString(),
      subtitle: 'Last 5 uploads',
      icon: FileText,
      color: 'text-accent'
    },
    {
      title: 'Pending Reviews',
      value: labResults.filter(r => {
        const uploadDate = new Date(r.date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      }).length.toString(),
      subtitle: 'Awaiting doctor review',
      icon: Clock,
      color: 'text-orange-500'
    }
  ];

  const doctorMetrics = [
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      subtitle: `+${recentPatients} new patients`,
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'High Risk Cases',
      value: highRiskPatients.toString(),
      subtitle: 'Require attention',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      title: 'Follow-up Alerts',
      value: followUpAlerts.length.toString(),
      subtitle: '3+ months overdue',
      icon: Bell,
      color: 'text-orange-500'
    },
    {
      title: 'Recent Assessments',
      value: riskAssessments.filter(r => {
        const assessmentDate = new Date(r.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return assessmentDate > sevenDaysAgo;
      }).length.toString(),
      subtitle: 'Last 7 days',
      icon: Activity,
      color: 'text-accent'
    }
  ];

  const metrics = user?.role === 'secretary' ? secretaryMetrics : doctorMetrics;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your {user?.role === 'secretary' ? 'patient registration activities' : 'patient care dashboard'}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              {user?.role === 'secretary' ? 'Latest patient registrations and file uploads' : 'Recent patient visits and assessments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.role === 'secretary' ? (
                recentLabResults.length > 0 ? (
                  recentLabResults.map((result) => {
                    const patient = patients.find(p => p.id === result.patientId);
                    return (
                      <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{result.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {patient?.name} • {formatDate(result.date)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{result.type}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent lab uploads
                  </p>
                )
              ) : (
                recentVisits.length > 0 ? (
                  recentVisits.map((visit) => {
                    const patient = patients.find(p => p.id === visit.patientId);
                    const riskAssessment = riskAssessments.find(r => r.visitId === visit.id);
                    return (
                      <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{patient?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {visit.diagnosis} • {formatDate(visit.date)}
                          </p>
                        </div>
                        {riskAssessment && (
                          <Badge 
                            variant={riskAssessment.riskLevel === 'High' ? 'destructive' : 
                                    riskAssessment.riskLevel === 'Moderate' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {riskAssessment.riskLevel}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent visits
                  </p>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {user?.role === 'secretary' ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Quick Actions</span>
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5" />
                  <span>Alerts & Reminders</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {user?.role === 'secretary' ? 'Common tasks and shortcuts' : 'Important notifications and follow-ups'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.role === 'secretary' ? (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onViewChange('new-patient')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register New Patient
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onViewChange('existing-patient')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Search Existing Patients
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onViewChange('existing-patient')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Lab Results
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {followUpAlerts.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-orange-600" />
                      <p className="text-sm font-medium text-orange-800">
                        {followUpAlerts.length} patients need follow-up
                      </p>
                    </div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-orange-600 text-xs"
                      onClick={() => onViewChange('patients')}
                    >
                      View patients →
                    </Button>
                  </div>
                )}

                {highRiskPatients > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm font-medium text-red-800">
                        {highRiskPatients} high-risk patients
                      </p>
                    </div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-red-600 text-xs"
                      onClick={() => onViewChange('patients')}
                    >
                      Review cases →
                    </Button>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">
                      Monthly analytics available
                    </p>
                  </div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 text-xs"
                    onClick={() => onViewChange('analytics')}
                  >
                    View analytics →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent Patients</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewChange(user?.role === 'secretary' ? 'existing-patient' : 'patients')}
            >
              View All
            </Button>
          </div>
          <CardDescription>
            Recently registered or updated patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => {
              const latestRisk = riskAssessments
                .filter(r => r.patientId === patient.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              
              return (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{patient.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {patient.age}y, {patient.gender}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {patient.email} • Added {formatDate(patient.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {latestRisk && (
                      <Badge 
                        variant={latestRisk.riskLevel === 'High' ? 'destructive' : 
                                latestRisk.riskLevel === 'Moderate' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {latestRisk.riskLevel}
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewChange(user?.role === 'secretary' ? 'existing-patient' : 'patients')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}