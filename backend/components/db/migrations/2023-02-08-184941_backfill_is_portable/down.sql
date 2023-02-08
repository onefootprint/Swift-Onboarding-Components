-- Don't need to completely revert the up.sql logic since re-running the backfill will
-- correct everything
UPDATE user_timeline SET is_portable = 'f';