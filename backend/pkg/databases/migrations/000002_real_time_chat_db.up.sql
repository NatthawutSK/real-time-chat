BEGIN;

INSERT INTO "users" ("username", "password", "email")
VALUES
  ('john_doe', 'password123', 'john@example.com');


COMMIT;
