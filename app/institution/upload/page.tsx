'use client'
import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle2, User } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getPatientDetails } from '@/data/mockData';

function UploadCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    if (!patientId) {
      router.push('/institution/patients');
      return;
    }
    try {
      const details = getPatientDetails(patientId);
      if (details && details.user) {
        setPatientName(details.user.name);
      } else {
        router.push('/institution/patients');
      }
    } catch (e) {
      router.push('/institution/patients');
    }
  }, [patientId, router]);

  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  if (!patientId || !patientName) {
    return <div className="py-12 text-center text-muted-foreground">Loading patient details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Center</h1>
        <p className="text-muted-foreground">Securely upload reports, prescriptions, and medical records.</p>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-0.5">Uploading for Patient</p>
          <p className="text-xl font-bold text-foreground leading-none">{patientName}</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Drag & Drop Upload</CardTitle>
          <CardDescription>Supported formats: PDF, JPG, PNG, DICOM.</CardDescription>
        </CardHeader>
        <CardContent>
          {!uploaded ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploaded(true); }}
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">Click to upload or drag and drop</h3>
              <p className="text-sm text-muted-foreground mb-6">Maximum file size: 50MB</p>
              <Button onClick={() => setUploaded(true)}>Select Files</Button>
            </div>
          ) : (
            <div className="border rounded-xl p-8 text-center bg-green-50 border-green-200">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-1">Files Uploaded Successfully</h3>
              <p className="text-sm text-green-700 mb-6">The documents have been securely attached to {patientName}'s record.</p>
              <Button variant="outline" onClick={() => setUploaded(false)} className="bg-white">Upload More</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UploadCenterPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <UploadCenterContent />
    </Suspense>
  );
}
