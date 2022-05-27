
CREATE TABLE insight_events (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),    
    timestamp timestamp NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(250),
    country VARCHAR(250),
    region VARCHAR(250),
    region_name VARCHAR(250),
    latitude double precision,
    longitude double precision,
    metro_code VARCHAR(250),
    postal_code VARCHAR(250),
    time_zone VARCHAR(250),
    user_agent VARCHAR(250)
);

ALTER TABLE onboardings
ADD COLUMN start_insight_event_id uuid,
ADD COLUMN liveness_insight_event_id uuid,
ADD CONSTRAINT fk_start_insight_event
    FOREIGN KEY(start_insight_event_id)
    REFERENCES insight_events(id),
ADD CONSTRAINT fk_liveness_insight_event
    FOREIGN KEY(liveness_insight_event_id)
    REFERENCES insight_events(id);


ALTER TABLE access_events
ADD COLUMN insight_event_id uuid,
ADD CONSTRAINT fk_insight_event
    FOREIGN KEY(insight_event_id)
    REFERENCES insight_events(id);