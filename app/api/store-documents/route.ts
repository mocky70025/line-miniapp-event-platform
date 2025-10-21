import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeProfileId = searchParams.get('store_profile_id');

    if (!storeProfileId) {
      return NextResponse.json({ error: 'store_profile_id is required' }, { status: 400 });
    }

    const documents = await supabaseService.getStoreDocuments(storeProfileId);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching store documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      store_profile_id, 
      document_type, 
      file_name, 
      file_path, 
      file_size, 
      mime_type 
    } = body;

    if (!store_profile_id || !document_type || !file_name || !file_path) {
      return NextResponse.json({ 
        error: 'store_profile_id, document_type, file_name, and file_path are required' 
      }, { status: 400 });
    }

    const documentData = {
      store_profile_id,
      document_type,
      file_name,
      file_path,
      file_size,
      mime_type,
    };

    const document = await supabaseService.uploadStoreDocument(documentData);
    
    if (!document) {
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
