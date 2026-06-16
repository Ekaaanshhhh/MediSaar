'use client'

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface HelpSupportProps {
  role: 'DOCTOR' | 'INDIVIDUAL' | 'INSTITUTION';
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'security' | 'role-specific';
}

export function HelpSupport({ role }: HelpSupportProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'security' | 'role-specific'>('all');
  
  // Support Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Custom role labels
  const roleLabel = useMemo(() => {
    switch (role) {
      case 'DOCTOR': return 'Doctor';
      case 'INDIVIDUAL': return 'Individual Patient';
      case 'INSTITUTION': return 'Medical Institution';
      default: return 'User';
    }
  }, [role]);

  // Dynamic FAQs
  const faqs = useMemo<FAQItem[]>(() => {
    const commonFaqs: FAQItem[] = [
      {
        id: 'gen-1',
        category: 'general',
        question: 'What is MediSaar?',
        answer: 'MediSaar is a secure, decentralized health record management platform designed to connect individuals, doctors, and medical institutions. It enables seamless, secure sharing and tracking of medical histories and reports.'
      },
      {
        id: 'gen-2',
        category: 'general',
        question: 'How do I update my profile details?',
        answer: 'You can navigate to the "Settings" page using the sidebar navigation. There, you can update your personal/professional details, change your password, and adjust your notifications settings.'
      },
      {
        id: 'sec-1',
        category: 'security',
        question: 'Is my medical data secure on MediSaar?',
        answer: 'Yes, security and privacy are our highest priorities. All medical records are encrypted, and individuals retain absolute ownership and control over who has access to their data, for what duration, and for what purpose.'
      },
      {
        id: 'sec-2',
        category: 'security',
        question: 'Who can view my health documents or reports?',
        answer: 'Only authorized entities can access documents. For individuals, you must explicitly approve consent requests. For doctors, you can only access records of patients who have granted you active consent.'
      }
    ];

    const roleFaqs: FAQItem[] = [];

    if (role === 'INDIVIDUAL') {
      roleFaqs.push(

        {
          id: 'role-ind-2',
          category: 'role-specific',
          question: 'How do I authorize a doctor to view my records?',
          answer: 'When a doctor or institution requests access to your health history, you will receive a digital consent prompt. You can approve or decline it. You can also view and revoke active consent items in your profile Settings.'
        },
        {
          id: 'role-ind-3',
          category: 'role-specific',
          question: 'Can I upload my own medical reports?',
          answer: 'Yes! While medical institutions usually upload official diagnostics directly, you can upload and catalog your self-reported files or historical documents within the Reports section.'
        }
      );
    } else if (role === 'DOCTOR') {
      roleFaqs.push(
        {
          id: 'role-doc-1',
          category: 'role-specific',
          question: 'How do I lookup a patient’s health record?',
          answer: 'Go to the "Patient Search" tab. Search using the patient’s unique ID or registered mobile number. If you have active authorization, their history will display; if not, you can request access.'
        },
        {
          id: 'role-doc-2',
          category: 'role-specific',
          question: 'How do I request a patient’s digital consent?',
          answer: 'When searching a patient, click the "Request Access" button if their details are hidden. The patient will be notified, and once they approve, their health history and reports will unlock on your screen.'
        },
        {
          id: 'role-doc-3',
          category: 'role-specific',
          question: 'How do I link my doctor profile to an institution?',
          answer: 'In the sidebar under "My Institutions", you can search for registered clinics and hospitals. Send a joining request, which will notify the institution’s admin team for credential verification.'
        }
      );
    } else if (role === 'INSTITUTION') {
      roleFaqs.push(
        {
          id: 'role-inst-1',
          category: 'role-specific',
          question: 'How does our institution upload patient health reports?',
          answer: 'Navigate to the "Upload Center" in the sidebar. You can select or drag and drop document files (PDF/Images), link them to the patient’s ID or mobile number, specify the consulting doctor, and upload them securely.'
        },
        {
          id: 'role-inst-2',
          category: 'role-specific',
          question: 'How do we manage active doctors in our facility?',
          answer: 'In the management settings panel, you can view pending join requests from doctors. Once verified, you can assign them clinical credentials, enabling them to represent your institution.'
        },
        {
          id: 'role-inst-3',
          category: 'role-specific',
          question: 'Is there a bulk upload feature for historical data?',
          answer: 'Yes, our upload center supports bulk imports. You can upload a structured archive along with a mapping sheet, or contact our integration team at ekanshsatsangi@gmail.com for custom API integrations.'
        }
      );
    }

    return [...commonFaqs, ...roleFaqs];
  }, [role]);

  // Filtered FAQs based on search and category tab
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || faq.category === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [faqs, searchQuery, activeTab]);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formMessage.trim()) return;

    setIsSubmitting(true);
    
    if (role === 'INDIVIDUAL') {
      try {
        const res = await fetch('/api/individual/help', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: formSubject,
            category: 'General',
            description: formMessage
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsSubmitted(true);
          setFormSubject('');
          setFormMessage('');
        } else {
          alert(data.message || 'Failed to submit ticket');
        }
      } catch (err: any) {
        alert(err.message || 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Simulate API request for other roles
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        // Reset form fields
        setFormSubject('');
        setFormMessage('');
      }, 1500);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-accent p-6 md:p-10 text-primary-foreground shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {roleLabel} Help Center
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">How can we help you today?</h1>
          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            Welcome to the MediSaar Support Hub. Find answers to common questions about security, patient records, and account features, or contact our team directly.
          </p>
          
          {/* Hero Search Bar */}
          <div className="relative max-w-md mt-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search guides, terms, and FAQs..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-background text-foreground border-0 shadow-inner outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-white/50 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Browse our answers to popular user questions.</p>
            </div>
            
            {/* FAQ Category Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg self-start sm:self-center text-xs">
              {(['all', 'general', 'security', 'role-specific'] as const).map((tab) => {
                const label = tab === 'role-specific' ? `${roleLabel} Info` : tab.charAt(0).toUpperCase() + tab.slice(1);
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      isActive 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className={`border rounded-xl bg-card transition-all duration-200 overflow-hidden shadow-sm ${
                      isOpen ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/5' : 'hover:border-border/80'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex justify-between items-center px-5 py-4 text-left font-medium text-sm md:text-base text-foreground transition-colors hover:text-primary"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <span className="shrink-0 p-1 rounded-full bg-muted text-muted-foreground">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-60 opacity-100 border-t border-border/50' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed rounded-xl bg-card text-muted-foreground">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                <p className="text-sm font-medium">No matches found for your search query.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveTab('all'); }} 
                  className="text-xs text-primary underline mt-1"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>

          {/* Quick Informational Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">GDPR & HIPPA Compliant</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Your healthcare documentation and credentials remain compliant with modern digital records guidelines.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Unified Integration</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Access records smoothly across multiple medical dashboards from any browser or location.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact/Support Sidebar */}
        <div className="space-y-6">
          {/* Quick Contact Info */}
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-4">Contact Information</h3>
            <div className="space-y-3">
              {/* Phone Channel */}
              <Card className="shadow-sm hover:shadow-md transition-all duration-200 group border border-border/60">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block">Call Support</span>
                      <a href="tel:+918542951940" className="text-sm font-bold text-foreground hover:text-primary transition-colors block">
                        +91 8542951940
                      </a>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-lg h-8 px-3 text-xs">
                    <a href="tel:+918542951940">Call</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Email Channel */}
              <Card className="shadow-sm hover:shadow-md transition-all duration-200 group border border-border/60">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block">Email Support</span>
                      <a href="mailto:ekanshsatsangi@gmail.com" className="text-sm font-bold text-foreground hover:text-primary transition-colors block truncate max-w-[160px] md:max-w-none">
                        ekanshsatsangi@gmail.com
                      </a>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-lg h-8 px-3 text-xs">
                    <a href="mailto:ekanshsatsangi@gmail.com">Email</a>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Working Hours Info */}
              <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>Response Time: &lt; 2 hours | Mon - Sat, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Support Ticket Form */}
          <Card className="shadow-sm border border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Submit a Support Request
              </CardTitle>
              <CardDescription className="text-xs">
                Can't find your answer? Send a direct message and our operations team will reply via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubmitted ? (
                <div className="py-6 text-center space-y-4 animate-in zoom-in duration-200">
                  <div className="h-12 w-12 bg-teal-500/10 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">Message Sent!</h4>
                    <p className="text-xs text-muted-foreground max-w-[220px] mx-auto">
                      Thank you for contacting us. We've received your request and will contact you at <strong>ekanshsatsangi@gmail.com</strong> or your registered email soon.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetForm} className="mt-2 text-xs">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required 
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Contact Email</label>
                    <Input 
                      type="email" 
                      placeholder="e.g. name@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required 
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                    <Input 
                      type="text" 
                      placeholder="Brief topic of your inquiry"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      required 
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Detailed Description</label>
                    <Textarea 
                      placeholder="Please provide details about your issue..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      required
                      className="min-h-[100px] resize-none py-2 text-sm"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formSubject.trim() || !formMessage.trim()} 
                    className="w-full h-9 mt-2 text-xs font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
