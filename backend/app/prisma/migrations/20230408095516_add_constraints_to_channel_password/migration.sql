-- This is an empty migration.
ALTER TABLE "Channels" ADD CONSTRAINT "Channels_password_constraint" CHECK ("type" <> 'PROTECTED' OR "password" IS NOT NULL);