BEGIN;

--Set timezone
SET TIME ZONE 'Asia/Bangkok';

--Install uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--users_id -> U000001
--Create sequence
CREATE SEQUENCE users_id_seq START WITH 1 INCREMENT BY 1;

--Auto update
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TABLE "users" (
  "id" VARCHAR(7) PRIMARY KEY DEFAULT CONCAT('U', LPAD(NEXTVAL('users_id_seq')::TEXT, 6, '0')),
  "username" VARCHAR UNIQUE NOT NULL,
  "password" VARCHAR NOT NULL,
  "email" VARCHAR UNIQUE NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "oauth" (
  "id" uuid NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" VARCHAR NOT NULL,
  "access_token" VARCHAR NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "oauth" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id")  ON DELETE CASCADE;


CREATE TRIGGER set_updated_at_timestamp_users_table BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE set_updated_at_column();
CREATE TRIGGER set_updated_at_timestamp_oauth_table BEFORE UPDATE ON "oauth" FOR EACH ROW EXECUTE PROCEDURE set_updated_at_column();

COMMIT;