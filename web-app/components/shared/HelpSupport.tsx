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
          id: 'role-ind-1',
          category: 'role-specific',
          question: 'How do I view my medical history and timeline?',
          answer: 'Navigate to the "Timeline" tab in the sidebar. This page aggregates your complete medical journey chronologically, combining medical visits, diagnostic reports, and active prescriptions.'
        },
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
          answer: 'Go to the "Patient Search" tab. Search using the patient’s unique ID or registered mobile number. If you have active authorization, their timeline will display; if not, you can request access.'
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formMessage.trim()) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form fields
      setFormSubject('');
      setFormMessage('');
    }, 1500);
  };

  const resetForm = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="rounded-[14px] border border-[#DCE8DC] bg-[#F7FAF7] p-6 shadow-soft">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block rounded-[6px] bg-[#EEF3EC] text-[#2E5D3F] border border-[#B8D0B9] px-3 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider">
            {roleLabel} Support
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1F3F2C] tracking-tight">How can we help you today?</h1>
          <p className="text-[#5E726E] text-sm font-sans leading-relaxed">
            Welcome to the MediSaar Support Hub. Browse the frequently asked questions or contact our team for assistance.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E726E]" />
            <input
              type="text"
              placeholder="Search guides, terms, and FAQs..."
              className="w-full h-10 pl-10 pr-4 rounded-[10px] bg-[#EEF3EC] text-[#1F3F2C] border border-[#B8D0B9] outline-none placeholder:text-[#5E726E] focus:ring-1 focus:ring-[#2E5D3F] transition-all text-sm font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE8DC] pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1F3F2C] tracking-tight flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#2E5D3F]" strokeWidth={1.5} />
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-[#5E726E] font-sans mt-1">Browse our answers to popular user questions.</p>
            </div>
            
            {/* FAQ Category Tabs */}
            <div className="flex gap-1 bg-[#EEF3EC] p-1 border border-[#B8D0B9] rounded-[10px] self-start sm:self-center text-xs font-sans">
              {(['all', 'general', 'security', 'role-specific'] as const).map((tab) => {
                const label = tab === 'role-specific' ? `${roleLabel} Info` : tab.charAt(0).toUpperCase() + tab.slice(1);
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-[8px] font-medium transition-all ${
                      isActive 
                        ? 'bg-[#F7FAF7] text-[#1F3F2C] shadow-soft' 
                        : 'text-[#5E726E] hover:text-[#1F3F2C]'
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
                    className={`border rounded-[14px] bg-[#F7FAF7] transition-all duration-200 overflow-hidden shadow-soft ${
                      isOpen ? 'border-[#2E5D3F] ring-1 ring-[#2E5D3F]/20' : 'border-[#DCE8DC] hover:border-[#B8D0B9]'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex justify-between items-center px-5 py-4 text-left font-serif font-bold text-sm md:text-base text-[#1F3F2C] transition-colors hover:text-[#2E5D3F]"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <span className="shrink-0 p-1 rounded-full bg-[#EEF3EC] text-[#2E5D3F] border border-[#B8D0B9]">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-60 opacity-100 border-t border-[#DCE8DC]' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-5 text-sm text-[#5E726E] font-sans leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-[#B8D0B9] rounded-[14px] bg-[#F7FAF7] text-[#5E726E]">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-[#5E726E]/60" />
                <p className="text-sm font-medium font-sans">No matches found for your search query.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveTab('all'); }} 
                  className="text-xs text-[#2E5D3F] underline mt-1 font-sans"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>

          {/* Quick Informational Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-[#DCE8DC] bg-[#F7FAF7] rounded-[14px] shadow-soft">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-[#EEF3EC] border border-[#B8D0B9] flex items-center justify-center text-[#2E5D3F] shrink-0">
                  <ShieldCheck className="h-5 w-5 text-[#2E5D3F]" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-[#1F3F2C]">GDPR & HIPAA Compliant</h4>
                  <p className="text-xs text-[#5E726E] font-sans leading-relaxed">Your healthcare documentation and credentials remain compliant with modern digital records guidelines.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#DCE8DC] bg-[#F7FAF7] rounded-[14px] shadow-soft">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-[#EEF3EC] border border-[#B8D0B9] flex items-center justify-center text-[#2E5D3F] shrink-0">
                  <Globe className="h-5 w-5 text-[#2E5D3F]" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-[#1F3F2C]">Unified Integration</h4>
                  <p className="text-xs text-[#5E726E] font-sans leading-relaxed">Access records smoothly across multiple medical dashboards from any browser or location.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact/Support Sidebar */}
        <div className="space-y-6">
          {/* Quick Contact Info */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1F3F2C] mb-4">Contact Information</h3>
            <div className="space-y-3">
              {/* Phone Channel */}
              <Card className="shadow-soft hover:shadow-lift transition-all duration-200 group border border-[#DCE8DC] bg-[#F7FAF7] rounded-[14px]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#EEF3EC] border border-[#B8D0B9] flex items-center justify-center text-[#2E5D3F] group-hover:scale-105 transition-transform">
                      <Phone className="h-4 w-4 text-[#2E5D3F]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#5E726E] block font-sans">Call Support</span>
                      <a href="tel:+918542951940" className="text-sm font-bold text-[#1F3F2C] hover:text-[#2E5D3F] transition-colors block font-sans">
                        +91 8542951940
                      </a>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border border-[#2E5D3F] text-[#2E5D3F] bg-transparent hover:bg-[#EEF3EC] rounded-[10px] h-8 px-3 text-xs font-sans font-semibold">
                    <a href="tel:+918542951940">Call</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Email Channel */}
              <Card className="shadow-soft hover:shadow-lift transition-all duration-200 group border border-[#DCE8DC] bg-[#F7FAF7] rounded-[14px]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#EEF3EC] border border-[#B8D0B9] flex items-center justify-center text-[#2E5D3F] group-hover:scale-105 transition-transform">
                      <Mail className="h-4 w-4 text-[#2E5D3F]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#5E726E] block font-sans">Email Support</span>
                      <a href="mailto:ekanshsatsangi@gmail.com" className="text-sm font-bold text-[#1F3F2C] hover:text-[#2E5D3F] transition-colors block font-sans truncate max-w-[160px] md:max-w-none">
                        ekanshsatsangi@gmail.com
                      </a>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border border-[#2E5D3F] text-[#2E5D3F] bg-transparent hover:bg-[#EEF3EC] rounded-[10px] h-8 px-3 text-xs font-sans font-semibold">
                    <a href="mailto:ekanshsatsangi@gmail.com">Email</a>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Working Hours Info */}
              <div className="flex items-center gap-2 px-1 text-xs text-[#5E726E] font-sans">
                <Clock className="h-3.5 w-3.5 text-[#5E726E]/70" />
                <span>Response Time: &lt; 2 hours | Mon - Sat, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Support Ticket Form */}
          <Card className="shadow-soft border border-[#DCE8DC] bg-[#F7FAF7] rounded-[14px]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-serif font-bold text-[#1F3F2C] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#2E5D3F]" strokeWidth={1.5} />
                Submit a Request
              </CardTitle>
              <CardDescription className="text-xs text-[#5E726E] font-sans">
                Can&apos;t find your answer? Send a message to our support team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubmitted ? (
                <div className="py-6 text-center space-y-4 animate-in zoom-in duration-200">
                  <div className="h-12 w-12 bg-[#EEF3EC] text-[#2E5D3F] border border-[#B8D0B9] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-[#2E5D3F]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#1F3F2C]">Message Sent!</h4>
                    <p className="text-xs text-[#5E726E] font-sans max-w-[220px] mx-auto leading-relaxed">
                      Thank you for contacting us. We&apos;ve received your request and will reply via email soon.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetForm} className="border border-[#2E5D3F] text-[#2E5D3F] bg-transparent hover:bg-[#EEF3EC] rounded-[10px] text-xs font-sans font-semibold">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5E726E] font-sans">Full Name</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required 
                      className="h-9 font-sans border-[#DCE8DC] focus:border-[#2E5D3F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5E726E] font-sans">Contact Email</label>
                    <Input 
                      type="email" 
                      placeholder="e.g. name@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required 
                      className="h-9 font-sans border-[#DCE8DC] focus:border-[#2E5D3F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5E726E] font-sans">Subject</label>
                    <Input 
                      type="text" 
                      placeholder="Topic of your inquiry"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      required 
                      className="h-9 font-sans border-[#DCE8DC] focus:border-[#2E5D3F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5E726E] font-sans">Description</label>
                    <Textarea 
                      placeholder="Describe your issue here..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      required
                      className="min-h-[100px] resize-none py-2 text-sm font-sans border-[#DCE8DC] focus:border-[#2E5D3F]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formSubject.trim() || !formMessage.trim()} 
                    className="w-full bg-[#2E5D3F] hover:bg-[#1F3F2C] text-white rounded-[10px] h-9 mt-2 text-xs font-semibold font-sans transition-colors"
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
