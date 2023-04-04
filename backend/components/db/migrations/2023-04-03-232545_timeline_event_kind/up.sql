ALTER TABLE user_timeline ADD COLUMN event_kind TEXT;

UPDATE user_timeline SET event_kind = event->>'kind';

ALTER TABLE user_timeline ALTER COLUMN event_kind SET NOT NULL;