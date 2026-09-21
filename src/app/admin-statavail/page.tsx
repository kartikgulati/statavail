import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Link from 'next/link';
import AdminFilters from '@/components/AdminFilters';
import AdminSubmissionActions from '@/components/AdminSubmissionActions';
import { cn } from '@/lib/utils';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; store?: string }>;
}) {
  const { name, store } = await searchParams;

  const submissions = await prisma.submission.findMany({
    where: {
      AND: [
        name ? { name: { contains: name, mode: 'insensitive' } } : {},
        store ? { store: { number: { contains: store, mode: 'insensitive' } } } : {},
      ],
    },
    include: { store: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Review and manage stat day availability submissions.</p>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminFilters />
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.store.number} - {s.store.name}</TableCell>
                      <TableCell>
                        {s.allDay ? 'All Day' : `${s.startTime} - ${s.endTime}`}
                      </TableCell>
                      <TableCell>{format(s.createdAt, 'PPP p')}</TableCell>
                      <TableCell className="text-right">
                        <AdminSubmissionActions submissionId={s.id} submissionName={s.name} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No submissions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
