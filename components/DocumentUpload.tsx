'use client';

import { useState } from 'react';
import { DocumentType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DocumentUploadProps {
  documentType: DocumentType;
  label: string;
  required?: boolean;
  onUpload: (file: File) => Promise<void>;
  onProcess: (file: File) => Promise<any>;
  isProcessing?: boolean;
  processingResult?: any;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  label,
  required = false,
  onUpload,
  onProcess,
  isProcessing = false,
  processingResult,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（5MB制限）
      if (file.size > 5 * 1024 * 1024) {
        setError('ファイルサイズは5MB以下にしてください');
        return;
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('JPEG、PNG、PDF形式のファイルのみアップロード可能です');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(selectedFile);
    } catch (error) {
      console.error('アップロードエラー:', error);
      setError(error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    try {
      await onProcess(selectedFile);
    } catch (error) {
      console.error('処理エラー:', error);
      setError(error instanceof Error ? error.message : '書類の処理に失敗しました');
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) return '🔄';
    if (processingResult?.validity?.is_valid) return '✅';
    if (processingResult?.validity?.is_valid === false) return '❌';
    return '📄';
  };

  const getStatusMessage = () => {
    if (isProcessing) return 'AI処理中...';
    if (processingResult?.validity?.is_valid) return '有効な書類です';
    if (processingResult?.validity?.is_valid === false) {
      return `無効な書類: ${processingResult.validity.issues?.join(', ')}`;
    }
    return 'アップロード待ち';
  };

  const getStatusColor = () => {
    if (isProcessing) return 'text-blue-600';
    if (processingResult?.validity?.is_valid) return 'text-green-600';
    if (processingResult?.validity?.is_valid === false) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          {getStatusIcon()} {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            PDF、JPG、PNG形式に対応（最大5MB）
          </p>
        </div>

        {selectedFile && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  loading={isUploading}
                  variant="secondary"
                  size="sm"
                >
                  アップロード
                </Button>
                <Button
                  onClick={handleProcess}
                  loading={isProcessing}
                  variant="primary"
                  size="sm"
                >
                  AI処理
                </Button>
              </div>
            </div>
          </div>
        )}

        {processingResult && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">AI処理結果</h4>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">信頼度:</span>
                <span className="ml-2">
                  {Math.round((processingResult.confidence_score || 0) * 100)}%
                </span>
              </div>
              
              {processingResult.validity?.expiration_date && (
                <div>
                  <span className="font-medium">有効期限:</span>
                  <span className="ml-2">{processingResult.validity.expiration_date}</span>
                </div>
              )}
              
              {processingResult.extracted_text && (
                <div>
                  <span className="font-medium">抽出テキスト:</span>
                  <p className="mt-1 p-2 bg-white rounded border text-xs">
                    {processingResult.extracted_text.slice(0, 200)}
                    {processingResult.extracted_text.length > 200 && '...'}
                  </p>
                </div>
              )}
              
              {processingResult.validity?.issues && processingResult.validity.issues.length > 0 && (
                <div>
                  <span className="font-medium text-red-700">問題点:</span>
                  <ul className="mt-1 list-disc list-inside text-red-600">
                    {processingResult.validity.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
