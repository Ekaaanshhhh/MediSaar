'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, User, Stethoscope, Building, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type RoleType = 'INDIVIDUAL' | 'DOCTOR' | 'INSTITUTION' | null;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleType>(null);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'INDIVIDUAL') { login('ind-1'); router.push('/individual'); }
    if (role === 'DOCTOR') { login('doc-1'); router.push('/doctor'); }
    if (role === 'INSTITUTION') { login('inst-1'); router.push('/institution'); }
  };

  const roles = [
    { id: 'INDIVIDUAL', title: 'Individual', desc: 'Access and manage your complete medical history', icon: User, color: 'text-primary' },
    { id: 'DOCTOR', title: 'Doctor', desc: 'View patient records and generate clinical summaries', icon: Stethoscope, color: 'text-accent' },
    { id: 'INSTITUTION', title: 'Institution', desc: 'Manage patients, doctors, reports, and admissions', icon: Building, color: 'text-muted-foreground' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Link className="flex items-center gap-2" href="/">
            <ActivitySquare className="h-8 w-8 text-accent" />
            <span className="font-bold text-2xl text-primary tracking-tight">MediSaar</span>
          </Link>
        </div>
        <Card className="border-border shadow-md">
          {step === 1 ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription>Select your role to get started</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:border-primary hover:bg-primary/5",
                      role === r.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                    )}
                    onClick={() => setRole(r.id as RoleType)}
                  >
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <r.icon className={cn("h-6 w-6", r.color)} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{r.title}</h4>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  className="w-full mt-4 bg-primary hover:bg-primary/90 h-12 text-base" 
                  disabled={!role}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <Button variant="ghost" size="icon" className="mb-2 -ml-2" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-2xl font-bold">Complete your profile</CardTitle>
                <CardDescription>Enter your details to create a {role?.toLowerCase()} account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  {role === 'INDIVIDUAL' && (
                    <>
                      <div className="space-y-2"><Label>Full Name</Label><Input required placeholder="John Doe" /></div>
                      <div className="space-y-2"><Label>Email</Label><Input required type="email" placeholder="john@example.com" /></div>
                      <div className="space-y-2"><Label>Phone</Label><Input required placeholder="+1 555-0101" /></div>
                    </>
                  )}
                  {role === 'DOCTOR' && (
                    <>
                      <div className="space-y-2"><Label>Full Name</Label><Input required placeholder="Dr. Sarah Smith" /></div>
                      <div className="space-y-2"><Label>Email</Label><Input required type="email" placeholder="dr.smith@example.com" /></div>
                      <div className="space-y-2"><Label>Specialization</Label><Input required placeholder="Cardiologist" /></div>
                    </>
                  )}
                  {role === 'INSTITUTION' && (
                    <>
                      <div className="space-y-2"><Label>Institution Name</Label><Input required placeholder="City General Hospital" /></div>
                      <div className="space-y-2"><Label>Institution Type</Label><Input required placeholder="Hospital, Clinic, Lab..." /></div>
                      <div className="space-y-2"><Label>Email</Label><Input required type="email" placeholder="admin@hospital.com" /></div>
                    </>
                  )}
                  <div className="space-y-2"><Label>Password</Label><Input required type="password" /></div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4">Create Account</Button>
                </form>
              </CardContent>
            </>
          )}
          <CardFooter className="justify-center border-t p-4">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
