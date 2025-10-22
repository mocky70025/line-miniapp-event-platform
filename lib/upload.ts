// ファイルアップロード用のヘルパー関数

export interface UploadResult {
  success: boolean;
  document?: any;
  filePath?: string;
  error?: string;
}

export class UploadService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://line-miniapp-event-platform-5na3.vercel.app' 
      : 'http://localhost:3000';
  }

  async uploadFile(
    file: File, 
    documentType: string, 
    storeProfileId?: string, 
    applicationId?: string
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (storeProfileId) {
        formData.append('storeProfileId', storeProfileId);
      } else if (applicationId) {
        formData.append('applicationId', applicationId);
      } else {
        throw new Error('storeProfileId or applicationId is required');
      }

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }

      return {
        success: true,
        document: result.document,
        filePath: result.filePath
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteFile(filePath: string, documentId: string, table: string): Promise<UploadResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/upload?filePath=${encodeURIComponent(filePath)}&documentId=${documentId}&table=${table}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Delete failed'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ファイルサイズをフォーマット
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ファイル形式をチェック
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // ファイルサイズをチェック
  validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
    const maxSize = maxSizeInMB * 1024 * 1024; // MB to bytes
    return file.size <= maxSize;
  }

  // ファイル名をサニタイズ
  sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}

export const uploadService = new UploadService();
