import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import ConfirmationPDF from '@/components/ConfirmationPDF';
import fs from 'fs/promises';
import path from 'path';

const PDF_STORAGE_DIR = path.join(process.cwd(), 'storage', 'pdfs');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!submission) {
    return new NextResponse('Submission not found', { status: 404 });
  }

  // Check if PDF already exists in storage
  const pdfPath = path.join(PDF_STORAGE_DIR, `${id}.pdf`);
  try {
    const exists = await fs.access(pdfPath).then(() => true).catch(() => false);
    if (exists) {
      const fileBuffer = await fs.readFile(pdfPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="confirmation-${id}.pdf"`,
        },
      });
    }
  } catch (e) {
    console.error('Error checking for cached PDF:', e);
  }

  // Generate PDF
  const stream = await renderToStream(
    <ConfirmationPDF submission={submission} store={submission.store} />
  );

  // Save to storage for future downloads
  try {
    await fs.mkdir(PDF_STORAGE_DIR, { recursive: true });
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);
    await fs.writeFile(pdfPath, pdfBuffer);

    // Update database with pdfUrl
    await prisma.submission.update({
      where: { id },
      data: { pdfUrl: `/storage/pdfs/${id}.pdf` },
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="confirmation-${id}.pdf"`,
      },
    });
  } catch (e) {
    console.error('Error saving PDF:', e);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
