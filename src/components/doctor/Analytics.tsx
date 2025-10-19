import React, { useState } from 'react';
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
import { Analytics as AnalyticsType, Patient, RiskAssessment } from '../../types';
import { mockAnalytics } from '../../data/mockData';

interface AnalyticsProps {
  patients: Patient[];
  riskAssessments: RiskAssessment[];
}

export function Analytics({ patients, riskAssessments }: AnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedExportFormat, setSelectedExportFormat] = useState('pdf');

  const analytics = mockAnalytics;

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

  // Sample data for age group analysis
  const ageGroupData = [
    { group: '18-30', low: 45, moderate: 12, high: 3 },
    { group: '31-45', low: 78, moderate: 28, high: 8 },
    { group: '46-60', low: 92, moderate: 45, high: 15 },
    { group: '61-75', low: 65, moderate: 38, high: 22 },
    { group: '75+', low: 34, moderate: 28, high: 18 }
  ];

  // Sample data for monthly trends
  const monthlyTrends = [
    { month: 'Jan', newPatients: 12, assessments: 45, highRisk: 8 },
    { month: 'Feb', newPatients: 15, assessments: 52, highRisk: 12 },
    { month: 'Mar', newPatients: 8, assessments: 38, highRisk: 6 },
    { month: 'Apr', newPatients: 18, assessments: 63, highRisk: 15 },
    { month: 'May', newPatients: 22, assessments: 71, highRisk: 18 },
    { month: 'Jun', newPatients: 19, assessments: 58, highRisk: 14 }
  ];

  const exportReport = (format: string) => {
    // Simulate report generation
    const fileName = `clinitrack-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Generating ${format.toUpperCase()} report: ${fileName}`);
    
    // In a real application, this would trigger actual file download
    alert(`${format.toUpperCase()} report would be downloaded as: ${fileName}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <p className="text-sm font-medium text-muted-foreground">Follow-up Alerts</p>
                <p className="text-3xl font-bold">{analytics.followUpAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Due within 30 days
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
              </CardContent>
            </Card>

            {/* Status Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Status Trends</CardTitle>
                <CardDescription>Monthly status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.statusTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="ongoing" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="recurrence" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="cancerFree" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="low" stackId="a" fill={riskColors.low} />
                      <Bar dataKey="moderate" stackId="a" fill={riskColors.moderate} />
                      <Bar dataKey="high" stackId="a" fill={riskColors.high} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient, index) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.age} years, {patient.gender}</p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                  ))}
                </div>
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newPatients" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="assessments" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="highRisk" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Female</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '58%' }} />
                      </div>
                      <span className="text-sm">58%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Male</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }} />
                      </div>
                      <span className="text-sm">42%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Age by Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Low Risk</span>
                    <Badge variant="default">45.2 years</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Moderate Risk</span>
                    <Badge variant="secondary">52.8 years</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High Risk</span>
                    <Badge variant="destructive">61.3 years</Badge>
                  </div>
                </div>
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