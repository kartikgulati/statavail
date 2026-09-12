'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSubmission(data: {
  name: string;
  storeId: number;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  signatureName: string;
}) {
  try {
    // Check if user has already submitted (basic check by name - as per requirements)
    // "User can not submit multiple availability requests; admin has to delete the entry to get another request"
    const existing = await prisma.submission.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('You have already submitted your availability. Please contact an admin to reset your submission.');
    }

    const submission = await prisma.submission.create({
      data: {
        name: data.name,
        storeId: data.storeId,
        startTime: data.startTime,
        endTime: data.endTime,
        allDay: data.allDay,
        agreedAt: new Date(),
        signatureName: data.signatureName,
      },
    });

    revalidatePath('/');
    return { success: true, submissionId: submission.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
