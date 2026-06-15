"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  User
} from "lucide-react";

/* ─── Navigation ───────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-canvas/90 backdrop-blur-sm border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-[22px] text-sage-800 tracking-[-0.02em]">
          MediSaar
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#problem">Problem</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#workspaces">Workspaces</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#workflow">Workflow</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#advisors">Advisors</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#impact">Impact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-ink-700 hover:text-ink-900 hover:bg-sage-50 font-sans">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-sage-600 hover:bg-sage-800 text-surface rounded-sm px-5 py-2 font-sans transition-colors duration-[220ms] flex items-center gap-1.5 font-semibold">
              Try the demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero Section (Inspired by Image 1) ───────────────────────────────── */

function HeroSection() {
  return (
    <section className="w-full bg-canvas pt-12 pb-20 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Main Hero Rounded Card Wrapper */}
        <div className="bg-surface border border-sage-100 rounded-[28px] p-8 md:p-12 shadow-soft relative overflow-hidden grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">

          {/* Subtle lighting overlay */}
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-sage-50/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          {/* Left Side Content */}
          <div className="relative z-10 max-w-[620px]">
            {/* Clinical Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold mb-6 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-600 animate-pulse" />
              Trusted Clinical Intelligence Layer
            </div>

            <h1 className="font-serif text-[44px] md:text-[64px] font-semibold text-ink-900 tracking-[-0.02em] leading-[1.1] mb-6">
              Years of scattered records.{" "}
              <span className="italic text-sage-600 font-serif">One clinical truth.</span>{" "}
              In <span className="text-ink-900 relative inline-block border-b-[3px] border-b-amber-500 pb-0.5">60 seconds</span>.
            </h1>

            <p className="text-base md:text-lg text-ink-700 leading-relaxed mb-8 max-w-[500px] font-sans">
              MediSaar unifies patient health histories across India&rsquo;s digital networks and converts unstructured clinical documents into instant, source-cited co-pilot dashboards.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/signup">
                <Button className="bg-sage-600 hover:bg-sage-800 text-surface rounded-sm h-12 px-6 text-sm font-semibold transition-colors duration-[220ms]">
                  Try the Demo
                  <ArrowRight className="w-4.5 h-4.5 ml-1.5" strokeWidth={2} />
                </Button>
              </Link>
              <Link href="#contact">
                <Button variant="outline" className="rounded-sm h-12 px-6 text-sm font-semibold border-sage-300 text-ink-700 hover:bg-sage-50 transition-colors duration-[220ms]">
                  Request a Demo
                </Button>
              </Link>
            </div>

            {/* Micro Stat Item */}
            <div className="inline-flex items-center gap-3 bg-canvas/80 backdrop-blur-sm border border-sage-100 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-sage-800" strokeWidth={2} />
              </div>
              <p className="text-xs text-ink-700 font-sans font-medium">
                <strong className="text-ink-900">ABHA Integrated</strong> · NHA Architecture compliant
              </p>
            </div>
          </div>

          {/* Right Side Visual Illustration with Floating Cards */}
          <div className="relative w-full min-h-[460px] max-w-[480px] mx-auto lg:max-w-none flex items-center justify-center">

            {/* Concentric rings background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[110%] aspect-square rounded-full border border-sage-100/60 animate-[spin_60s_linear_infinite]" />
              <div className="w-[85%] aspect-square rounded-full border border-sage-200/40" />
              <div className="w-[60%] aspect-square rounded-full border border-sage-200/60" />
            </div>

            {/* Doctor Portrait Image Frame */}
            <div className="relative w-72 h-[420px] bg-sage-50 rounded-[24px] overflow-hidden shadow-soft flex items-center justify-center border border-sage-200/50">
              <Image
                src="/doctor-patient.png"
                alt="Doctor explaining clinical timeline on a tablet to a senior patient"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 288px"
              />
            </div>

            {/* Floating Card 1: AI Summary Pill */}
            <div className="absolute -left-6 top-8 bg-surface border border-sage-100 p-4 rounded-xl shadow-lift max-w-[200px] animate-fade-up">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-amber-500">AI CLINICAL ASSIST</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <p className="text-[11px] text-ink-700 leading-normal font-sans">
                Patient history shows Type 2 Diabetes since 2020. Managed on Metformin 500mg.
              </p>
            </div>

            {/* Floating Card 2: Diagnostics Graph Pill */}
            <div className="absolute -right-4 bottom-12 bg-surface border border-sage-100 p-4 rounded-xl shadow-lift w-[180px] animate-fade-up delay-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-ink-500">HbA1c TRENDS</span>
                <span className="text-[10px] font-bold text-sage-800">-0.6%</span>
              </div>
              {/* Mini SVG graph */}
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 140 30" fill="none">
                <path d="M0 25 C30 15, 60 22, 90 8 C110 0, 130 5, 140 3" stroke="var(--color-sage-600)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="90" cy="8" r="3.5" fill="var(--color-sage-800)" />
                <circle cx="140" cy="3" r="3.5" fill="var(--color-amber-500)" />
              </svg>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}



/* ─── Healthcare Integrations / Logos Bar ─────────────────────────────── */

function IntegrationsBar() {
  return (
    <section className="w-full bg-canvas border-b border-sage-100 py-10">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <p className="text-center text-xs uppercase tracking-[0.06em] text-ink-300 font-semibold mb-6">
          Integrating directly with India&rsquo;s digital healthcare standard protocols
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75">
          {/* Logo 1: ABDM */}
          <div className="flex items-center gap-2 text-sage-800">
            <svg className="w-8 h-8 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-serif font-bold text-sm tracking-tight">ABDM</span>
          </div>

          {/* Logo 2: NHA */}
          <div className="flex items-center gap-2 text-sage-800">
            <svg className="w-8 h-8 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-serif font-bold text-sm tracking-tight">NHA CO-PLAN</span>
          </div>

          {/* Logo 3: FHIR */}
          <div className="flex items-center gap-2 text-sage-800">
            <svg className="w-8 h-8 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span className="font-sans font-bold text-xs tracking-wider uppercase">HL7 FHIR</span>
          </div>

          {/* Logo 4: SNOMED */}
          <div className="flex items-center gap-2 text-sage-800">
            <svg className="w-8 h-8 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            <span className="font-sans font-bold text-xs tracking-wider uppercase">SNOMED CT</span>
          </div>

          {/* Logo 5: NIC */}
          <div className="flex items-center gap-2 text-sage-800">
            <svg className="w-8 h-8 text-sage-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
            </svg>
            <span className="font-serif font-bold text-sm tracking-tight">NIC GOV</span>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── Problem Section (Redesigned to match Image 2's slide) ────────────── */

function ProblemSection() {
  return (
    <section id="problem" className="w-full bg-canvas py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left Column: Problem Narrative */}
          <div className="space-y-6">
            {/* Problem Eyebrow */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-status-alert/10 text-status-alert border border-status-alert/20 text-xs font-semibold uppercase tracking-[0.06em] font-sans">
                THE PROBLEM
              </span>
            </div>

            <h2 className="font-serif text-[36px] md:text-[48px] font-semibold text-ink-900 tracking-[-0.015em] leading-tight">
              Meet Mr. Sharma — 58, Diabetic, 4 Hospitals in 6 Years
            </h2>

            <p className="text-base text-ink-700 leading-relaxed font-sans max-w-[540px]">
              He arrives with <strong className="text-ink-900 font-semibold">80 pages of paper records</strong>. His consulting doctor has <strong className="text-ink-900 font-semibold">7 minutes</strong> to review his case. The critical clinical history never gets read.
            </p>

            {/* Stack of 3 detailed cards */}
            <div className="space-y-4 pt-4">

              {/* Card 1: Fragmented */}
              <div className="bg-surface border border-sage-100 rounded-xl p-5 shadow-soft hover:shadow-lift transition-shadow duration-[220ms]">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center shrink-0">
                    <span className="font-serif text-sm font-semibold text-sage-800">1</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-ink-900 mb-1">Fragmented Record-Keeping</h4>
                    <p className="text-xs text-ink-500 leading-relaxed">
                      Health records remain scattered across private and public clinics with zero centralization. Every consultant starts the diagnostic process from absolute scratch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Unreadable */}
              <div className="bg-surface border border-sage-100 rounded-xl p-5 shadow-soft hover:shadow-lift transition-shadow duration-[220ms]">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center shrink-0">
                    <span className="font-serif text-sm font-semibold text-sage-800">2</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-ink-900 mb-1">Unreadable & Lost Reports</h4>
                    <p className="text-xs text-ink-500 leading-relaxed">
                      Handwritten notes, paper prescriptions, and faded lab printouts are damaged or misplaced over years of transitions, letting critical metabolic contexts disappear.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Repeated */}
              <div className="bg-surface border border-sage-100 rounded-xl p-5 shadow-soft hover:shadow-lift transition-shadow duration-[220ms]">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center shrink-0">
                    <span className="font-serif text-sm font-semibold text-sage-800">3</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-ink-900 mb-1">Repeated Diagnostics</h4>
                    <p className="text-xs text-ink-500 leading-relaxed">
                      Without visibility into prior diagnostic findings, doctors are forced to repeat tests. This incurs heavy costs, wastes precious clinical time, and damages patient trust.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Amber Warning Banner (Directly from slide) */}
            <div className="bg-amber-50/80 border border-amber-500/20 rounded-xl p-5 shadow-sm flex gap-4 mt-6">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-700">
                <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-amber-700 leading-relaxed font-sans font-medium">
                <strong className="text-amber-800">32% (approximate)</strong> of transferred patients receive at least one duplicate diagnostic test &mdash; a direct, costly consequence of fragmented clinical data pipelines.
              </p>
            </div>

          </div>

          {/* Right Column: Flying Vortex Illustration */}
          <div className="flex items-center justify-center lg:sticky lg:top-24 h-fit pt-8 lg:pt-0">
            <div className="w-full max-w-[340px] aspect-[9/16] bg-surface border border-sage-100 rounded-[24px] overflow-hidden shadow-soft flex items-center justify-center relative">
              <Image
                src="/hero-doctor.png"
                alt="Mr. Sharma overwhelmed by flying paper medical records"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 340px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}



/* ─── Workspaces Section (Inspired by Image 1) ────────────────────────── */

function WorkspacesSection() {
  const workspaces = [
    {
      role: "Doctors",
      title: "Doctor Co-Pilot",
      icon: Stethoscope,
      color: "text-sage-600",
      bg: "bg-sage-50",
      border: "border-sage-100",
      desc: "Get a unified co-pilot dashboard before the patient even sits down. Combines records, flags safety alerts, and generates AI clinical summaries.",
      points: [
        "AI summary of complete clinical history",
        "Emergency health cards in one-tap",
        "Direct citation links to original PDFs"
      ],
      cta: "Doctor portal",
      href: "/signup?role=doctor"
    },
    {
      role: "Patients",
      title: "Patient Health Hub",
      icon: User,
      color: "text-status-info",
      bg: "bg-status-info/5",
      border: "border-status-info/15",
      desc: "Access your clinical history written in clear, human language. Rest easy knowing you own and control your health records.",
      points: [
        "Chronological clinical journey timeline",
        "Active medication and appointment trackers",
        "Granular consent-based doctor sharing"
      ],
      cta: "Patient portal",
      href: "/signup?role=patient"
    },
    {
      role: "Institutions",
      title: "Institutional Hub",
      icon: Building2,
      color: "text-ink-500",
      bg: "bg-surface-sunk/60",
      border: "border-sage-100",
      desc: "Optimize hospital intake and records processing. Empower staff with automated file uploads, queue analysis, and OCR scoring.",
      points: [
        "Drag-and-drop intake record queue",
        "High-confidence OCR text extraction",
        "ABDM-compliant security & audit logs"
      ],
      cta: "Institution portal",
      href: "/signup?role=institution"
    }
  ];

  return (
    <section id="workspaces" className="w-full bg-surface py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Section Header */}
        <div className="max-w-[620px] mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans mb-4">
            TAILORED SOLUTIONS
          </span>
          <h2 className="font-serif text-[36px] md:text-[44px] font-semibold text-ink-900 tracking-[-0.015em] leading-tight">
            One Core Clinical Engine. Three Custom Workspaces.
          </h2>
          <p className="text-base text-ink-500 font-sans mt-3">
            MediSaar provides specialized dashboards optimized for the unique requirements of clinicians, patients, and operations staff.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {workspaces.map((ws) => (
            <div
              key={ws.title}
              className="bg-surface border border-sage-100/60 rounded-[20px] p-8 shadow-soft flex flex-col justify-between hover:shadow-lift transition-shadow duration-[220ms]"
            >
              <div>
                {/* Header Icon */}
                <div className={`w-12 h-12 rounded-[14px] ${ws.bg} border ${ws.border} flex items-center justify-center mb-6`}>
                  <ws.icon className={`w-5 h-5 ${ws.color}`} strokeWidth={1.5} />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-300 block mb-1">{ws.role}</span>
                <h3 className="font-serif text-2xl font-semibold text-ink-900 mb-4">{ws.title}</h3>

                <p className="text-xs text-ink-500 leading-relaxed mb-6 font-sans">
                  {ws.desc}
                </p>

                {/* Point Lists */}
                <ul className="space-y-3 mb-8">
                  {ws.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-xs text-ink-700 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={ws.href}>
                <Button variant="outline" className="w-full justify-between rounded-sm border-sage-200 text-ink-700 hover:bg-sage-50 transition-colors duration-[220ms] font-sans text-xs">
                  {ws.cta}
                  <ChevronRight className="w-4 h-4 text-ink-300" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─── Workflow pipeline Section (Inspired by Image 1) ─────────────────── */

function WorkflowSection() {
  const steps = [
    { n: "01", name: "Secure Upload", desc: "Clerks or doctors upload paper/digital records." },
    { n: "02", name: "Intelligent OCR", desc: "Structured text is extracted from files and scripts." },
    { n: "03", name: "Vector Indexing", desc: "Data is chunked, embedded, and mapped securely." },
    { n: "04", name: "RAG Retrieval", desc: "Relevant context is extracted matching clinical queries." },
    { n: "05", name: "AI Summarization", desc: "Clinical LLM yields source-cited summaries." }
  ];

  return (
    <section id="workflow" className="w-full bg-canvas py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Section Header */}
        <div className="text-center max-w-[620px] mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans mb-4">
            TECHNICAL INTEGRITY
          </span>
          <h2 className="font-serif text-[36px] md:text-[44px] font-semibold text-ink-900 tracking-[-0.015em] leading-tight">
            How MediSaar Unifies Patient Records
          </h2>
          <p className="text-base text-ink-500 font-sans mt-3">
            A pipeline that transforms unstructured clinical notes into reliable, auditable intelligence.
          </p>
        </div>

        {/* Workflow Diagram Card */}
        <div className="bg-surface border border-sage-100 rounded-[28px] p-8 md:p-12 shadow-soft mb-12 flex flex-col items-center">

          {/* Diagram Component */}
          <div className="w-full max-w-4xl mb-12">
            <WorkflowDiagram />
          </div>

          {/* Description Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center w-full">
            {steps.map((st) => (
              <div key={st.n} className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-sage-600 block">{st.n} · {st.name}</span>
                <p className="text-[11px] text-ink-500 leading-normal font-sans">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

function WorkflowDiagram() {
  return (
    <svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full overflow-visible">
      {/* Connector lines with gradients */}
      <path d="M120 80 L220 80" stroke="var(--color-sage-200)" strokeWidth="2.5" strokeDasharray="5 5" />
      <path d="M280 80 L380 80" stroke="var(--color-sage-200)" strokeWidth="2.5" />
      <path d="M440 80 L540 80" stroke="var(--color-sage-200)" strokeWidth="2.5" />
      <path d="M600 80 L700 80" stroke="var(--color-sage-200)" strokeWidth="2.5" strokeDasharray="5 5" />

      {/* Nodes */}
      {/* Node 1: Upload */}
      <g>
        <circle cx="80" cy="80" r="32" fill="var(--color-surface)" stroke="var(--color-sage-200)" strokeWidth="2" />
        <path d="M74 74 L86 74 M80 68 L80 80 M72 84 H88" stroke="var(--color-sage-600)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Node 2: OCR */}
      <g>
        <circle cx="250" cy="80" r="32" fill="var(--color-surface)" stroke="var(--color-sage-200)" strokeWidth="2" />
        <path d="M242 70 H258 M242 76 H258 M242 82 H252 M242 88 H258" stroke="var(--color-sage-600)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Node 3: Embed */}
      <g>
        <circle cx="410" cy="80" r="32" fill="var(--color-surface)" stroke="var(--color-sage-600)" strokeWidth="2" />
        <path d="M398 72 L410 66 L422 72 L410 78 Z M398 80 L410 86 L422 80 M398 88 L410 94 L422 88" stroke="var(--color-sage-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Node 4: RAG */}
      <g>
        <circle cx="570" cy="80" r="32" fill="var(--color-surface)" stroke="var(--color-sage-200)" strokeWidth="2" />
        <path d="M562 72 C562 66, 578 66, 578 72 C578 78, 562 78, 562 84 M562 84 H578" stroke="var(--color-sage-600)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Node 5: Summary */}
      <g>
        <circle cx="730" cy="80" r="32" fill="var(--color-surface)" stroke="var(--color-amber-500)" strokeWidth="2" />
        <path d="M732 68 L722 80 H732 L728 92 L738 80 H728 Z" fill="var(--color-amber-500)" stroke="var(--color-amber-500)" strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      {/* Center Glow on Middle Node */}
      <circle cx="410" cy="80" r="38" stroke="var(--color-sage-400)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    </svg>
  );
}

/* ─── Clinical Advisors / Doctors Section (Inspired by Image 1) ───────── */

function AdvisorsSection() {
  const advisors = [
    {
      name: "Dr. Aarav Mehta",
      role: "Chief Medical Officer",
      credential: "AIIMS Delhi · Ex-Consultant",
      bio: "Guides clinical accuracy, co-pilot safety audits, and NLP vocabulary alignment with standard terminologies.",
      specialization: "General Medicine"
    },
    {
      name: "Dr. Priya Sharma",
      role: "Director of Clinical Informatics",
      credential: "Apollo Hospitals · Health Informatics",
      bio: "Oversees RAG safety guidelines, patient timeline vocabulary translation, and EHR data mapping architectures.",
      specialization: "Informatics & Safety"
    },
    {
      name: "Dr. Vikram Patel",
      role: "Advisor, NHA Standards",
      credential: "National Health Authority Consultant",
      bio: "Ensures ABDM interoperability compliance, data residency standards, and HL7 FHIR schema configurations.",
      specialization: "ABDM & Architecture"
    }
  ];

  return (
    <section id="advisors" className="w-full bg-surface py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Section Header */}
        <div className="text-center max-w-[620px] mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans mb-4">
            CLINICAL GOVERNANCE
          </span>
          <h2 className="font-serif text-[36px] md:text-[44px] font-semibold text-ink-900 tracking-[-0.015em] leading-tight">
            Guided by Expert Clinicians
          </h2>
          <p className="text-base text-ink-500 font-sans mt-3">
            We partner with leading healthcare professionals to ensure clinical safety, compliance, and product accuracy.
          </p>
        </div>

        {/* Doctor Grid (Inspired by Image 1) */}
        <div className="grid md:grid-cols-3 gap-8">
          {advisors.map((adv) => (
            <div key={adv.name} className="bg-surface border border-sage-100 rounded-[20px] p-6 shadow-soft flex flex-col items-center text-center">

              {/* Doctor Avatar */}
              <div className="w-24 h-24 rounded-full bg-sage-50 border border-sage-100 shadow-sm overflow-hidden flex items-end justify-center mb-6">
                <DoctorAvatar name={adv.name} />
              </div>

              <span className="text-[11px] font-semibold text-sage-600 uppercase tracking-wider mb-1 block font-sans">{adv.specialization}</span>
              <h3 className="font-serif text-xl font-semibold text-ink-900">{adv.name}</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-ink-300 mt-1 mb-4">{adv.role}</p>

              <div className="bg-canvas border border-sage-100/60 rounded-lg p-4 w-full">
                <span className="text-[10px] font-bold text-ink-500 block mb-1 uppercase tracking-wider">{adv.credential}</span>
                <p className="text-xs text-ink-700 leading-relaxed font-sans">{adv.bio}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function DoctorAvatar({ name }: { name: string }) {
  const isFemale = name.includes("Priya");
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="var(--color-sage-100)" opacity="0.6" />
      <path d="M20 90 C20 60, 80 60, 80 90 Z" fill="var(--color-sage-600)" />
      <circle cx="50" cy="42" r="20" fill="var(--color-skin-warm)" />
      {isFemale ? (
        <path d="M30 42 C30 20, 70 20, 70 42 C65 32, 35 32, 30 42 Z" fill="var(--color-sage-800)" />
      ) : (
        <path d="M30 42 C30 22, 70 22, 70 42 C65 28, 35 28, 30 42 Z" fill="var(--color-sage-900)" />
      )}
      <path d="M42 62 L50 82 L58 62 Z" fill="var(--color-surface)" />
    </svg>
  );
}

/* ─── Testimonials Section (Inspired by Image 1) ─────────────────────── */

function TestimonialsSection() {
  return (
    <section className="w-full bg-canvas py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Testimonial Panel */}
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-12 items-center">

          {/* Quote */}
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans">
              CLINICAL FEEDBACK
            </span>

            <blockquote className="pl-6 border-l-3 border-l-sage-600">
              <p className="font-serif text-2xl md:text-3xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug italic">
                &ldquo;As an oncologist, I often have to make decisions without seeing past chemotherapy cycles. MediSaar aggregates and unifies that history into a single clean summary, linked back to the original clinical reports. It&rsquo;s not just a time-saver &mdash; it&rsquo;s a clinical safety net.&rdquo;
              </p>
            </blockquote>

            <div>
              <p className="text-base font-bold text-ink-900 font-sans">Dr. Sandeep Kumar</p>
              <p className="text-xs text-ink-500 font-sans">Senior Consultant Oncologist · Tata Memorial Hospital</p>
            </div>
          </div>

          {/* Doctor Portrait Visual Placeholder */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[280px] aspect-[4/5] bg-surface border border-sage-100 rounded-[20px] p-6 shadow-soft flex items-end justify-center relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-sage-50 to-transparent pointer-events-none" />
              <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="55" r="35" fill="var(--color-sage-100)" opacity="0.4" />
                <path d="M15 120 C15 75, 85 75, 85 120 Z" fill="var(--color-sage-600)" />
                <circle cx="50" cy="45" r="22" fill="var(--color-skin-base)" />
                <path d="M28 45 C28 20, 72 20, 72 45 C65 30, 35 30, 28 45 Z" fill="var(--color-sage-800)" />
              </svg>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

/* ─── Technology Overview Table ───────────────────────────────────────── */

const TECH_STACK = [
  { layer: "Interface Layer", tech: "Next.js 16 · TypeScript · Tailwind CSS 4 · ShadCN UI" },
  { layer: "Role Security", tech: "Secure JWT · RBAC · HTTP-only cookie tokens" },
  { layer: "Data Ingestion", tech: "Intelligent OCR extraction pipeline · Google Vision" },
  { layer: "Indexing Engine", tech: "Vector storage · ABDM metadata mapping" },
  { layer: "Clinical LLM", tech: "Gemini 1.5 Pro inference · Source-cited context" },
  { layer: "Audit Trail", tech: "Mongoose · Audit logs for record accesses" }
];

function TechSection() {
  return (
    <section className="w-full bg-surface-sunk py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans mb-4">
              ARCHITECTURE OVERVIEW
            </span>
            <h2 className="font-serif text-[36px] md:text-[44px] font-semibold text-ink-900 tracking-[-0.015em] leading-tight mb-6">
              Built to Clinical & Interoperability Standards
            </h2>
            <p className="text-base text-ink-500 leading-relaxed font-sans">
              Our engineering infrastructure is architected for absolute auditability, strict data residency guidelines, and seamless connections with national digital registries.
            </p>
          </div>

          <div className="bg-surface border border-sage-100 rounded-2xl shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100">
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.04em] text-ink-300 px-6 py-4 w-2/5 font-sans">Layer</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-[0.04em] text-ink-300 px-6 py-4 font-sans">Technology</th>
                </tr>
              </thead>
              <tbody>
                {TECH_STACK.map((row) => (
                  <tr key={row.layer} className="border-b border-sage-100 last:border-0 hover:bg-sage-50/50 transition-colors duration-[140ms]">
                    <td className="px-6 py-4 font-semibold text-ink-900 font-sans">{row.layer}</td>
                    <td className="px-6 py-4 text-ink-500 font-sans">{row.tech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Impact Metrics Section ──────────────────────────────────────────── */

const METRICS = [
  { value: "60s", label: "Extraction speed", context: "From document upload to clinical co-pilot co-ordination" },
  { value: "32%", label: "Duplicate diagnostics saved", context: "Potential diagnostic savings with unified histories" },
  { value: "84Cr", label: "National ABHA IDs", context: "Ayushman Bharat digital registries ready for integration" },
  { value: "16K+", label: "Hospitals linked", context: "Clinics and diagnostic centers connected to network layers" },
];

function MetricsSection() {
  return (
    <section id="impact" className="w-full bg-canvas py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Section Header */}
        <div className="max-w-[560px] mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans mb-4">
            IMPACT METRICS
          </span>
          <h2 className="font-serif text-[36px] md:text-[44px] font-semibold text-ink-900 tracking-[-0.015em] leading-tight">
            Driving Efficiency in Healthcare Logistics
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((m) => (
            <div key={m.value} className="bg-surface rounded-xl border border-sage-100/50 shadow-soft p-8 hover:shadow-lift transition-shadow duration-[220ms]">
              <p className="font-serif text-[64px] font-semibold text-sage-600 leading-none mb-3">
                {m.value}
              </p>
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink-900 font-sans mb-2 leading-snug">
                {m.label}
              </p>
              <p className="text-xs text-ink-500 leading-relaxed font-sans">{m.context}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─── Future Vision Section ───────────────────────────────────────────── */

const VISION_STAGES = [
  { stage: "01", title: "Record Consolidation", desc: "Unified patient histories. Every clinical event and discharge file on one secure timeline." },
  { stage: "02", title: "AI Clinical Co-Pilot", desc: "Automated summaries, drug contraindication alerts, and co-pilot co-ordination metrics." },
  { stage: "03", title: "Federated Health Layer", desc: "Connecting hospitals nationwide with secure, auditable, ABDM-linked health infrastructure." },
];

function VisionSection() {
  return (
    <section className="w-full bg-surface py-24 border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-start">

          {/* Left Blockquote */}
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-sage-50 border border-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-[0.06em] font-sans">
              OUR MISSION
            </span>
            <blockquote className="pl-5 border-l-2 border-sage-800">
              <p className="font-serif text-2xl md:text-3xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug italic">
                &ldquo;India built the digital highway to 84 crore health IDs. We&rsquo;re building the vehicles that run on it.&rdquo;
              </p>
            </blockquote>
            <p className="text-xs text-ink-500 leading-relaxed font-sans max-w-[500px]">
              Ayushman Bharat created the pipeline registries. MediSaar fills them with actionable clinical intelligence &mdash; ensuring each patient ID presents doctors with an immediate, verified, and complete medical history.
            </p>
          </div>

          {/* Right Stage Cards */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-ink-900 tracking-[-0.01em] mb-4">
              Building the Future of Digital Health
            </h3>
            {VISION_STAGES.map((s, i) => (
              <div
                key={s.stage}
                className="bg-surface border border-sage-100/60 rounded-xl shadow-soft p-5 flex items-start gap-4 hover:shadow-lift transition-shadow duration-[220ms] animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="font-serif text-2xl font-semibold text-sage-600 tracking-[-0.02em] shrink-0 leading-none mt-0.5">
                  {s.stage}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-ink-900 mb-1 font-sans">{s.title}</h4>
                  <p className="text-xs text-ink-500 leading-relaxed font-sans">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Call To Action Section (Inspired by Image 1 Gradient Card) ──────── */

function CTASection() {
  return (
    <section className="w-full bg-canvas py-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">

        {/* Sage green gradient panel with rounded edges */}
        <div className="bg-gradient-to-r from-sage-800 to-sage-600 rounded-[28px] p-12 md:p-20 text-center shadow-soft relative overflow-hidden">

          {/* Subtle lighting overlay */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-[720px] mx-auto space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold uppercase tracking-[0.06em] font-sans">
              GET STARTED TODAY
            </span>

            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-white tracking-[-0.02em] leading-tight">
              Bring clinical intelligence to the next level of care.
            </h2>

            <p className="text-xs md:text-sm text-white/80 leading-relaxed font-sans max-w-[480px] mx-auto">
              Access the clinical sandbox or speak with our implementation team to deploy MediSaar in your department.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button className="bg-canvas hover:bg-sage-50 text-sage-900 rounded-sm h-12 px-8 text-sm font-semibold transition-colors duration-[220ms] w-full sm:w-auto">
                  Try the Demo
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button variant="outline" className="rounded-sm h-12 px-8 text-sm font-semibold border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-colors duration-[220ms] w-full sm:w-auto">
                  Talk to us
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="w-full bg-canvas border-t border-sage-100 py-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-serif text-lg font-bold text-sage-800 tracking-[-0.02em]">
          MediSaar
        </span>
        <p className="text-xs text-ink-300 text-center font-sans">
          &copy; 2026 MediSaar. Clinical intelligence for India&rsquo;s health network.
        </p>
        <nav className="flex gap-6" aria-label="Footer navigation">
          <Link className="text-xs text-ink-300 hover:text-ink-700 transition-colors duration-[140ms] font-sans font-medium" href="/privacy">Privacy</Link>
          <Link className="text-xs text-ink-300 hover:text-ink-700 transition-colors duration-[140ms] font-sans font-medium" href="/terms">Terms</Link>
          <Link className="text-xs text-ink-300 hover:text-ink-700 transition-colors duration-[140ms] font-sans font-medium" href="#contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

/* ─── Page Assembly ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <Nav />
      <main>
        <HeroSection />
        <IntegrationsBar />
        <ProblemSection />
        <WorkspacesSection />
        <WorkflowSection />
        <AdvisorsSection />
        <TestimonialsSection />
        <TechSection />
        <MetricsSection />
        <VisionSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
