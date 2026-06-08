import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ActivitySquare, Shield, Clock, Brain, Building } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b bg-card shadow-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <ActivitySquare className="h-8 w-8 text-accent" />
          <span className="font-bold text-2xl text-primary tracking-tight">MediSaar</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#roles">For Whom</Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">How It Works</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-primary border border-accent/20 mb-8">
              Welcome to the future of healthcare
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto text-foreground">
              Turning Medical History into <span className="text-primary">Meaningful Insights.</span>
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto mb-10 leading-relaxed">
              A unified, AI-powered healthcare network connecting patients, doctors, and institutions. Secure, seamless, and smart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-card border-y border-border">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">Everything you need, in one place</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Experience a healthcare ecosystem designed for clarity, efficiency, and intelligence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Unified Records", desc: "All your medical history securely stored in one accessible location." },
                { icon: Brain, title: "AI Clinical Summaries", desc: "Instant, intelligent insights derived from complex medical data." },
                { icon: Clock, title: "Patient Timeline", desc: "Visualize your entire health journey chronologically." },
                { icon: Building, title: "Multi-Institution Network", desc: "Seamless data sharing across different hospitals and clinics." },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-14 w-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
                    <f.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="w-full py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">Built for the entire ecosystem</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">MediSaar adapts to your role, providing the tools you need to succeed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { role: "Individuals", desc: "Own your health data. Track your timeline, manage reports, and share access securely.", btn: "Patient Portal" },
                { role: "Doctors", desc: "Access comprehensive patient histories, generate AI insights, and make informed decisions faster.", btn: "Doctor Portal" },
                { role: "Institutions", desc: "Manage patient flows, upload reports, and coordinate care across your entire facility.", btn: "Institution Portal" },
              ].map((r, i) => (
                <div key={i} className="flex flex-col p-8 bg-card rounded-2xl border border-border shadow-sm">
                  <h3 className="text-2xl font-bold mb-4">{r.role}</h3>
                  <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{r.desc}</p>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full justify-between group">
                      {r.btn}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 bg-muted border-t border-border">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ActivitySquare className="h-5 w-5 text-accent" />
            <span className="font-semibold text-primary">MediSaar</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 MediSaar Inc. All rights reserved. MVP Demo.
          </p>
        </div>
      </footer>
    </div>
  );
}
