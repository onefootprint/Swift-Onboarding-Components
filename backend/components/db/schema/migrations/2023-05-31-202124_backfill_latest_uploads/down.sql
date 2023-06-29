-- delete all latest_upload DLs and docs

DELETE FROM document_data WHERE lifetime_id IN (SELECT id FROM data_lifetime WHERE kind LIKE 'document.latest_upload%');
DELETE FROM data_lifetime WHERE kind LIKE 'document.latest_upload%';