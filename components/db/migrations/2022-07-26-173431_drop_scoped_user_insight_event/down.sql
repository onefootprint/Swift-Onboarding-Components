ALTER TABLE scoped_users ADD COLUMN insight_event_id uuid;

-- Backfill the scoped_users.insight_event_id column with the insight event from the first
-- onboarding for each scoped user
UPDATE scoped_users SET insight_event_id = o1.insight_event_id
    FROM onboardings o1
    FULL JOIN onboardings o2
        ON o1.scoped_user_id = o2.scoped_user_id
        AND o1.start_timestamp > o2.start_timestamp
    WHERE o2.id IS NULL AND o1.scoped_user_id=scoped_users.id;
      
ALTER TABLE scoped_users ALTER COLUMN insight_event_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS scoped_users_insight_event_id ON scoped_users(insight_event_id);
ALTER TABLE scoped_users ADD CONSTRAINT fk_scoped_users_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id)