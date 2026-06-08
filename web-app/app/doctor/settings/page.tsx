'use client'

import { useAuth } from '@/hooks/useAuth';
import { doctorProfiles } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  const profile = doctorProfiles.find((p) => p.userId === user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and professional details.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Profile Settings</CardTitle>
            <CardDescription>Update your professional information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <Label>MediSaar ID</Label>
                <Input defaultValue={profile?.medisaarId || ''} disabled />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input defaultValue={profile?.specialization || ''} />
              </div>
              <div className="space-y-2">
                <Label>Experience (Years)</Label>
                <Input defaultValue={profile?.experienceYears?.toString() || ''} type="number" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user.email} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input defaultValue={profile?.phone || ''} />
              </div>
            </div>

            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
