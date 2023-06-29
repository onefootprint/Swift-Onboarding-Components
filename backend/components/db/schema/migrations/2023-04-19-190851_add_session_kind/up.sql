-- Nullable for now because we can't backfill. Can make non-null after all old sessions expire
ALTER TABLE session ADD COLUMN kind TEXT;