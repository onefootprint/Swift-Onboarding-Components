CREATE TABLE custom_migration (
    version text PRIMARY KEY,
    run_on timestamptz NOT NULL DEFAULT NOW()
);
