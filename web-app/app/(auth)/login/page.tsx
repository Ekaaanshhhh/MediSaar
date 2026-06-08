'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, User, Stethoscope, Building } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleMockLogin = (role: 'INDIVIDUAL' | 'DOCTOR' | 'INSTITUTION') => {
    if (role === 'INDIVIDUAL') login('ind-1');
    if (role === 'DOCTOR') login('doc-1');
    if (role === 'INSTITUTION') login('inst-1');
    
    if (role === 'INDIVIDUAL') router.push('/individual');
    if (role === 'DOCTOR') router.push('/doctor');
    if (role === 'INSTITUTION') router.push('/institution');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link className="flex items-center gap-2" href="/">
            <ActivitySquare className="h-8 w-8 text-accent" />
            <span className="font-bold text-2xl text-primary tracking-tight">MediSaar</span>
          </Link>
        </div>
        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your email to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleMockLogin('INDIVIDUAL')}>Sign In</Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo quick login</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full justify-start font-normal" onClick={() => handleMockLogin('INDIVIDUAL')}>
                <User className="mr-2 h-4 w-4 text-primary" /> Login as Patient
              </Button>
              <Button variant="outline" className="w-full justify-start font-normal" onClick={() => handleMockLogin('DOCTOR')}>
                <Stethoscope className="mr-2 h-4 w-4 text-accent" /> Login as Doctor
              </Button>
              <Button variant="outline" className="w-full justify-start font-normal" onClick={() => handleMockLogin('INSTITUTION')}>
                <Building className="mr-2 h-4 w-4 text-muted-foreground" /> Login as Institution
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-center w-full text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
