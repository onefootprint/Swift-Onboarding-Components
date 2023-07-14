ALTER TABLE identity_document
ADD COLUMN completed_seqno BIGINT;


-- Backfill completed_seqno. This is technically not totally backwards compatible since old server versions are missing the application code that populates completed_seqno,
-- but we have such little traffic right now that this is fine.

UPDATE identity_document id_doc
SET completed_seqno = dl.created_seqno
FROM document_request dr
INNER JOIN data_lifetime dl
    ON dl.scoped_vault_id = dr.scoped_vault_id
WHERE
    id_doc.request_id = dr.id AND
    id_doc.completed_seqno IS NULL AND
    -- Find the DL that has the expected DI
    dl.kind = 'document.' || CASE WHEN id_doc.document_type = 'driver_license' THEN 'drivers_license' ELSE id_doc.document_type END || '.document_number';

-- Since we haven't extracted OCR data for every image, as a backup, backfill the id doc completed_seqno with the seqno used to create the image
UPDATE identity_document id_doc
SET completed_seqno = dl.created_seqno
FROM document_request dr
INNER JOIN data_lifetime dl
    ON dl.scoped_vault_id = dr.scoped_vault_id
WHERE
    id_doc.request_id = dr.id AND
    id_doc.completed_seqno IS NULL AND
    -- Find the DL that has the expected DI
    dl.kind = 'document.' || CASE WHEN id_doc.document_type = 'driver_license' THEN 'drivers_license' ELSE id_doc.document_type END || '.front.image';

-- After this runs, need to check that all id docs with a completed document requests also have a completed_seqno
