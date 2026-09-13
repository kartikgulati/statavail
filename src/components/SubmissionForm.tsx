'use client';

import React, { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createSubmission } from '@/app/actions/submissions';
import { Store } from '@prisma/client';
import { cn } from '@/lib/utils';

// Wait, I'll redefine this to be a wrapper
export default function SubmissionForm({ stores }: { stores: Store[] }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    storeId: '',
    startTime: '',
    endTime: '',
    allDay: false,
    agreed: false,
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleNext = () => {
    if (!formData.name || !formData.storeId) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.allDay && (!formData.startTime || !formData.endTime)) {
      setError('Please enter your start and end times.');
      return;
    }
    if (!formData.allDay && formData.startTime >= formData.endTime) {
      setError('End time must be after start time.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.agreed || !formData.firstName || !formData.lastName) {
      setError('Please agree to the terms and provide your signature.');
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createSubmission({
      name: formData.name,
      storeId: parseInt(formData.storeId),
      startTime: formData.allDay ? null : formData.startTime,
      endTime: formData.allDay ? null : formData.endTime,
      allDay: formData.allDay,
      signatureName: `${formData.firstName} ${formData.lastName}`,
    });

    setLoading(false);
    if (result.success) {
      setSubmissionId(result.submissionId || null);
      setStep(3);
    } else {
      setError(result.error || 'Something went wrong.');
    }
  };

  if (step === 3) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Submission Confirmed!</CardTitle>
          <CardDescription>Thank you for submitting your availability.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-muted-foreground">
            Your availability has been recorded. You can now download your confirmation PDF.
          </p>
          <a href={`/api/pdf/${submissionId}`} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants())}>
            Download Confirmation PDF
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{step === 1 ? 'Availability' : 'Agreement'}</CardTitle>
        <CardDescription>
          {step === 1 ? 'Let us know when you are available for the stat day.' : 'Please read and sign the agreement.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ronald McDonald"
              />
            </div>
            <div className="space-y-2">
              <Label>Store</Label>
              <Select
                value={formData.storeId}
                onValueChange={(val) => setFormData({...formData, storeId: val || ''})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.number} - {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(val) => setFormData({...formData, allDay: val})}
              />
              <Label htmlFor="allDay">Available all day</Label>
            </div>
            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-md text-sm h-48 overflow-y-auto">
              <p className="font-semibold mb-2">Statutory Holiday Agreement</p>
              <p>
                I hereby confirm my availability to work on the upcoming statutory holiday. I understand that this submission is provided for scheduling purposes and does not guarantee a specific shift, position, or number of hours.

                <p className="mt-2">
                   I acknowledge that my availability may be subject to change based on business needs, operational requirements, and staffing levels.
                </p>

               
              <p className="mt-2">
              This availability submission applies only to the upcoming statutory holiday and does not modify or replace my regular availability.
              </p>
                
              <p className="mt-2">

                I agree to notify my Store Manager or Department Manager as soon as possible should my availability change.
                </p>
              </p>
              <p className="mt-2">
                By signing below, I certify that the information provided is accurate and I agree to the terms
                of the holiday scheduling policy.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreed"
                checked={formData.agreed}
                onCheckedChange={(val) => setFormData({...formData, agreed: !!val})}
              />
              <Label htmlFor="agreed">I have read and agree to the above</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name (Signature)</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name (Signature)</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step === 2 && (
          <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
            Back
          </Button>
        )}
        <div className="ml-auto">
          {step === 1 && (
            <Button onClick={handleNext}>Next</Button>
          )}
          {step === 2 && (
            <Button onClick={handleSubmit} disabled={loading || !formData.agreed || !formData.firstName || !formData.lastName}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
