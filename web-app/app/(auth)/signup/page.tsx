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
    <div className="min-h-screen flex items-center justify-center bg-[#EEF3EC] p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
          <Link href="/" className="font-serif font-bold text-[22px] text-[#1F3F2C] tracking-tight">
            MediSaar
          </Link>
        </div>
        <Card className="border-[#DCE8DC] bg-[#F7FAF7] shadow-soft rounded-[14px]">
          {step === 1 ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-serif text-[#1F3F2C]">Create an account</CardTitle>
                <CardDescription className="font-sans text-[#5E726E]">Select your role to get started</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-[14px] cursor-pointer transition-all hover:border-[#2E5D3F] hover:bg-[#EEF3EC]",
                      role === r.id ? "border-[#2E5D3F] bg-[#EEF3EC] ring-1 ring-[#2E5D3F]" : "border-[#DCE8DC] bg-[#F7FAF7]"
                    )}
                    onClick={() => setRole(r.id as RoleType)}
                  >
                    <div className="h-12 w-12 rounded-full bg-[#EEF3EC] flex items-center justify-center shrink-0">
                      <r.icon className="h-6 w-6 text-[#2E5D3F]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-[#1F3F2C] font-sans">{r.title}</h4>
                      <p className="text-sm text-[#5E726E] font-sans">{r.desc}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  className="w-full mt-4 bg-[#2E5D3F] hover:bg-[#1F3F2C] text-white rounded-[10px] h-12 text-base font-sans font-semibold transition-colors" 
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
                <Button variant="ghost" size="icon" className="mb-2 -ml-2 text-[#2E5D3F] hover:bg-[#EEF3EC]" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-5 w-5 text-[#2E5D3F]" strokeWidth={1.5} />
                </Button>
                <CardTitle className="text-2xl font-bold font-serif text-[#1F3F2C]">Complete your profile</CardTitle>
                <CardDescription className="font-sans text-[#5E726E]">Enter your details to create a {role?.toLowerCase()} account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && <div className="p-3 text-sm text-[#C2453D] bg-[rgba(194,69,61,0.05)] rounded-md border border-[#C2453D]/20">{error}</div>}
                  
                  <div className="space-y-2">
                    <Label className="font-sans text-[#1F3F2C]">{role === 'INSTITUTION' ? 'Institution Name' : 'Full Name'}</Label>
                    <Input required placeholder={role === 'INSTITUTION' ? "City Hospital" : "John Doe"} value={name} onChange={e => setName(e.target.value)} className="h-10 font-sans border-[#DCE8DC] focus-visible:border-[#2E5D3F] focus-visible:ring-[#2E5D3F]/20" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sans text-[#1F3F2C]">Email</Label>
                    <Input required type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-10 font-sans border-[#DCE8DC] focus-visible:border-[#2E5D3F] focus-visible:ring-[#2E5D3F]/20" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-sans text-[#1F3F2C]">Password</Label>
                    <Input required type="password" placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" value={password} onChange={e => setPassword(e.target.value)} className="h-10 font-sans border-[#DCE8DC] focus-visible:border-[#2E5D3F] focus-visible:ring-[#2E5D3F]/20" />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#2E5D3F] hover:bg-[#1F3F2C] text-white rounded-[10px] mt-4 font-sans font-semibold h-10 transition-colors" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
          <CardFooter className="justify-center border-t border-[#DCE8DC]/50 p-4">
            <div className="text-sm text-[#5E726E] font-sans">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[#2E5D3F] hover:underline">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
