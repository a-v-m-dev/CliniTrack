import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart 
} from 'recharts';
import { 
  Users, TrendingUp, AlertTriangle, Calendar, Download, 
  FileSpreadsheet, FileText, Bell, Activity 
} from 'lucide-react';
import { Patient, RiskAssessment } from '../../types';

interface AnalyticsProps {
  patients: Patient[];
  riskAssessments: RiskAssessment[];
}

export function Analytics({ patients, riskAssessments }: AnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedExportFormat, setSelectedExportFormat] = useState('pdf');

  // Calculate real analytics from patient data
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total patients
    const totalPatients = patients.length;

    // New patients this month
    const newPatientsThisMonth = patients.filter(p => 
      new Date(p.createdAt) > thirtyDaysAgo
    ).length;

    // Status counts
    const ongoingPatients = patients.filter(p => p.status === 'Ongoing').length;
    const recurrenceCases = patients.filter(p => p.status === 'Recurrence').length;
    const cancerFreePatients = patients.filter(p => p.status === 'Cancer-Free').length;
    const underObservation = patients.filter(p => p.status === 'Under Observation').length;
    const deceased = patients.filter(p => p.status === 'Deceased').length;

    // Risk distribution from risk assessments
    const riskDistribution = {
      low: riskAssessments.filter(r => r.riskLevel === 'Low').length,
      moderate: riskAssessments.filter(r => r.riskLevel === 'Moderate').length,
      high: riskAssessments.filter(r => r.riskLevel === 'High').length
    };

    // Common symptoms from risk assessments
    const symptomCounts: Record<string, number> = {};
    riskAssessments.forEach(assessment => {
      assessment.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const commonSymptoms = Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trends for the last 6 months
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthPatients = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= monthDate && createdDate < nextMonthDate;
      });

      monthlyTrends.push({
        month: monthName,
        ongoing: monthPatients.filter(p => p.status === 'Ongoing').length,
        recurrence: monthPatients.filter(p => p.status === 'Recurrence').length,
        cancerFree: monthPatients.filter(p => p.status === 'Cancer-Free').length
      });
    }

    return {
      totalPatients,
      newPatientsThisMonth,
      ongoingPatients,
      recurrenceCases,
      cancerFreePatients,
      underObservation,
      deceased,
      riskDistribution,
      commonSymptoms,
      monthlyTrends
    };
  }, [patients, riskAssessments]);

  // Age group analysis from real patient data
  const ageGroupData = useMemo(() => {
    const ageGroups = [
      { group: '18-30', min: 18, max: 30 },
      { group: '31-45', min: 31, max: 45 },
      { group: '46-60', min: 46, max: 60 },
      { group: '61-75', min: 61, max: 75 },
      { group: '75+', min: 76, max: 150 }
    ];

    return ageGroups.map(ageGroup => {
      const patientsInGroup = patients.filter(p => 
        p.age >= ageGroup.min && p.age <= ageGroup.max
      );

      const patientIds = patientsInGroup.map(p => p.id);
      const assessmentsInGroup = riskAssessments.filter(r => 
        patientIds.includes(r.patientId)
      );

      return {
        group: ageGroup.group,
        low: assessmentsInGroup.filter(a => a.riskLevel === 'Low').length,
        moderate: assessmentsInGroup.filter(a => a.riskLevel === 'Moderate').length,
        high: assessmentsInGroup.filter(a => a.riskLevel === 'High').length
      };
    });
  }, [patients, riskAssessments]);

  // Gender distribution from real patient data
  const genderDistribution = useMemo(() => {
    const male = patients.filter(p => p.gender === 'Male').length;
    const female = patients.filter(p => p.gender === 'Female').length;
    const other = patients.filter(p => p.gender === 'Other').length;
    const total = patients.length || 1;

    return {
      male: { count: male, percentage: Math.round((male / total) * 100) },
      female: { count: female, percentage: Math.round((female / total) * 100) },
      other: { count: other, percentage: Math.round((other / total) * 100) }
    };
  }, [patients]);

  // Average age by risk level
  const averageAgeByRisk = useMemo(() => {
    const riskLevels: ('Low' | 'Moderate' | 'High')[] = ['Low', 'Moderate', 'High'];
    
    return riskLevels.reduce((acc, level) => {
      const assessments = riskAssessments.filter(r => r.riskLevel === level);
      const patientIds = assessments.map(a => a.patientId);
      const patientsWithRisk = patients.filter(p => patientIds.includes(p.id));
      
      if (patientsWithRisk.length > 0) {
        const totalAge = patientsWithRisk.reduce((sum, p) => sum + p.age, 0);
        acc[level] = (totalAge / patientsWithRisk.length).toFixed(1);
      } else {
        acc[level] = 'N/A';
      }
      
      return acc;
    }, {} as Record<string, string>);
  }, [patients, riskAssessments]);

  // High risk patients
  const highRiskPatients = useMemo(() => {
    const highRiskAssessments = riskAssessments.filter(r => r.riskLevel === 'High');
    const highRiskPatientIds = [...new Set(highRiskAssessments.map(r => r.patientId))];
    return patients.filter(p => highRiskPatientIds.includes(p.id)).slice(0, 5);
  }, [patients, riskAssessments]);

  // Risk distribution colors
  const riskColors = {
    low: '#22c55e',
    moderate: '#f59e0b', 
    high: '#ef4444'
  };

  const riskDistributionData = [
    { name: 'Low Risk', value: analytics.riskDistribution.low, color: riskColors.low },
    { name: 'Moderate Risk', value: analytics.riskDistribution.moderate, color: riskColors.moderate },
    { name: 'High Risk', value: analytics.riskDistribution.high, color: riskColors.high }
  ];

  // Monthly activity trends
  const monthlyActivityTrends = useMemo(() => {
    const now = new Date();
    const trends = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

      const newPatients = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= monthDate && createdDate < nextMonthDate;
      }).length;

      const assessments = riskAssessments.filter(r => {
        const assessmentDate = new Date(r.date);
        return assessmentDate >= monthDate && assessmentDate < nextMonthDate;
      }).length;

      const highRisk = riskAssessments.filter(r => {
        const assessmentDate = new Date(r.date);
        return assessmentDate >= monthDate && assessmentDate < nextMonthDate && r.riskLevel === 'High';
      }).length;

      trends.push({
        month: monthName,
        newPatients,
        assessments,
        highRisk
      });
    }

    return trends;
  }, [patients, riskAssessments]);

  const exportReport = (format: string) => {
    const fileName = `clinitrack-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Generating ${format.toUpperCase()} report: ${fileName}`);
    alert(`${format.toUpperCase()} report would be downloaded as: ${fileName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive patient data insights and trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedExportFormat} onValueChange={setSelectedExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => exportReport(selectedExportFormat)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold">{analytics.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +{analytics.newPatientsThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ongoing Patients</p>
                <p className="text-3xl font-bold">{analytics.ongoingPatients}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active treatment cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recurrence Cases</p>
                <p className="text-3xl font-bold">{analytics.recurrenceCases}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancer-Free</p>
                <p className="text-3xl font-bold">{analytics.cancerFreePatients}</p>
              </div>
              <Bell className="h-8 w-8 text-teal-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Successfully treated
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Current patient risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                {riskDistributionData.some(d => d.value > 0) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {riskDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No risk assessment data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Status Trends</CardTitle>
                <CardDescription>Monthly status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.monthlyTrends.some(t => t.ongoing > 0 || t.recurrence > 0 || t.cancerFree > 0) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="ongoing" stackId="1" stroke="#8884d8" fill="#8884d8" name="Ongoing" />
                        <Area type="monotone" dataKey="recurrence" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Recurrence" />
                        <Area type="monotone" dataKey="cancerFree" stackId="1" stroke="#ffc658" fill="#ffc658" name="Cancer-Free" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No trend data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Common Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>Most Common Symptoms</CardTitle>
              <CardDescription>Frequently reported symptoms across all patients</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.commonSymptoms.length > 0 ? (
                <div className="space-y-4">
                  {analytics.commonSymptoms.map((symptom, index) => (
                    <div key={symptom.symptom} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{symptom.symptom}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(symptom.count / analytics.commonSymptoms[0].count) * 100}%` }}
                          />
                        </div>
                        <Badge variant="secondary">{symptom.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No symptom data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk by Age Group */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution by Age Group</CardTitle>
                <CardDescription>Risk levels across different age demographics</CardDescription>
              </CardHeader>
              <CardContent>
                {ageGroupData.some(d => d.low > 0 || d.moderate > 0 || d.high > 0) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageGroupData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="low" stackId="a" fill={riskColors.low} name="Low" />
                        <Bar dataKey="moderate" stackId="a" fill={riskColors.moderate} name="Moderate" />
                        <Bar dataKey="high" stackId="a" fill={riskColors.high} name="High" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No age group data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* High Risk Patients Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>High Risk Patients</span>
                </CardTitle>
                <CardDescription>Patients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {highRiskPatients.length > 0 ? (
                  <div className="space-y-3">
                    {highRiskPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.age} years, {patient.gender}</p>
                        </div>
                        <Badge variant="destructive">High Risk</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No high-risk patients identified
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity Trends</CardTitle>
              <CardDescription>Patient registrations, assessments, and high-risk cases over time</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyActivityTrends.some(t => t.newPatients > 0 || t.assessments > 0 || t.highRisk > 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyActivityTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="newPatients" stroke="#8884d8" strokeWidth={2} name="New Patients" />
                      <Line type="monotone" dataKey="assessments" stroke="#82ca9d" strokeWidth={2} name="Assessments" />
                      <Line type="monotone" dataKey="highRisk" stroke="#ff7300" strokeWidth={2} name="High Risk" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No activity trend data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {patients.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Female</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${genderDistribution.female.percentage}%` }} />
                        </div>
                        <span className="text-sm">{genderDistribution.female.percentage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Male</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${genderDistribution.male.percentage}%` }} />
                        </div>
                        <span className="text-sm">{genderDistribution.male.percentage}%</span>
                      </div>
                    </div>
                    {genderDistribution.other.count > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Other</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${genderDistribution.other.percentage}%` }} />
                          </div>
                          <span className="text-sm">{genderDistribution.other.percentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No patient data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Age by Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessments.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Low Risk</span>
                      <Badge variant="default">{averageAgeByRisk.Low} years</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Moderate Risk</span>
                      <Badge variant="secondary">{averageAgeByRisk.Moderate} years</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>High Risk</span>
                      <Badge variant="destructive">{averageAgeByRisk.High} years</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No risk assessment data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('pdf')}>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="font-medium">Monthly Summary Report</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Comprehensive overview of monthly statistics
                </p>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('excel')}>
              <CardContent className="p-6 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-medium">Patient Data Export</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Detailed patient information and metrics
                </p>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => exportReport('csv')}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="font-medium">Risk Assessment Report</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  AI risk assessment data and trends
                </p>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}