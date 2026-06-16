'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MoreHorizontal, User as UserIcon, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PatientManagementPage() {
  const router = useRouter();
  
  // Data State
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Pagination & Search State
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', dateOfBirth: '', gender: '', bloodGroup: '', emergencyContact: '', allergies: ''
  });
  
  // Success State for New Patient
  const [successData, setSuccessData] = useState<{ mediSaarId: string, temporaryPassword?: string } | null>(null);

  // Search Existing User State
  const [existingUserQuery, setExistingUserQuery] = useState('');
  const [searchingExisting, setSearchingExisting] = useState(false);
  const [existingUserResult, setExistingUserResult] = useState<any | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/institution/patients?page=${page}&limit=${limit}&q=${encodeURIComponent(debouncedSearch)}`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.data.patients || []);
        setTotal(data.data.total || 0);
      } else {
        toast.error("Failed to load patients");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while loading patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/institution/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((e: any) => e.message).join(', ');
          throw new Error(errorMessages || data.message || 'Validation failed');
        }
        throw new Error(data.message || 'Validation failed');
      }

      setSuccessData({
        mediSaarId: data.data.mediSaarId,
        temporaryPassword: data.data.temporaryPassword
      });
      
      fetchPatients();
      setFormData({
        name: '', email: '', dateOfBirth: '', gender: '', bloodGroup: '', emergencyContact: '', allergies: ''
      });
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Unable to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingUserQuery.trim().length < 3) {
      toast.error("Search query must be at least 3 characters");
      return;
    }
    
    setSearchingExisting(true);
    setExistingUserResult(null);
    try {
      const res = await fetch(`/api/institution/patients/search?q=${encodeURIComponent(existingUserQuery)}`);
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setExistingUserResult(data.data[0]); // Take the first matched patient
      } else {
        toast.error("No patient found with that MediSaar ID or email.");
      }
    } catch (err) {
      toast.error("Network error while searching.");
    } finally {
      setSearchingExisting(false);
    }
  };

  const handleAddExisting = async () => {
    if (!existingUserResult) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/institution/patients/add-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: existingUserResult.patientId })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || "Association request sent!");
        setSuccessData({ mediSaarId: existingUserResult.mediSaarId }); // Reusing success state but without temp password
        fetchPatients();
      } else {
        toast.error(data.message || "Failed to add patient");
      }
    } catch (err) {
      toast.error("Network error while adding patient.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const copyAllCredentials = () => {
    if (successData) {
      const text = `MediSaar ID: ${successData.mediSaarId}\nTemporary Password: ${successData.temporaryPassword || 'N/A'}`;
      navigator.clipboard.writeText(text);
      toast.success("Credentials copied to clipboard");
    }
  };

  const resetModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setTimeout(() => {
        setSuccessData(null);
        setExistingUserResult(null);
        setExistingUserQuery('');
      }, 300);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">Manage and track patients across your institution.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={resetModal}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserIcon className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {successData ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Patient Successfully Added</h2>
                  <p className="text-muted-foreground mt-1">
                    {successData.temporaryPassword 
                      ? "A new account has been created in the MediSaar network."
                      : "An association request has been sent to the existing patient."}
                  </p>
                </div>

                <div className="w-full bg-muted/50 p-6 rounded-xl border border-border/50 text-left space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">MediSaar ID</Label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-bold text-lg">{successData.mediSaarId}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(successData.mediSaarId, "MediSaar ID")}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {successData.temporaryPassword && (
                    <>
                      <div className="h-px bg-border/50 w-full" />
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Temporary Password</Label>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono font-bold text-lg">{successData.temporaryPassword}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(successData.temporaryPassword!, "Password")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button className="w-full" variant="outline" onClick={copyAllCredentials}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Credentials
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <Button className="w-full" onClick={() => resetModal(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Add Patient</DialogTitle>
                  <DialogDescription>
                    Register a new patient or associate an existing MediSaar user with your institution.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="existing" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Existing MediSaar User</TabsTrigger>
                    <TabsTrigger value="new">New Patient</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="mt-4 space-y-4">
                    <form onSubmit={handleSearchExisting} className="flex gap-2">
                      <Input 
                        placeholder="Search by MediSaar ID or Email..." 
                        value={existingUserQuery}
                        onChange={(e) => setExistingUserQuery(e.target.value)}
                      />
                      <Button type="submit" disabled={searchingExisting}>
                        {searchingExisting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </form>

                    {existingUserResult && (
                      <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{existingUserResult.name}</h4>
                            <p className="text-sm text-muted-foreground">{existingUserResult.email}</p>
                          </div>
                          <Badge variant="secondary">{existingUserResult.mediSaarId}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground block">DOB</span>
                            <span className="font-medium">{existingUserResult.dateOfBirth ? format(new Date(existingUserResult.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Blood Group</span>
                            <span className="font-medium">{existingUserResult.bloodGroup || 'N/A'}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-2" onClick={handleAddExisting} disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Send Association Request
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="new" className="mt-4">
                    <form onSubmit={handleAddPatient} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                          <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                          <Input id="dateOfBirth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                          <Input id="gender" name="gender" placeholder="e.g. Male" required value={formData.gender} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Input id="bloodGroup" name="bloodGroup" placeholder="e.g. O+" value={formData.bloodGroup} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies (comma separated)</Label>
                        <Input id="allergies" name="allergies" placeholder="e.g. Peanuts, Penicillin" value={formData.allergies} onChange={handleInputChange} />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            'Create Patient'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, ID, or email..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>MediSaar ID</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Assigned Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Loading patients...</p>
                </TableCell>
              </TableRow>
            ) : patients.length > 0 ? (
              patients.map(patient => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.name}
                    <span className="block text-xs text-muted-foreground">{patient.email}</span>
                  </TableCell>
                  <TableCell>{patient.medisaarId}</TableCell>
                  <TableCell>{patient.registrationDate ? format(new Date(patient.registrationDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                  <TableCell>{patient.totalVisits}</TableCell>
                  <TableCell className="text-muted-foreground">{patient.assignedDoctor || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${patient.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${patient.status === 'FOLLOW_UP_REQUIRED' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      ${patient.status === 'INACTIVE' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                    `}>
                      {patient.status?.replace(/_/g, ' ') || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/institution/upload?patientId=${patient.id}`)}>Upload report</DropdownMenuItem>
                        <DropdownMenuItem>Add visit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <UserIcon className="h-10 w-10 text-muted-foreground/30" />
                    <p>No patients found.</p>
                    {debouncedSearch && (
                      <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {!loading && patients.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> patients
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
