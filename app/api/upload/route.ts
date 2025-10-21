import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const storeProfileId = formData.get('storeProfileId') as string;
    const applicationId = formData.get('applicationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // ファイルサイズチェック (10MB制限)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // ファイル形式チェック
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, PDF, DOC, DOCX' 
      }, { status: 400 });
    }

    // ファイル名を生成（タイムスタンプ + 元のファイル名）
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `documents/${documentType}/${fileName}`;

    // ファイルをバッファに変換
    const fileBuffer = await file.arrayBuffer();

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // データベースに記録
    if (storeProfileId) {
      // 店舗プロフィール用の書類
      const { data: documentData, error: dbError } = await supabase
        .from('store_documents')
        .insert([{
          store_profile_id: storeProfileId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // アップロードしたファイルを削除
        await supabase.storage.from('documents').remove([filePath]);
        return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        document: documentData,
        filePath: filePath
      });
    } else if (applicationId) {
      // 申込用の書類
      const { data: documentData, error: dbError } = await supabase
        .from('application_documents')
        .insert([{
          application_id: applicationId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // アップロードしたファイルを削除
        await supabase.storage.from('documents').remove([filePath]);
        return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        document: documentData,
        filePath: filePath
      });
    } else {
      return NextResponse.json({ error: 'storeProfileId or applicationId is required' }, { status: 400 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    const documentId = searchParams.get('documentId');
    const table = searchParams.get('table'); // 'store_documents' or 'application_documents'

    if (!filePath || !documentId || !table) {
      return NextResponse.json({ error: 'filePath, documentId, and table are required' }, { status: 400 });
    }

    // データベースから削除
    const { error: dbError } = await supabase
      .from(table)
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json({ error: 'Failed to delete document record' }, { status: 500 });
    }

    // ストレージから削除
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // データベースは削除済みなので、エラーを返すがファイルは残る
      return NextResponse.json({ error: 'Failed to delete file from storage' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
