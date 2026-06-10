"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileSearch,
  Brain,
  Shield,
  Clock,
  Building2,
  Upload,
  Layers,
  Zap,
  ChevronRight,
} from "lucide-react";

/* ─── Nav ─────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-canvas/90 backdrop-blur-sm border-b border-sage-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-semibold text-ink-900 tracking-[-0.02em]">
            MediSaar
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#problem">Problem</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#how-it-works">How it works</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#features">Features</Link>
          <Link className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors duration-[140ms]" href="#impact">Impact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-ink-700 hover:text-ink-900 hover:bg-sage-50">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-sage-600 hover:bg-sage-800 text-surface rounded-sm px-4 transition-colors duration-[220ms]">
              Try the demo
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="w-full bg-canvas pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">

          {/* Left: editorial content */}
          <div className="max-w-[600px]">
            <p className="animate-fade-in text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-6">
              MediSaar · Clinical Intelligence Layer
            </p>

            <h1 className="animate-fade-up font-serif text-5xl md:text-6xl lg:text-[4.5rem] font-semibold text-ink-900 tracking-[-0.02em] leading-[1.08] mb-6">
              Years of scattered records.{" "}
              <span className="italic text-sage-600">One clinical truth.</span>{" "}
              In 60 seconds.
            </h1>

            <p className="animate-fade-up delay-100 text-lg text-ink-500 leading-relaxed mb-10 max-w-[480px]">
              MediSaar unifies a patient&rsquo;s entire medical history across every hospital and clinic, then distils it into a single AI-generated clinical summary.
            </p>

            <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/signup">
                <Button className="bg-sage-600 hover:bg-sage-800 text-surface rounded-sm h-11 px-6 text-sm font-medium transition-colors duration-[220ms] w-full sm:w-auto">
                  Try the demo
                  <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link href="#contact">
                <Button variant="outline" className="rounded-sm h-11 px-6 text-sm font-medium border-sage-200 text-ink-700 hover:bg-sage-50 hover:border-sage-400 transition-colors duration-[220ms] w-full sm:w-auto">
                  For hospitals
                </Button>
              </Link>
            </div>

            {/* Stat chip */}
            <div className="animate-fade-up delay-300 inline-flex items-center gap-2.5 bg-surface border border-sage-100 rounded-sm px-4 py-2.5 shadow-soft">
              <span className="font-serif text-lg font-semibold text-ink-900 tracking-[-0.02em]">32%</span>
              <span className="text-xs text-ink-500 leading-tight max-w-[200px]">of transferred patients receive a duplicate test due to missing records</span>
            </div>
          </div>

          {/* Right: illustration frame */}
          <div className="animate-slide-right hidden lg:block">
            <div className="bg-sage-50 rounded-xl p-8 aspect-[4/5] relative overflow-hidden flex items-center justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 320 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[280px]"
      aria-label="Doctor reviewing patient records on a tablet"
      role="img"
    >
      {/* Background warm circle */}
      <circle cx="160" cy="200" r="140" fill="#DCE8DC" opacity="0.5" />

      {/* Doctor figure — simplified flat vector */}
      {/* Torso */}
      <rect x="120" y="200" width="80" height="90" rx="12" fill="#4F7A55" />
      {/* Head */}
      <circle cx="160" cy="175" r="30" fill="#F4C5A0" />
      {/* Hair */}
      <ellipse cx="160" cy="152" rx="28" ry="14" fill="#2E5D3F" />
      {/* Collar / coat */}
      <rect x="128" y="200" width="64" height="12" rx="4" fill="#EEF3EC" />
      {/* White coat lapels */}
      <path d="M140 200 L128 230 L148 230 Z" fill="#FFFCF5" />
      <path d="M180 200 L192 230 L172 230 Z" fill="#FFFCF5" />

      {/* Tablet in hand */}
      <rect x="130" y="240" width="60" height="44" rx="6" fill="#FFFCF5" stroke="#B8D0B9" strokeWidth="1.5" />
      {/* Tablet screen content — mini record lines */}
      <rect x="136" y="247" width="30" height="2.5" rx="1" fill="#B8D0B9" />
      <rect x="136" y="253" width="44" height="2.5" rx="1" fill="#B8D0B9" />
      <rect x="136" y="259" width="38" height="2.5" rx="1" fill="#B8D0B9" />
      <rect x="136" y="265" width="44" height="2.5" rx="1" fill="#DCE8DC" />
      {/* AI indicator dot — amber */}
      <circle cx="180" cy="249" r="3" fill="#E0902C" />

      {/* Patient figure — seated, smaller, right side */}
      {/* Chair */}
      <rect x="228" y="310" width="50" height="6" rx="2" fill="#B8D0B9" />
      <rect x="230" y="316" width="4" height="30" rx="2" fill="#B8D0B9" />
      <rect x="274" y="316" width="4" height="30" rx="2" fill="#B8D0B9" />
      {/* Seated patient body */}
      <rect x="234" y="266" width="44" height="46" rx="10" fill="#E8C9A0" opacity="0.8" />
      {/* Patient head */}
      <circle cx="256" cy="248" r="20" fill="#F4C5A0" />
      {/* Patient hair — grey, older patient */}
      <ellipse cx="256" cy="233" rx="18" ry="10" fill="#97A6A2" />
      {/* Smile line — gentle */}
      <path d="M249 254 Q256 259 263 254" stroke="#C49A78" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Floating record pills */}
      <rect x="28" y="130" width="72" height="22" rx="11" fill="#FFFCF5" stroke="#B8D0B9" strokeWidth="1" />
      <circle cx="42" cy="141" r="5" fill="#4F7A55" />
      <rect x="51" y="137" width="42" height="3" rx="1.5" fill="#DCE8DC" />
      <rect x="51" y="143" width="30" height="2" rx="1" fill="#EEF3EC" />

      <rect x="220" y="100" width="80" height="22" rx="11" fill="#FFFCF5" stroke="#B8D0B9" strokeWidth="1" />
      <circle cx="234" cy="111" r="5" fill="#E0902C" />
      <rect x="243" y="107" width="50" height="3" rx="1.5" fill="#FBF0DC" />
      <rect x="243" y="113" width="38" height="2" rx="1" fill="#FBF0DC" />

      <rect x="34" y="320" width="68" height="22" rx="11" fill="#FFFCF5" stroke="#B8D0B9" strokeWidth="1" />
      <circle cx="48" cy="331" r="5" fill="#4A7A8F" />
      <rect x="57" y="327" width="38" height="3" rx="1.5" fill="#DCE8DC" />
      <rect x="57" y="333" width="28" height="2" rx="1" fill="#EEF3EC" />

      {/* Connecting dashed line from pills to tablet */}
      <line x1="100" y1="141" x2="130" y2="260" stroke="#B8D0B9" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="220" y1="111" x2="190" y2="250" stroke="#FBF0DC" strokeWidth="1" strokeDasharray="4 3" />
    </svg>
  );
}

