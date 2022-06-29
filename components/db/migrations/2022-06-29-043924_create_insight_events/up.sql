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
    user_agent VARCHAR(250),
    city VARCHAR(250),
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW()
);

SELECT diesel_manage_updated_at('insight_events');