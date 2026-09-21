import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import ConfirmationPDF from '@/components/ConfirmationPDF';

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

  // Generate the PDF in memory so this works on Vercel's ephemeral filesystem.
  const stream = await renderToStream(
    <ConfirmationPDF submission={submission} store={submission.store} />
  );

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="confirmation-${submission.name}.pdf"`,
      },
    });
  } catch (e) {
    console.error('Error generating PDF:', e);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
