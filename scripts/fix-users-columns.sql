ALTER TABLE users ADD COLUMN IF NOT EXISTS "logoPlacement" varchar(20) DEFAULT 'cover';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "selectedModelId" varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "openRouterApiKey" text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "quotaLimitUsd" integer DEFAULT 50;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "currentUsageUsd" integer DEFAULT 0;
