-- store_profilesテーブルに画像URLカラムを追加
ALTER TABLE store_profiles 
ADD COLUMN business_license_url TEXT,
ADD COLUMN tax_certificate_url TEXT,
ADD COLUMN insurance_certificate_url TEXT,
ADD COLUMN product_photos_url TEXT;

-- カラムにコメントを追加
COMMENT ON COLUMN store_profiles.business_license_url IS '営業許可証の画像URL';
COMMENT ON COLUMN store_profiles.tax_certificate_url IS '納税証明書の画像URL';
COMMENT ON COLUMN store_profiles.insurance_certificate_url IS '保険加入証明書の画像URL';
COMMENT ON COLUMN store_profiles.product_photos_url IS '商品写真の画像URL';
