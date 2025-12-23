import { NextRequest, NextResponse } from 'next/server';
import { extractQuoteData, FileInput } from '@/services/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create FileInput
    const fileInput: FileInput = {
      type: 'buffer',
      data: buffer,
      mimeType: file.type || 'application/pdf'
    };

    // Extract quote data from the uploaded file
    const extractedData = await extractQuoteData({
      file: fileInput
    });

    return NextResponse.json(extractedData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract quote data';
    
    return NextResponse.json(
      { 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

