'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, UserCircle2, Mail, Briefcase, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { InviteDoctorModal } from '@/components/institution/InviteDoctorModal';

interface Doctor {
  doctorId: string;
  name: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  profilePhoto: string | null;
  licenseNumber: string;
}

interface Invitation {
  invitationId: string;
  doctorId: string | null;
  doctorName: string;
  doctorEmail: string;
  specialization: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string;
  createdAt: string;
  respondedAt: string | null;
}

interface Analytics {
  pending: number;
  accepted: number;
  rejected: number;
}

export default function DoctorsManagementPage() {
  const [activeDoctors, setActiveDoctors] = useState<Doctor[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ pending: 0, accepted: 0, rejected: 0 });
  
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await fetch('/api/institution/doctors');
      const data = await res.json();
      if (data.success) {
        setActiveDoctors(data.data);
      }
    } catch (err) {
      toast.error('Failed to load active doctors.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const res = await fetch('/api/institution/invitations');
      const data = await res.json();
      if (data.success) {
        setInvitations(data.data.invitations);
        setAnalytics(data.data.analytics);
      }
    } catch (err) {
      toast.error('Failed to load invitations.');
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchInvitations();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Doctors & Staff</h2>
          <p className="text-muted-foreground">Manage affiliated medical professionals and pending invitations.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Invite Doctor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDoctors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Invites</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.accepted}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Doctors</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        
        {/* ACTIVE DOCTORS TAB */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliated Doctors</CardTitle>
              <CardDescription>A list of all doctors currently active in your institution.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDoctors ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : activeDoctors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active doctors found. Use the invite button to add some.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeDoctors.map((doc) => (
                    <Card key={doc.doctorId} className="overflow-hidden border-border/50">
                      <div className="p-5 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <UserCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{doc.specialization}</p>
                        
                        <div className="w-full space-y-2 text-sm text-left">
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{doc.email}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Briefcase className="h-4 w-4 mr-2" />
                            <span>{doc.yearsOfExperience} Years Experience</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            <span>License: {doc.licenseNumber}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVITATIONS TAB */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitation History</CardTitle>
              <CardDescription>Track the status of all invitations sent to doctors.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvitations ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invitations sent yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                        <tr>
                          <th className="px-6 py-3">Doctor</th>
                          <th className="px-6 py-3">Specialization</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Sent On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map((inv) => (
                          <tr key={inv.invitationId} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="px-6 py-4">
                              <div className="font-medium text-foreground">{inv.doctorName}</div>
                              <div className="text-muted-foreground text-xs">{inv.doctorEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {inv.specialization}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                inv.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                              }`}>
                                {inv.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                {inv.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {inv.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                              {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteDoctorModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false);
          fetchInvitations();
        }}
      />
    </div>
  );
}
