'use client'
import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle2, User, FileText, Image as ImageIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function UploadCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId');
  const [patientName, setPatientName] = useState('');

  // Form State
  const [documentCategory, setDocumentCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');

  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        setIsLoadingPatient(true);
        try {
          const res = await fetch(`/api/institution/patients/${patientId}`);
          const data = await res.json();
          if (data.success && data.data) {
            setPatientName(data.data.name);
          } else {
            console.error("Failed to load patient:", data.message);
          }
        } catch (e) {
          console.error("Error fetching patient:", e);
        } finally {
          setIsLoadingPatient(false);
        }
      };
      fetchPatient();
    }
  }, [patientId]);

  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = async () => {
    if (selectedFile && documentCategory && (documentCategory === 'Other' || subCategory)) {
      setIsUploading(true);
      try {
        // 1. Get Cloudinary Signature
        const signRes = await fetch('/api/cloudinary/sign');
        const signData = await signRes.json();
        
        if (!signData.success) {
          throw new Error(signData.message || "Failed to get signature");
        }

        const { timestamp, signature } = signData.data;
        const apiKey = "496561778929473"; // From env
        const cloudName = "dzfukws70"; // From env

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);

        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: formData,
        });

        const cloudinaryData = await cloudinaryRes.json();
        
        if (!cloudinaryRes.ok) {
          throw new Error(cloudinaryData.error?.message || "Cloudinary upload failed");
        }

        const secureUrl = cloudinaryData.secure_url;

        // 3. Save to backend
        const res = await fetch('/api/institution/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            documentCategory,
            subCategory,
            cloudinaryUrl: secureUrl,
            title: selectedFile.name
          })
        });

        const data = await res.json();
        if (data.success) {
          setUploaded(true);
        } else {
          console.error("Failed to save document:", data.message);
          alert("Failed to save document: " + data.message);
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        alert(error.message || "An error occurred during upload");
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!patientId) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto mt-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Center</h1>
          <p className="text-muted-foreground">Securely upload reports, prescriptions, and medical records.</p>
        </div>
        <Card className="shadow-sm border-dashed">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Patient Selected</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Please navigate to Patient Management and select a patient to upload records to their profile.
            </p>
            <Button onClick={() => router.push('/institution/patients')}>
              Go to Patient Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patientName) {
    return <div className="py-12 text-center text-muted-foreground">Loading patient details...</div>;
  }

  const isFormValid = selectedFile && documentCategory !== '' && (documentCategory === 'Other' || subCategory !== '');

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
          <CardTitle className="text-lg">Document Details</CardTitle>
          <CardDescription>Select the type of document and attach the file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!uploaded ? (
            <>
              {/* Document Categorization */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select 
                    value={documentCategory} 
                    onValueChange={(val) => {
                      setDocumentCategory(val);
                      setSubCategory('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Report">Medical Report</SelectItem>
                      <SelectItem value="Prescription">Prescription</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {documentCategory === 'Report' && (
                  <div className="space-y-2">
                    <Label>Report Category</Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blood Test">Blood Test</SelectItem>
                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                        <SelectItem value="MRI Scan">MRI Scan</SelectItem>
                        <SelectItem value="CT Scan">CT Scan</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                        <SelectItem value="ECG">ECG / EKG</SelectItem>
                        <SelectItem value="Pathology">Pathology</SelectItem>
                        <SelectItem value="Other Report">Other Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {documentCategory === 'Prescription' && (
                  <div className="space-y-2">
                    <Label>Related Condition</Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select associated disease..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General/Fever">General / Fever</SelectItem>
                        <SelectItem value="Diabetes">Diabetes</SelectItem>
                        <SelectItem value="Hypertension">Hypertension</SelectItem>
                        <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                        <SelectItem value="Asthma/Respiratory">Asthma / Respiratory</SelectItem>
                        <SelectItem value="Thyroid">Thyroid</SelectItem>
                        <SelectItem value="Other Condition">Other Condition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Drag & Drop Area */}
              <div className="space-y-2">
                <Label>Attach File (Image / PDF)</Label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors relative ${
                    isDragging ? 'border-primary bg-primary/5' : 
                    selectedFile ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/10' : 
                    'border-border hover:border-primary/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
                        {selectedFile.type.includes('image') ? (
                          <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)} className="mt-2">
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-base font-medium mb-1">Click to upload or drag and drop</h3>
                      <p className="text-sm text-muted-foreground mb-6">Supported formats: PDF, JPG, PNG (Max 50MB)</p>
                      <Button variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="border rounded-xl p-8 text-center bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 dark:text-green-400 mb-1">File Uploaded Successfully!</h3>
              <p className="text-sm text-green-700 dark:text-green-500/80 mb-6">
                The document has been securely saved to the patient's record.
              </p>
              <Button variant="outline" onClick={() => {
                setUploaded(false);
                setSelectedFile(null);
                setDocumentCategory('');
                setSubCategory('');
              }} className="bg-white dark:bg-black">
                Upload Another
              </Button>
            </div>
          )}
        </CardContent>
        {!uploaded && (
          <CardFooter className="bg-muted/30 px-6 py-4 flex justify-end border-t">
            <Button 
              size="lg" 
              disabled={!isFormValid || isUploading} 
              onClick={handleUploadClick}
              className="w-full md:w-auto"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </CardFooter>
        )}
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
