'use client'
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User as UserIcon } from 'lucide-react';
import { users, individualProfiles } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function PatientSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = individualProfiles.map(profile => {
    const user = users.find(u => u.id === profile.userId);
    return {
      id: profile.userId,
      name: user?.name || 'Unknown',
      medisaarId: profile.medisaarId,
      bloodGroup: profile.bloodGroup,
      phone: profile.phone
    };
  }).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.medisaarId.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Patient Search</h1>
        <p className="text-muted-foreground mb-8">Search for patients by name, MediSaar ID, or phone number to view their medical summary.</p>
        
        <div className="relative max-w-xl mx-auto shadow-sm">
          <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
          <Input 
            className="h-12 pl-12 text-lg rounded-xl border-border bg-card"
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map(patient => (
            <Link key={patient.id} href={`/doctor/patient/${patient.id}`}>
              <Card className="hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <UserIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{patient.name}</h3>
                    <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                      <span>{patient.medisaarId}</span>
                      <span>•</span>
                      <span>{patient.bloodGroup}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {searchResults.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 text-center text-muted-foreground">
              No patients found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