/* ─── Problem: Mr. Sharma ─────────────────────────────────────────────── */

function ProblemSection() {
  return (
    <section id="problem" className="w-full bg-surface-sunk py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left: editorial prose */}
          <div className="max-w-[520px]">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
              The problem
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug mb-6">
              Meet Mr. Sharma. 58, diabetic, four hospitals in six years.
            </h2>

            <p className="text-base text-ink-700 leading-relaxed mb-5">
              Every visit, Mr. Sharma arrives with a folder of paper reports, half of which he has lost. His new doctor has no idea what the last cardiologist prescribed, or that he was discharged from a different hospital last autumn with a red flag on his kidneys.
            </p>

            <p className="text-base text-ink-700 leading-relaxed mb-8">
              His care is fragmented not because doctors don&rsquo;t care, but because the records never arrived. India has 1.4 billion patients like him. The problem isn&rsquo;t clinical — it&rsquo;s informational.
            </p>

            {/* Pull-quote callouts */}
            <div className="space-y-4">
              {[
                { label: "Fragmented", desc: "Spread across hospitals with no shared standard" },
                { label: "Unreadable", desc: "Handwritten, scanned, or locked in proprietary systems" },
                { label: "Repeated", desc: "The same test ordered three times because history is invisible" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="pl-4 border-l border-sage-800 animate-fade-in"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                  <p className="text-sm text-ink-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div className="flex items-start justify-center lg:justify-end">
            <div className="w-full max-w-[420px] aspect-square bg-canvas rounded-xl p-8 shadow-soft flex items-center justify-center">
              <SharmaIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SharmaIllustration() {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-label="Elderly patient surrounded by scattered medical records"
      role="img"
    >
      {/* Scattered paper stacks */}
      {[
        { x: 20, y: 220, w: 70, h: 90, r: "#FBF7F0", angle: -8 },
        { x: 50, y: 200, w: 70, h: 95, r: "#FFFCF5", angle: -3 },
        { x: 80, y: 195, w: 70, h: 100, r: "#F4EFE4", angle: 5 },
        { x: 200, y: 215, w: 70, h: 88, r: "#FBF7F0", angle: 6 },
        { x: 225, y: 200, w: 70, h: 92, r: "#FFFCF5", angle: -4 },
        { x: 250, y: 195, w: 70, h: 98, r: "#F4EFE4", angle: 10 },
      ].map((p, i) => (
        <g key={i} transform={`rotate(${p.angle}, ${p.x + p.w / 2}, ${p.y + p.h / 2})`}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="4" fill={p.r} stroke="#DCE8DC" strokeWidth="1" />
          <rect x={p.x + 8} y={p.y + 12} width={p.w - 16} height="2.5" rx="1" fill="#B8D0B9" />
          <rect x={p.x + 8} y={p.y + 18} width={p.w - 22} height="2.5" rx="1" fill="#DCE8DC" />
          <rect x={p.x + 8} y={p.y + 24} width={p.w - 18} height="2.5" rx="1" fill="#EEF3EC" />
        </g>
      ))}

      {/* Mr. Sharma — seated center */}
      <circle cx="160" cy="180" r="28" fill="#F4C5A0" />
      <ellipse cx="160" cy="160" rx="25" ry="13" fill="#97A6A2" />
      <rect x="128" y="205" width="64" height="70" rx="14" fill="#5E726E" opacity="0.7" />
      {/* Collar */}
      <rect x="136" y="205" width="48" height="10" rx="4" fill="#97A6A2" opacity="0.5" />
      {/* Worry lines — small strokes above brow */}
      <line x1="148" y1="173" x2="156" y2="173" stroke="#C49A78" strokeWidth="1" strokeLinecap="round" />
      <line x1="164" y1="173" x2="172" y2="173" stroke="#C49A78" strokeWidth="1" strokeLinecap="round" />
      {/* Glasses */}
      <circle cx="151" cy="182" r="8" stroke="#2F4944" strokeWidth="1.5" fill="none" />
      <circle cx="169" cy="182" r="8" stroke="#2F4944" strokeWidth="1.5" fill="none" />
      <line x1="159" y1="182" x2="161" y2="182" stroke="#2F4944" strokeWidth="1.5" />
      <line x1="143" y1="182" x2="138" y2="180" stroke="#2F4944" strokeWidth="1.5" />
      <line x1="177" y1="182" x2="182" y2="180" stroke="#2F4944" strokeWidth="1.5" />

      {/* Folder in hand */}
      <rect x="138" y="248" width="44" height="32" rx="4" fill="#E0902C" opacity="0.3" />
      <rect x="138" y="244" width="24" height="6" rx="2" fill="#E0902C" opacity="0.4" />
      <rect x="144" y="254" width="32" height="2" rx="1" fill="#A86615" opacity="0.4" />
      <rect x="144" y="260" width="28" height="2" rx="1" fill="#A86615" opacity="0.4" />

      {/* Question mark above head — sense of confusion */}
      <text x="175" y="145" fontFamily="Georgia, serif" fontSize="22" fill="#97A6A2" opacity="0.6" fontWeight="600">?</text>
    </svg>
  );
}

/* ─── Why fragmented records matter — 2×2 editorial cards ─────────────── */

const WHY_CARDS = [
  {
    title: "Patient Safety",
    body: "A doctor without the full picture orders the wrong dose, misses a contraindication, or repeats a procedure that already failed. Incomplete records are a clinical risk.",
  },
  {
    title: "Emergency Blind Spots",
    body: "An unconscious patient arrives at A&E. The team has no record of allergies, no medication list, no chronic conditions. Every second spent guessing is a second not spent treating.",
  },
  {
    title: "Financial Burden",
    body: "Duplicate diagnostics cost India's healthcare system thousands of crores annually. Patients pay out-of-pocket for tests they already had. The waste is invisible only because the fragmentation is the norm.",
  },
  {
    title: "National Opportunity",
    body: "84 crore Indians have an ABHA health ID but no unified record behind it. The infrastructure for a national health layer already exists. The intelligence layer does not — yet.",
    highlight: true,
    metric: "84Cr",
    metricLabel: "ABHA health IDs",
  },
];

function WhySection() {
  return (
    <section className="w-full bg-canvas py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="max-w-[560px] mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
            Why it matters
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug">
            Fragmented records are not an inconvenience. They are a clinical hazard.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {WHY_CARDS.map((card, i) => (
            <div
              key={card.title}
              className={`rounded-lg p-8 shadow-soft animate-fade-in ${
                card.highlight ? "bg-sage-50" : "bg-surface"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {card.metric && (
                <p className="font-serif text-5xl font-semibold text-sage-800 tracking-[-0.02em] mb-3">
                  {card.metric}
                  <span className="text-sm font-sans font-medium text-ink-500 ml-2 tracking-normal">
                    {card.metricLabel}
                  </span>
                </p>
              )}
              <h3 className="font-serif text-xl font-semibold text-ink-900 tracking-[-0.01em] mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How MediSaar works — 5-step ribbon ──────────────────────────────── */

const HOW_STEPS = [
  { n: "01", icon: Upload, label: "Upload", desc: "Doctor or receptionist uploads any document: discharge summary, prescription, lab report, scan." },
  { n: "02", icon: FileSearch, label: "OCR", desc: "Our OCR pipeline extracts structured text from images, PDFs, and handwritten notes at high confidence." },
  { n: "03", icon: Layers, label: "Embed", desc: "Extracted text is chunked and embedded into a vector store, indexed against the patient's ABHA ID." },
  { n: "04", icon: Brain, label: "RAG", desc: "When a doctor queries the record, a retrieval-augmented generation pipeline pulls the most relevant chunks." },
  { n: "05", icon: Zap, label: "Summarise", desc: "A clinical LLM synthesises the retrieved chunks into a human-readable, source-cited summary in under 60 seconds." },
];

function HowSection() {
  return (
    <section id="how-it-works" className="w-full bg-surface-sunk py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="max-w-[560px] mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
            How it works
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug">
            Five steps from scattered paper to clinical truth.
          </h2>
        </div>

        {/* Desktop: horizontal ribbon */}
        <div className="hidden lg:flex items-start gap-0 relative">
          {/* Connecting line */}
          <div className="absolute top-7 left-8 right-8 h-px bg-sage-200" aria-hidden />

          {HOW_STEPS.map((step, i) => (
            <div key={step.n} className="flex-1 relative flex flex-col items-center text-center px-4">
              {/* Circle */}
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-sage-200 flex items-center justify-center shadow-soft relative z-10 mb-5">
                <step.icon className="w-5 h-5 text-sage-600" strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-1">{step.n}</p>
              <p className="text-sm font-semibold text-ink-900 mb-2">{step.label}</p>
              <p className="text-xs text-ink-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack */}
        <div className="flex lg:hidden flex-col gap-0 relative">
          <div className="absolute top-7 bottom-7 left-7 w-px bg-sage-200" aria-hidden />
          {HOW_STEPS.map((step) => (
            <div key={step.n} className="flex gap-6 pb-8 last:pb-0 relative">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-sage-200 flex items-center justify-center shadow-soft flex-shrink-0 relative z-10">
                <step.icon className="w-5 h-5 text-sage-600" strokeWidth={1.5} />
              </div>
              <div className="pt-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-1">{step.n} · {step.label}</p>
                <p className="text-sm text-ink-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Clinical intelligence features ─────────────────────────────────── */

function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-canvas py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="max-w-[560px] mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
            Clinical intelligence
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug">
            The AI lives inside artifacts. Not a chat window.
          </h2>
        </div>

        {/* Asymmetric grid: 2/3 + 1/3 */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">

          {/* Main feature: AI Summary */}
          <div className="bg-surface rounded-lg shadow-soft p-8 lg:p-10">
            <div className="flex items-start justify-between mb-6">
              <h3 className="font-serif text-2xl font-semibold text-ink-900 tracking-[-0.01em]">
                AI Clinical Summary
              </h3>
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-amber-500 ml-4 flex-shrink-0">
                AI · Live
              </span>
            </div>

            {/* Simulated typing demo */}
            <div className="bg-canvas rounded-md p-5 border border-sage-100">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-3">
                Mr. Sharma, 58 — Summary
              </p>
              <p className="text-sm text-ink-700 leading-relaxed">
                Patient presents with a 6-year history of{" "}
                <span className="font-medium text-ink-900">Type 2 Diabetes Mellitus</span>,
                currently managed on Metformin 500mg twice daily. Most recent HbA1c (March 2025,
                AIIMS Delhi) was 8.2% — above target. Cardiologist note from Apollo (Jan 2025) flags
                early-stage{" "}
                <span className="font-medium text-ink-900">hypertensive nephropathy</span>; ACE
                inhibitor recommended but not yet initiated. No known drug allergies.
                <span
                  className="inline-block w-px h-4 bg-amber-500 ml-0.5 align-text-bottom animate-amber-blink"
                  aria-hidden
                />
              </p>
            </div>

            <div className="mt-4 flex gap-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300">
                Based on 14 source records · 3 hospitals
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: "Time to summary", value: "58s" },
                { label: "Records analysed", value: "14" },
              ].map((m) => (
                <div key={m.label} className="bg-sage-50 rounded-sm px-4 py-3">
                  <p className="font-serif text-2xl font-semibold text-sage-800 tracking-[-0.02em]">{m.value}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-500 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Three smaller feature cards */}
          <div className="flex flex-col gap-6">
            {[
              {
                icon: Clock,
                title: "Patient Timeline",
                desc: "A chronological feed of every clinical event, grouped by year, with hospital and document source linked.",
              },
              {
                icon: Shield,
                title: "Emergency Mode",
                desc: "One tap surfaces allergies, medications, and conditions in a single printable card. Built for 5-second reads.",
              },
              {
                icon: Building2,
                title: "Source Traceability",
                desc: "Every AI claim is linked back to the source document and the exact passage it was derived from.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-surface rounded-lg shadow-soft p-6 flex gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-sm bg-sage-50 flex-shrink-0">
                  <f.icon className="w-4 h-4 text-sage-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink-900 mb-1">{f.title}</h4>
                  <p className="text-xs text-ink-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Technology overview ─────────────────────────────────────────────── */

const TECH_STACK = [
  { layer: "Frontend",       tech: "Next.js 15 · TypeScript · Tailwind · ShadCN UI" },
  { layer: "Auth",           tech: "Clerk · JWT · RBAC by role" },
  { layer: "Backend API",    tech: "Express.js · Node.js · Zod validation" },
  { layer: "Database",       tech: "MongoDB Atlas · Mongoose" },
  { layer: "OCR pipeline",   tech: "FastAPI · Tesseract · Google Vision" },
  { layer: "AI inference",   tech: "Gemini 1.5 Pro · RAG with ChromaDB" },
  { layer: "File storage",   tech: "Cloudinary · signed uploads" },
  { layer: "Infrastructure", tech: "Vercel (web) · Railway (AI service) · ABHA-ready" },
];

function TechSection() {
  return (
    <section className="w-full bg-surface-sunk py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20 items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
              Architecture
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug mb-6">
              Built to clinical standards from the first line.
            </h2>
            <p className="text-base text-ink-500 leading-relaxed">
              Every layer chosen for auditability, data residency compliance, and the ability to integrate with India&rsquo;s National Health Authority infrastructure.
            </p>
          </div>

          <div className="bg-surface rounded-lg shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100">
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 px-6 py-4 w-2/5">Layer</th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 px-6 py-4">Technology</th>
                </tr>
              </thead>
              <tbody>
                {TECH_STACK.map((row, i) => (
                  <tr key={row.layer} className="border-b border-sage-100 last:border-0 hover:bg-sage-50 transition-colors duration-[140ms]">
                    <td className="px-6 py-3.5 font-medium text-ink-900">{row.layer}</td>
                    <td className="px-6 py-3.5 text-ink-500">{row.tech}</td>
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

/* ─── Impact metrics ─────────────────────────────────────────────────── */

const METRICS = [
  { value: "60s",  label: "Time to clinical summary",  context: "From upload to AI-generated insight" },
  { value: "32%",  label: "Duplicate tests prevented", context: "Of transferred patients receive repeat diagnostics" },
  { value: "84Cr", label: "ABHA health IDs in India",  context: "The infrastructure waiting for an intelligence layer" },
  { value: "16K+", label: "Hospitals addressable",     context: "Public and private facilities in the NHA network" },
];

function MetricsSection() {
  return (
    <section id="impact" className="w-full bg-canvas py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="max-w-[480px] mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
            Impact
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug">
            The numbers that made us build this.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {METRICS.map((m) => (
            <div key={m.value} className="bg-surface rounded-lg shadow-soft p-6">
              <p className="font-serif text-4xl md:text-5xl font-semibold text-ink-900 tracking-[-0.02em] leading-none mb-2">
                {m.value}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-500 mb-2 leading-tight">
                {m.label}
              </p>
              <p className="text-xs text-ink-300 leading-relaxed">{m.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Vision ──────────────────────────────────────────────────────────── */

const VISION_STAGES = [
  { stage: "01", title: "Record-Keeper", desc: "Unified patient history. Every record, every hospital, one timeline." },
  { stage: "02", title: "Clinical Co-Pilot", desc: "AI summaries, drug interaction alerts, and clinical decision support built on complete data." },
  { stage: "03", title: "National Infrastructure", desc: "A federated intelligence layer across India's entire health network, plugged into ABDM." },
];

function VisionSection() {
  return (
    <section className="w-full bg-surface-sunk py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-14 lg:gap-20 items-start">

          {/* Left: blockquote */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-6">
              The vision
            </p>
            <blockquote className="pl-5 border-l-2 border-sage-800 mb-8">
              <p className="font-serif text-2xl md:text-3xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug italic">
                &ldquo;India built the highway to 84 crore health IDs. We&rsquo;re building the vehicles that run on it.&rdquo;
              </p>
            </blockquote>
            <p className="text-base text-ink-500 leading-relaxed">
              The Ayushman Bharat Digital Mission created the pipes. MediSaar fills them with clinical intelligence — so every ID tells the doctor not just who the patient is, but what their body has been through.
            </p>
          </div>

          {/* Right: stage cards */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-2xl font-semibold text-ink-900 tracking-[-0.01em] mb-2">
              From record-keeper to national health infrastructure.
            </h3>
            {VISION_STAGES.map((s, i) => (
              <div
                key={s.stage}
                className="bg-surface rounded-md shadow-soft p-5 flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="font-serif text-2xl font-semibold text-ink-300 tracking-[-0.02em] flex-shrink-0 leading-none mt-0.5">
                  {s.stage}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900 mb-1">{s.title}</p>
                  <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Roles — who uses MediSaar ──────────────────────────────────────── */

const ROLES = [
  {
    role: "Doctors",
    headline: "The full picture before the patient sits down.",
    points: ["AI summary of complete history", "Emergency mode — one tap", "Source-linked citations"],
    cta: "Doctor portal",
    href: "/signup?role=doctor",
  },
  {
    role: "Patients",
    headline: "Your health, in human language.",
    points: ["Timeline of every clinical event", "Active medications + next appointment", "Consent-based sharing with any doctor"],
    cta: "Patient portal",
    href: "/signup?role=patient",
  },
  {
    role: "Institutions",
    headline: "Upload once. Intelligence forever.",
    points: ["Drag-and-drop upload queue", "OCR with confidence scoring", "Audit log for every record"],
    cta: "Institution portal",
    href: "/signup?role=institution",
  },
];

function RolesSection() {
  return (
    <section className="w-full bg-canvas py-24 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="max-w-[560px] mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-4">
            Built for everyone
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink-900 tracking-[-0.015em] leading-snug">
            One platform. Three distinct workflows.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ROLES.map((r) => (
            <div key={r.role} className="bg-surface rounded-lg shadow-soft p-8 flex flex-col">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-3">{r.role}</p>
              <h3 className="font-serif text-xl font-semibold text-ink-900 tracking-[-0.01em] leading-snug mb-5">{r.headline}</h3>
              <ul className="space-y-2.5 mb-8 flex-1">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-ink-500">
                    <span className="w-1 h-1 rounded-full bg-sage-400 flex-shrink-0 mt-2" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={r.href}>
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-sm border-sage-200 text-ink-700 hover:bg-sage-50 hover:border-sage-400 transition-colors duration-[220ms]"
                >
                  {r.cta}
                  <ChevronRight className="w-4 h-4 text-ink-300" strokeWidth={1.5} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="w-full bg-sage-50 py-36 md:py-44">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 mb-6">
          Ready when you are
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-ink-900 tracking-[-0.02em] leading-tight mb-8 max-w-[720px] mx-auto">
          Ready to see what 60 seconds looks like?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button className="bg-sage-600 hover:bg-sage-800 text-surface rounded-sm h-11 px-8 text-sm font-medium transition-colors duration-[220ms] w-full sm:w-auto">
              Try the demo
              <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={1.5} />
            </Button>
          </Link>
          <Link href="#contact">
            <Button variant="outline" className="rounded-sm h-11 px-8 text-sm font-medium border-sage-800 text-ink-700 hover:bg-sage-100 transition-colors duration-[220ms] w-full sm:w-auto">
              Talk to us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="w-full bg-canvas border-t border-sage-100 py-10">
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-serif text-base font-semibold text-ink-900 tracking-[-0.02em]">
          MediSaar
        </span>
        <p className="text-xs text-ink-300 text-center">
          &copy; 2026 MediSaar. Clinical intelligence for India&rsquo;s health network.
        </p>
        <nav className="flex gap-6" aria-label="Footer navigation">
          <Link className="text-xs text-ink-300 hover:text-ink-700 transition-colors duration-[140ms]" href="/privacy">Privacy</Link>
          <Link className="text-xs text-ink-300 hover:text-ink-700 transition-colors duration-[140ms]" href="/terms">Terms</Link>
          <Link className="text-xs text-ink-300 hover:text-ink-700 transition-colors duration-[140ms]" href="#contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

/* ─── Page assembly ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main>
        <HeroSection />
        <ProblemSection />
        <WhySection />
        <HowSection />
        <FeaturesSection />
        <TechSection />
        <MetricsSection />
        <VisionSection />
        <RolesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
