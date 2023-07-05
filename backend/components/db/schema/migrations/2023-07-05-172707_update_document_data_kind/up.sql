UPDATE document_data
SET kind = 'document.' || kind
WHERE
    kind NOT ILIKE 'document.%' AND
    kind NOT ILIKE 'custom.%';