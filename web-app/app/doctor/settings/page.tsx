'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    qualification: '',
    yearsOfExperience: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/doctor/settings');
        const data = await res.json();
        if (data.success) {
          setProfile({
            name: data.data.name || '',
            email: data.data.email || '',
            specialization: data.data.specialization || '',
            qualification: data.data.qualification || '',
            yearsOfExperience: data.data.yearsOfExperience?.toString() || ''
          });
        }
      } catch (error) {
        toast.error("Failed to load profile settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleProfileUpdate = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        ...profile,
        yearsOfExperience: parseInt(profile.yearsOfExperience, 10) || 0
      };
      
      const res = await fetch('/api/doctor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error while updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }
    
    setSavingPassword(true);
    try {
      const res = await fetch('/api/doctor/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Network error while changing password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and professional details.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Professional Profile</CardTitle>
            <CardDescription>Update your public facing information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="bg-muted" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input 
                  value={profile.specialization}
                  onChange={(e) => setProfile({...profile, specialization: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Qualification (e.g. MD, MBBS)</Label>
                <Input 
                  value={profile.qualification}
                  onChange={(e) => setProfile({...profile, qualification: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience (Years)</Label>
                <Input 
                  type="number"
                  value={profile.yearsOfExperience}
                  onChange={(e) => setProfile({...profile, yearsOfExperience: e.target.value})} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <Button onClick={handleProfileUpdate} disabled={savingProfile}>
              {savingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Key className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Ensure your account remains highly secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input 
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                />
                <p className="text-xs text-muted-foreground mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</p>
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <Button variant="destructive" onClick={handlePasswordChange} disabled={savingPassword}>
              {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
