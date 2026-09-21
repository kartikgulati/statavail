import { prisma } from '@/lib/prisma';
import SubmissionForm from '@/components/SubmissionForm';

export default async function HomePage() {
  const stores = await prisma.store.findMany({
    orderBy: { number: 'asc' },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Statutory Availability</h1>
          <p className="text-muted-foreground">Please submit your availability for the upcoming statutory holiday.</p>
        </div>
        <SubmissionForm stores={stores} />
      </div>
    </main>
  );
}
