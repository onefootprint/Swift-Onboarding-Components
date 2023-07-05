UPDATE document_data
SET kind = REPLACE(kind, 'document.', '')
WHERE kind ILIKE 'document.%';