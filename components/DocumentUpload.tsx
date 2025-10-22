'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface DocumentUploadProps {
  title: string;
  description: string;
  required: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // MB
  onUpload: (file: File | null) => void;
  uploadedFile?: File | null;
  uploadedUrl?: string;
  isUploading?: boolean;
}

export default function DocumentUpload({
  title,
  description,
  required,
  acceptedTypes = ['image/*', 'application/pdf'],
  maxSize = 10,
  onUpload,
  uploadedFile,
  uploadedUrl,
  isUploading = false
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);

    // ファイルサイズチェック
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ファイルサイズが${maxSize}MBを超えています`);
      return;
    }

    // ファイル形式チェック
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      setError('対応していないファイル形式です');
      return;
    }

    // ファイルをローカル状態に設定（非同期）
    await onUpload(file);
  };

  const openFileDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUpload(null);
    setError(null);
  };

  const isProcessing = uploading || isUploading;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {(uploadedFile || uploadedUrl) ? (
          <div className="border border-green-200 bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-green-800">
                    {uploadedFile ? uploadedFile.name : 'アップロード済みファイル'}
                  </p>
                  {uploadedFile && (
                    <p className="text-sm text-green-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  {uploadedUrl && (
                    <p className="text-sm text-green-600">
                      アップロード済み
                    </p>
                  )}
                  {isProcessing && (
                    <p className="text-xs text-green-600">
                      {uploading ? 'アップロード中...' : '処理中...'}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={removeFile}
                variant="secondary"
                size="sm"
                disabled={isProcessing}
                onMouseDown={(e) => e.preventDefault()}
              >
                削除
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium">ファイルをドラッグ&ドロップ</p>
                <p>または</p>
                <Button
                  type="button"
                  onClick={openFileDialog}
                  variant="secondary"
                  size="sm"
                  disabled={isProcessing}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  ファイルを選択
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                対応形式: {acceptedTypes.join(', ')} (最大{maxSize}MB)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={isProcessing}
        />
      </div>
    </Card>
  );
}