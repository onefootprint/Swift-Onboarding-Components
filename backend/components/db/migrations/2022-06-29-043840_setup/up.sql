CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION random_string( int ) RETURNS TEXT as $$
    SELECT string_agg(substring('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', round(random() * 62)::integer, 1), '') FROM generate_series(1, $1);
$$ language sql;

CREATE FUNCTION prefixed_uid(prefix VARCHAR(8)) 
    returns text 
    language plpgsql as $$ 
        begin return CONCAT(prefix, random_string(22));
    end; 
$$; 