BEGIN;

TRUNCATE TABLE "users" CASCADE;
TRUNCATE TABLE "oauth" CASCADE;

COMMIT;
