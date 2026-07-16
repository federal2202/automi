-- Add tokenVersion to users for refresh-token revocation.
-- Existing rows default to 0, matching every already-issued refresh token
-- (which predates this column and therefore implicitly carries version 0).
ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
