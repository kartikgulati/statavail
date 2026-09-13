import { prisma } from '@/lib/prisma';
import SubmissionForm from '@/components/SubmissionForm';

export default async function HomePage() {
  const stores = await prisma.store.findMany({
    orderBy: { number: 'asc' },
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Statutory Availability</h1>
          <p className="text-muted-foreground">Please submit your availability for the upcoming statutory holiday.</p>
        </div>
        <SubmissionForm stores={stores} />
      </div>
    </main>
  );
}
