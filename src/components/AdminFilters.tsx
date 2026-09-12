'use client';

import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function AdminFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="Search name..."
        className="max-w-xs"
        defaultValue={searchParams.get('name') || ''}
        onChange={(e) => updateFilter('name', e.target.value)}
      />
      <Input
        placeholder="Store number..."
        className="max-w-xs"
        defaultValue={searchParams.get('store') || ''}
        onChange={(e) => updateFilter('store', e.target.value)}
      />
      {isPending && <span className="text-sm text-muted-foreground animate-pulse">Filtering...</span>}
    </div>
  );
}
