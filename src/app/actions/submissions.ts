'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

const PDF_STORAGE_DIR = path.join(process.cwd(), 'storage', 'pdfs');

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

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
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteSubmission(id: string) {
  try {
    await prisma.submission.delete({ where: { id } });
    await fs.unlink(path.join(PDF_STORAGE_DIR, `${id}.pdf`)).catch(() => undefined);
    revalidatePath('/admin-statavail');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
