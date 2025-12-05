import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Book, MessageCircle, ChevronDown, ChevronRight, Search, 
  HelpCircle, Mail, Phone, FileText, Video, Users, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function HelpPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const generalFAQs = [
    {
      id: '1',
      question: 'How do I log in to CliniTrack?',
      answer: 'You can log in using your email address and password. If you have two-factor authentication enabled, you\'ll also need to enter the 6-digit verification code. For demo purposes, use doctor@clinitrack.com/doctor123 or secretary@clinitrack.com/secretary123.'
    },
    {
      id: '2',
      question: 'What should I do if I forget my password?',
      answer: 'Click on "Forgot your password?" on the login page and enter your email address. You\'ll receive instructions to reset your password. This is a demo feature in the current system.'
    },
    {
      id: '3',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Settings > Security and toggle the "Enable Two-Factor Authentication" switch. This adds an extra layer of security to your account.'
    },
    {
      id: '4',
      question: 'Can I change my role from Secretary to Doctor?',
      answer: 'Role changes must be requested through your system administrator. Contact support for role modification requests.'
    }
  ];

  const secretaryFAQs = [
    {
      id: 's1',
      question: 'How do I register a new patient?',
      answer: 'Navigate to "New Patient" in the sidebar, fill out the patient demographics form, upload any lab/imaging files, and click "Create Patient Record". All required fields must be completed.'
    },
    {
      id: 's2',
      question: 'What file formats can I upload for lab results?',
      answer: 'You can upload PDF, PNG, JPG, and JPEG files up to 10MB each. Common formats include lab reports in PDF and imaging results in JPG/PNG format.'
    },
    {
      id: 's3',
      question: 'How do I update existing patient information?',
      answer: 'Go to "Existing Patients", search for the patient, click "View Details", then click the "Edit" button to modify their information.'
    },
    {
      id: 's4',
      question: 'Can I upload multiple lab results for one patient?',
      answer: 'Yes, you can upload multiple lab results. Each result should be uploaded separately with its own type, name, and description.'
    }
  ];

  const doctorFAQs = [
    {
      id: 'd1',
      question: 'How does the AI risk assessment work?',
      answer: 'The AI analyzes patient symptoms, age, gender, and medical history to predict risk levels (Low, Moderate, High). You can add clinical notes and override the AI assessment if needed.'
    },
    {
      id: 'd2',
      question: 'How do I perform a risk assessment?',
      answer: 'Go to "AI Risk Assessment", select a patient, enter their symptoms, and click "Analyze Risk Level". Review the results and add your clinical notes before saving.'
    },
    {
      id: 'd3',
      question: 'What do the analytics show?',
      answer: 'The Analytics dashboard provides insights on patient distribution, risk levels, trends, demographics, and common symptoms. You can export reports in PDF, Excel, or CSV format.'
    },
    {
      id: 'd4',
      question: 'How often should I follow up with patients?',
      answer: 'Follow-up recommendations vary by risk level. The system alerts you when patients haven\'t been seen for 3+ months or when AI assessments may need updating.'
    }
  ];

  const getCurrentFAQs = () => {
    let faqs = generalFAQs;
    if (user?.role === 'secretary') {
      faqs = [...generalFAQs, ...secretaryFAQs];
    } else if (user?.role === 'doctor') {
      faqs = [...generalFAQs, ...doctorFAQs];
    }

    if (searchTerm) {
      return faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return faqs;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitSuccess(true);
    setContactForm({ subject: '', message: '', priority: 'medium' });
    setIsSubmitting(false);

    // Reset success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const userGuideSteps = user?.role === 'secretary' ? [
    { title: 'Getting Started', description: 'Log in with your credentials and navigate the secretary dashboard' },
    { title: 'Register New Patients', description: 'Use the New Patient form to add patient demographics and medical information' },
    { title: 'Upload Lab Results', description: 'Attach lab reports and imaging files to patient records' },
    { title: 'Search Existing Patients', description: 'Find and update patient information using the search function' },
    { title: 'Manage Files', description: 'Upload, view, and organize patient documents and test results' }
  ] : [
    { title: 'Getting Started', description: 'Access your doctor dashboard and review patient overview' },
    { title: 'Review Patient Profiles', description: 'View complete patient records, visit history, and lab results' },
    { title: 'Perform Risk Assessments', description: 'Use AI-powered tools to analyze patient symptoms and risk levels' },
    { title: 'Add Clinical Notes', description: 'Document your observations and override AI recommendations when needed' },
    { title: 'Monitor Analytics', description: 'Track patient trends, risk distributions, and follow-up alerts' },
    { title: 'Export Reports', description: 'Generate and download comprehensive patient reports' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Help & Support</h2>
        <p className="text-muted-foreground">Find answers, guides, and get assistance with CliniTrack</p>
      </div>

      <Tabs defaultValue="guide" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guide">User Guide</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Book className="h-5 w-5" />
                <CardTitle>User Guide for {user?.role === 'secretary' ? 'Secretaries' : 'Doctors'}</CardTitle>
              </div>
              <CardDescription>
                Step-by-step instructions for using CliniTrack effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userGuideSteps.map((step, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search FAQ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2">
                  {getCurrentFAQs().map((faq) => (
                    <Collapsible key={faq.id} open={openFAQ === faq.id} onOpenChange={(isOpen) => setOpenFAQ(isOpen ? faq.id : null)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                          <span className="font-medium">{faq.question}</span>
                          {openFAQ === faq.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                {getCurrentFAQs().length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 font-medium">No FAQs found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <CardTitle>Contact Support</CardTitle>
                </div>
                <CardDescription>
                  Send us a message and we'll get back to you soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitSuccess ? (
                  <Alert>
                    <MessageCircle className="h-4 w-4" />
                    <AlertDescription>
                      Thank you for your message! Our support team will respond within 24 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={contactForm.priority}
                        onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full p-2 border border-input rounded-md bg-background"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Please describe your issue or question in detail..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@clinitrack.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-xs text-muted-foreground">Mon-Fri, 9 AM - 5 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available during business hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security & Privacy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CliniTrack takes data security seriously. All patient information is encrypted and handled 
                    according to healthcare privacy regulations. For security-related concerns, please contact 
                    our security team directly at security@clinitrack.com.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}