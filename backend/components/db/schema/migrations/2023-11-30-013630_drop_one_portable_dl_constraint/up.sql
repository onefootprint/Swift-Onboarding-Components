-- NOTE this has to normally happen CONCURRENTLY...  can't do that with diesel, so i dropped them manually in dev and prod
DROP INDEX IF EXISTS unique_portable_data_lifetime_per_user_vault;