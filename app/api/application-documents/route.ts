import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');

    if (!applicationId) {
      return NextResponse.json({ error: 'application_id is required' }, { status: 400 });
    }

    const documents = await supabaseService.getApplicationDocuments(applicationId);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching application documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      application_id, 
      document_type, 
      file_name, 
      file_path, 
      file_size, 
      mime_type 
    } = body;

    if (!application_id || !document_type || !file_name || !file_path) {
      return NextResponse.json({ 
        error: 'application_id, document_type, file_name, and file_path are required' 
      }, { status: 400 });
    }

    const documentData = {
      application_id,
      document_type,
      file_name,
      file_path,
      file_size,
      mime_type,
    };

    const document = await supabaseService.uploadApplicationDocument(documentData);
    
    if (!document) {
      return NextResponse.json({ error: 'Failed to upload application document' }, { status: 500 });
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading application document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
