'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, XCircle, Building2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { DoctorInvitationResponse } from '@/types/doctorInvitation.types';
import { EmptyState } from '@/components/shared/EmptyState';

export default function DoctorInvitationsPage() {
  const [invitations, setInvitations] = useState<DoctorInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/doctor/invitations');
      const data = await res.json();
      if (data.success) {
        setInvitations(data.data);
      } else {
        toast.error(data.message || "Failed to load invitations");
      }
    } catch (error) {
      toast.error("Network error while loading invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAction = async (invitationId: string, action: 'accept' | 'reject') => {
    setActionLoading(invitationId);
    try {
      const res = await fetch(`/api/doctor/invitations/${invitationId}/${action}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        // Update local state instead of full refetch for better UX
        setInvitations(prev => prev.map(inv => 
          inv.invitationId === invitationId 
            ? { ...inv, status: data.data.status } 
            : inv
        ));
      } else {
        toast.error(data.message || `Failed to ${action} invitation`);
      }
    } catch (error) {
      toast.error(`Network error while trying to ${action} invitation`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institution Invitations</h1>
        <p className="text-muted-foreground">Manage your affiliation requests from hospitals and clinics.</p>
      </div>

      {invitations.length === 0 ? (
        <EmptyState 
          icon={Mail}
          title="No Invitations"
          description="You don't have any pending invitations at the moment. When institutions invite you to join their network, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <Card key={inv.invitationId} className={`transition-all duration-200 ${inv.status === 'PENDING' ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'opacity-80'}`}>
              <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0 mr-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-1 line-clamp-1">{inv.institution.name}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {inv.status === 'PENDING' && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 w-fit">Pending</Badge>
                )}
                {inv.status === 'ACCEPTED' && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 w-fit">
                    <CheckCircle className="mr-1 h-3 w-3" /> Accepted
                  </Badge>
                )}
                {inv.status === 'REJECTED' && (
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 w-fit">
                    <XCircle className="mr-1 h-3 w-3" /> Rejected
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="pt-4 pb-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-sm italic text-muted-foreground relative">
                  <div className="absolute top-2 left-2 text-primary/20 text-2xl font-serif leading-none">"</div>
                  <p className="pl-4 relative z-10">{inv.message}</p>
                </div>
                {inv.specializationRequested && (
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Role requested:</span>
                    <span className="font-medium text-foreground">{inv.specializationRequested}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 pb-4 px-4 flex gap-3">
                {inv.status === 'PENDING' ? (
                  <>
                    <Button 
                      className="flex-1 shadow-sm" 
                      onClick={() => handleAction(inv.invitationId, 'accept')}
                      disabled={actionLoading === inv.invitationId}
                    >
                      {actionLoading === inv.invitationId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10"
                      onClick={() => handleAction(inv.invitationId, 'reject')}
                      disabled={actionLoading === inv.invitationId}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    {inv.status === 'ACCEPTED' ? 'Joined Institution' : 'Invitation Declined'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
