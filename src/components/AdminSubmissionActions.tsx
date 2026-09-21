'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteSubmission } from '@/app/actions/submissions';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function AdminSubmissionActions({
  submissionId,
  submissionName,
}: {
  submissionId: string;
  submissionName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSubmission(submissionId);
      if (!result.success) {
        setError(result.error ?? 'Unable to delete submission.');
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-2 whitespace-nowrap">
      <a
        href={`/api/pdf/${submissionId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
      >
        Download PDF
      </a>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<Button variant="destructive" size="sm" />}
          onClick={() => setError(null)}
        >
          <Trash2 />
          Delete
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete submission?</DialogTitle>
            <DialogDescription>
              This will permanently delete {submissionName}&apos;s submission and its PDF.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}