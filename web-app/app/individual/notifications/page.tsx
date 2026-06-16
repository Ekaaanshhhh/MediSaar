'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  requestId: string;
  institutionName: string;
  status: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/individual/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessing(requestId);
    try {
      const res = await fetch(`/api/individual/notifications/${requestId}/${action}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Request ${action}ed successfully.`);
        // Remove from list
        setNotifications(prev => prev.filter(n => n.requestId !== requestId));
      } else {
        toast.error(data.message || `Failed to ${action} request.`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} request.`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Manage your institution association requests.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">No New Notifications</CardTitle>
          <CardDescription>
            You don't have any pending association requests from institutions.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notifications.map((notification) => (
            <Card key={notification.requestId} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Association Request
                </CardTitle>
                <CardDescription className="text-sm">
                  {new Date(notification.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm font-medium">
                  <span className="font-bold text-primary">{notification.institutionName}</span> wants to associate with your MediSaar account to manage your healthcare records.
                </p>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-3 pt-4 border-t mt-auto bg-muted/20">
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={processing === notification.requestId}
                  onClick={() => handleAction(notification.requestId, 'reject')}
                >
                  {processing === notification.requestId ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button 
                  className="w-full"
                  disabled={processing === notification.requestId}
                  onClick={() => handleAction(notification.requestId, 'accept')}
                >
                  {processing === notification.requestId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
