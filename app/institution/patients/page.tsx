'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreHorizontal, User as UserIcon } from 'lucide-react';
import { users, individualProfiles, visits } from '@/data/mockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function PatientManagementPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Assemble mock patients table data
  const tableData = individualProfiles.map(profile => {
    const user = users.find(u => u.id === profile.userId);
    const patientVisits = visits.filter(v => v.patientId === profile.userId);
    const lastVisit = patientVisits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      id: profile.userId,
      name: user?.name,
      medisaarId: profile.medisaarId,
      lastVisit: lastVisit ? format(new Date(lastVisit.date), 'MMM dd, yyyy') : 'Never',
      assignedDoctor: 'Dr. Sarah Smith', // mock
      status: 'Active'
    };
  }).filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.medisaarId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">Manage and track patients across your institution.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <UserIcon className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>MediSaar ID</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Assigned Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length > 0 ? tableData.map(patient => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.medisaarId}</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
                <TableCell>{patient.assignedDoctor}</TableCell>
                <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{patient.status}</Badge></TableCell>
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
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
