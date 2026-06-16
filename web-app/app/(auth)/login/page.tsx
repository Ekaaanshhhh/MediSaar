'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    if (result.success && result.role) {
      if (result.role === 'INDIVIDUAL') router.push('/individual');
      else if (result.role === 'DOCTOR') router.push('/doctor');
      else if (result.role === 'INSTITUTION') router.push('/institution');
      else router.push('/');
    } else {
      setError(result.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF3EC] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="font-serif font-bold text-[22px] text-[#1F3F2C] tracking-tight">
            MediSaar
          </Link>
        </div>
        <Card className="border-[#DCE8DC] bg-[#F7FAF7] shadow-soft rounded-[14px]">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold font-serif text-[#1F3F2C]">Welcome back</CardTitle>
            <CardDescription className="font-sans text-[#5E726E]">Enter your email and password to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="p-3 text-sm text-[#C2453D] bg-[rgba(194,69,61,0.05)] rounded-md border border-[#C2453D]/20">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-[#1F3F2C]">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 font-sans border-[#DCE8DC] focus-visible:border-[#2E5D3F] focus-visible:ring-[#2E5D3F]/20" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-sans text-[#1F3F2C]">Password</Label>
                  <Link href="#" className="text-sm font-medium text-[#2E5D3F] hover:underline font-sans">Forgot password?</Link>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10 font-sans border-[#DCE8DC] focus-visible:border-[#2E5D3F] focus-visible:ring-[#2E5D3F]/20" />
              </div>
              <Button type="submit" className="w-full bg-[#2E5D3F] hover:bg-[#1F3F2C] text-white rounded-[10px] h-10 font-sans font-semibold transition-colors" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-center w-full text-sm text-[#5E726E] font-sans">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-[#2E5D3F] hover:underline">Sign up</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
