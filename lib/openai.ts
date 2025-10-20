import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DocumentProcessingResult {
  extracted_text: string;
  validity: {
    is_valid: boolean;
    expiration_date?: string;
    issues?: string[];
  };
  confidence_score: number;
  metadata: Record<string, any>;
}

export class OpenAIService {
  /**
   * 書類画像からテキストを抽出し、有効性を検証
   */
  async processDocument(
    imageBase64: string,
    documentType: string,
    fileName: string
  ): Promise<DocumentProcessingResult> {
    try {
      // 書類タイプ別のプロンプトを生成
      const prompt = this.generatePrompt(documentType);

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI APIからレスポンスが返されませんでした');
      }

      // JSONレスポンスをパース
      const result = JSON.parse(content);
      
      return {
        extracted_text: result.extracted_text || '',
        validity: {
          is_valid: result.validity?.is_valid || false,
          expiration_date: result.validity?.expiration_date,
          issues: result.validity?.issues || [],
        },
        confidence_score: result.confidence_score || 0,
        metadata: {
          document_type: documentType,
          file_name: fileName,
          processed_at: new Date().toISOString(),
          model_used: 'gpt-4-vision-preview',
        },
      };

    } catch (error) {
      console.error('OpenAI API エラー:', error);
      throw new Error('書類の処理に失敗しました');
    }
  }

  /**
   * 書類タイプ別のプロンプトを生成
   */
  private generatePrompt(documentType: string): string {
    const basePrompt = `
あなたは日本の書類を専門に処理するAIアシスタントです。
与えられた画像から書類の内容を読み取り、有効性を検証してください。

以下のJSON形式で回答してください：
{
  "extracted_text": "抽出されたテキスト内容",
  "validity": {
    "is_valid": true/false,
    "expiration_date": "有効期限（YYYY-MM-DD形式、該当する場合のみ）",
    "issues": ["問題点のリスト（該当する場合のみ）"]
  },
  "confidence_score": 0.0-1.0の信頼度スコア
}

`;

    switch (documentType) {
      case 'business_license':
        return basePrompt + `
この書類は営業許可証です。以下の点を確認してください：
- 営業許可証として有効な書類か
- 有効期限が切れていないか
- 必要な情報（許可番号、許可年月日、許可者名等）が記載されているか
- 書類の形式が正しいか

`;

      case 'vehicle_inspection':
        return basePrompt + `
この書類は車検証です。以下の点を確認してください：
- 車検証として有効な書類か
- 車検の有効期限が切れていないか
- 必要な情報（車台番号、車検証番号、有効期限等）が記載されているか
- 書類の形式が正しいか

`;

      case 'inspection_record':
        return basePrompt + `
この書類は自動車検査証記録事項です。以下の点を確認してください：
- 自動車検査証記録事項として有効な書類か
- 車検証と整合性があるか
- 必要な情報（車台番号、検査年月日等）が記載されているか
- 書類の形式が正しいか

`;

      case 'pl_insurance':
        return basePrompt + `
この書類はPL保険（生産物責任保険）の証明書です。以下の点を確認してください：
- PL保険の証明書として有効な書類か
- 保険の有効期限が切れていないか
- 必要な情報（保険会社名、保険期間、保険金額等）が記載されているか
- 書類の形式が正しいか

`;

      case 'fire_layout':
        return basePrompt + `
この書類は火気類配置図です。以下の点を確認してください：
- 火気類配置図として有効な書類か
- 適切な図面が記載されているか
- 必要な情報（施設名、作成日、承認印等）が記載されているか
- 書類の形式が正しいか

`;

      default:
        return basePrompt + `
この書類を読み取り、有効性を検証してください。
`;

    }
  }

  /**
   * テキストから書類情報を抽出（PDF等のテキストベース書類用）
   */
  async extractTextFromDocument(
    text: string,
    documentType: string
  ): Promise<DocumentProcessingResult> {
    try {
      const prompt = this.generateTextPrompt(documentType, text);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI APIからレスポンスが返されませんでした');
      }

      const result = JSON.parse(content);
      
      return {
        extracted_text: result.extracted_text || text,
        validity: {
          is_valid: result.validity?.is_valid || false,
          expiration_date: result.validity?.expiration_date,
          issues: result.validity?.issues || [],
        },
        confidence_score: result.confidence_score || 0,
        metadata: {
          document_type: documentType,
          processed_at: new Date().toISOString(),
          model_used: 'gpt-4',
          processing_type: 'text_extraction',
        },
      };

    } catch (error) {
      console.error('OpenAI API エラー:', error);
      throw new Error('書類のテキスト処理に失敗しました');
    }
  }

  /**
   * テキスト処理用のプロンプトを生成
   */
  private generateTextPrompt(documentType: string, text: string): string {
    return `
以下の書類テキストを分析し、有効性を検証してください。

書類タイプ: ${documentType}
書類テキスト:
${text}

以下のJSON形式で回答してください：
{
  "extracted_text": "抽出された重要な情報",
  "validity": {
    "is_valid": true/false,
    "expiration_date": "有効期限（YYYY-MM-DD形式、該当する場合のみ）",
    "issues": ["問題点のリスト（該当する場合のみ）"]
  },
  "confidence_score": 0.0-1.0の信頼度スコア
}
`;
  }

  /**
   * 複数の書類を一括処理
   */
  async processMultipleDocuments(
    documents: Array<{
      imageBase64?: string;
      text?: string;
      documentType: string;
      fileName: string;
    }>
  ): Promise<DocumentProcessingResult[]> {
    const results: DocumentProcessingResult[] = [];

    for (const doc of documents) {
      try {
        let result: DocumentProcessingResult;
        
        if (doc.imageBase64) {
          result = await this.processDocument(doc.imageBase64, doc.documentType, doc.fileName);
        } else if (doc.text) {
          result = await this.extractTextFromDocument(doc.text, doc.documentType);
        } else {
          throw new Error('画像またはテキストが必要です');
        }
        
        results.push(result);
      } catch (error) {
        console.error(`書類処理エラー (${doc.fileName}):`, error);
        // エラーが発生した書類はスキップして続行
        results.push({
          extracted_text: '',
          validity: {
            is_valid: false,
            issues: ['処理エラーが発生しました'],
          },
          confidence_score: 0,
          metadata: {
            document_type: doc.documentType,
            file_name: doc.fileName,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return results;
  }
}

export const openaiService = new OpenAIService();
