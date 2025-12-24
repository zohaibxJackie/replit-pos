--> Add shop_type and currency_code columns to shops table
ALTER TABLE shops
ADD COLUMN shop_type VARCHAR(50),
ADD COLUMN currency_code VARCHAR(10);

--> Add currency_code columns to users table
ALTER TABLE users
ADD COLUMN currency_code VARCHAR(10);