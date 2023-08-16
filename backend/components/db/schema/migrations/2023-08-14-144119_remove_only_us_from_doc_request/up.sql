-- backfill US
UPDATE document_request
SET country_restrictions = ARRAY ['US']
WHERE document_request.only_us = true;

-- empty array for no country restrictions
UPDATE document_request
SET country_restrictions = array[]::varchar[]
WHERE document_request.only_us = false;


ALTER TABLE document_request DROP COLUMN only_us;