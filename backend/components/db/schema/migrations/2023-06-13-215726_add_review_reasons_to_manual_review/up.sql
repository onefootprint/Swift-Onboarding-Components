ALTER TABLE manual_review ADD COLUMN review_reasons TEXT[] NOT NULL DEFAULT CAST(ARRAY[] AS TEXT[]);
ALTER TABLE manual_review ALTER COLUMN review_reasons DROP DEFAULT;