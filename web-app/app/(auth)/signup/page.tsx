'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Stethoscope, Building, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type RoleType = 'INDIVIDUAL' | 'DOCTOR' | 'INSTITUTION' | null;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup({ name, email, password, role });
    
    if (result.success && result.role) {
      if (result.role === 'INDIVIDUAL') router.push('/individual');
      else if (result.role === 'DOCTOR') router.push('/doctor');
      else if (result.role === 'INSTITUTION') router.push('/institution');
      else router.push('/');
    } else {
      setError(result.message || 'Failed to sign up');
      setLoading(false);
    }
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
          <Link href="/" className="font-serif font-bold text-[22px] text-sage-800 tracking-tight">
            MediSaar
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
                  {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">{error}</div>}
                  
                  <div className="space-y-2">
                    <Label>{role === 'INSTITUTION' ? 'Institution Name' : 'Full Name'}</Label>
                    <Input required placeholder={role === 'INSTITUTION' ? "City Hospital" : "John Doe"} value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input required type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input required type="password" placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
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
