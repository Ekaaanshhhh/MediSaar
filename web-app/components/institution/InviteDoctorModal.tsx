'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, UserCircle2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface DoctorSearchResult {
  doctorId: string;
  name: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  profilePhoto: string | null;
}

interface InviteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteDoctorModal({ isOpen, onClose, onSuccess }: InviteDoctorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorSearchResult[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSearchResult | null>(null);
  const [message, setMessage] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast.error("Please enter at least 3 characters to search.");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSelectedDoctor(null);

    try {
      const res = await fetch(`/api/institution/doctors/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.data);
        if (data.data.length === 0) {
          toast.info("No doctors found matching that search.");
        }
      } else {
        toast.error(data.message || "Failed to search doctors.");
      }
    } catch (err) {
      toast.error("An error occurred while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedDoctor) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/institution/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.doctorId,
          message: message
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Invitation sent successfully!");
        handleClose();
        onSuccess();
      } else {
        toast.error(data.message || "Failed to send invitation.");
      }
    } catch (err) {
      toast.error("An error occurred while sending the invitation.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedDoctor(null);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite a Doctor</DialogTitle>
          <DialogDescription>
            Search for an existing MediSaar doctor by name or email to invite them to your institution.
          </DialogDescription>
        </DialogHeader>

        {!selectedDoctor ? (
          <div className="space-y-4 py-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="Doctor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {searchResults.map((doc) => (
                <div 
                  key={doc.doctorId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                  onClick={() => setSelectedDoctor(doc)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{doc.name}</h4>
                      <p className="text-xs text-muted-foreground">{doc.specialization} • {doc.yearsOfExperience}y Exp</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Select</Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/30">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">{selectedDoctor.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{selectedDoctor.email}</p>
                <div className="flex items-center mt-1 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {selectedDoctor.specialization}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDoctor(null)}>
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invitation Message (Optional)</label>
              <Textarea
                placeholder="Include a personal message with your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendInvite} 
            disabled={!selectedDoctor || isSending}
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
