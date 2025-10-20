# LINE ミニアプリ - イベント出店・主催プラットフォーム

LINE ミニアプリ（LIFF）を使用したイベント出店・主催プラットフォームです。店舗側はイベントに出店申し込みができ、主催側はイベントを掲載・管理できます。

## 🚀 機能

### 店舗側機能
- **ユーザー登録**: 基本情報入力と書類アップロード
- **書類管理**: 営業許可証、車検証、PL保険等の書類をアップロード
- **AI書類処理**: OpenAI APIを使用した書類の自動検証
- **イベント一覧**: 出店可能なイベントの確認
- **出店申し込み**: イベントへの出店申し込み機能

### 主催側機能
- **ユーザー登録**: 会社情報の登録
- **イベント掲載**: イベントの作成・公開
- **イベント管理**: 掲載中のイベントの管理
- **申し込み確認**: 出店申し込みの確認・承認

## 🛠 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: LINE LIFF SDK
- **AI処理**: OpenAI GPT-4 Vision API
- **デプロイ**: Vercel
- **ファイルストレージ**: Supabase Storage

## 📋 必要な環境変数

```env
# LINE LIFF設定
NEXT_PUBLIC_LIFF_ID=your_liff_id_here

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI設定
OPENAI_API_KEY=your_openai_api_key_here

# 開発環境設定
NODE_ENV=development
```

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd line-miniapp
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp env.example .env.local
# .env.localファイルを編集して必要な環境変数を設定
```

### 4. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/schema.sql`を実行してデータベーススキーマを作成
3. Storageバケットを作成（書類アップロード用）

### 5. LINE Developers Consoleのセットアップ

1. [LINE Developers Console](https://developers.line.biz)でチャンネルを作成
2. LIFFアプリを作成し、LIFF IDを取得
3. エンドポイントURLを設定（開発時はngrok等を使用）

### 6. OpenAI APIのセットアップ

1. [OpenAI Platform](https://platform.openai.com)でAPIキーを取得
2. GPT-4 Vision APIのアクセス権限を確認

### 7. 開発サーバーの起動

```bash
npm run dev
```

## 📱 LIFF設定

### 必要な設定

1. **LIFFアプリの作成**
   - チャンネル: LINE Login
   - LIFFアプリ名: イベントプラットフォーム
   - サイズ: Full
   - エンドポイントURL: `https://your-domain.vercel.app`

2. **Bot設定**
   - メッセージ送信機能を有効化
   - Webhook URLを設定（必要に応じて）

## 🗄 データベーススキーマ

### 主要テーブル

- `users`: ユーザー基本情報
- `store_users`: 店舗ユーザー詳細情報
- `organizer_users`: 主催ユーザー詳細情報
- `documents`: 書類管理
- `events`: イベント情報
- `event_applications`: イベント申し込み
- `terms_agreements`: 利用規約同意履歴

詳細は`supabase/schema.sql`を参照してください。

## 🤖 AI機能

### 書類処理

OpenAI GPT-4 Vision APIを使用して以下の書類を自動処理：

- **営業許可証**: 有効性、有効期限の確認
- **車検証**: 車検有効期限の確認
- **自動車検査証記録事項**: 車検証との整合性確認
- **PL保険**: 保険期間、保険金額の確認
- **火気類配置図**: 図面の妥当性確認

### 処理フロー

1. ユーザーが書類画像をアップロード
2. Base64エンコードしてOpenAI APIに送信
3. AIが書類の内容を解析・検証
4. 結果をデータベースに保存
5. ユーザーに結果を表示

## 🚀 デプロイ

### Vercelデプロイ

1. **プロジェクトのインポート**
   ```bash
   vercel --prod
   ```

2. **環境変数の設定**
   Vercelダッシュボードで環境変数を設定

3. **カスタムドメインの設定**（オプション）
   Vercelダッシュボードでカスタムドメインを設定

### デプロイ後の設定

1. **LIFFエンドポイントURLの更新**
   - LINE Developers Consoleで本番URLを設定

2. **Supabase RLSポリシーの確認**
   - 本番環境でのセキュリティ設定を確認

3. **OpenAI API制限の確認**
   - 本番環境でのAPI制限を確認

## 📊 監視・ログ

### Vercel Analytics

- パフォーマンス監視
- エラー追跡
- ユーザー行動分析

### Supabase Dashboard

- データベース監視
- リアルタイムログ
- パフォーマンス分析

## 🔒 セキュリティ

### 実装済みのセキュリティ機能

- **Row Level Security (RLS)**: Supabaseでのデータアクセス制御
- **LIFF認証**: LINE公式アカウントでの認証
- **ファイルアップロード制限**: ファイルサイズ・形式の制限
- **入力値検証**: フロントエンド・バックエンドでの検証

### 推奨事項

- 定期的なセキュリティアップデート
- APIキーの適切な管理
- ログの監視・分析

## 🧪 テスト

### テスト実行

```bash
# 型チェック
npm run type-check

# リンティング
npm run lint
```

### 手動テスト

1. **LIFF認証テスト**
   - LINEアプリ内での認証フロー
   - 外部ブラウザでの動作確認

2. **機能テスト**
   - ユーザー登録フロー
   - 書類アップロード・AI処理
   - イベント申し込み・管理

## 📝 開発ガイドライン

### コーディング規約

- TypeScriptの厳密な型定義
- ESLint + Prettierによるコードフォーマット
- コンポーネントの再利用性を重視

### ファイル構成

```
├── app/                 # Next.js App Router
├── components/          # Reactコンポーネント
├── lib/                 # ライブラリ・ユーティリティ
├── types/               # TypeScript型定義
├── supabase/            # データベーススキーマ
└── public/              # 静的ファイル
```

## 🤝 コントリビューション

1. フォークしてブランチを作成
2. 機能を実装・テスト
3. プルリクエストを作成

## 📄 ライセンス

MIT License

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesで報告してください。

---

## 🎯 今後の拡張予定

- [ ] プッシュ通知機能
- [ ] 決済機能の統合
- [ ] 多言語対応
- [ ] 管理画面の拡張
- [ ] 分析・レポート機能
- [ ] モバイルアプリ版
