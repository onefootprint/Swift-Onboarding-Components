UPDATE document_upload du
SET created_seqno = dl.created_seqno
FROM identity_document id_doc
INNER JOIN document_request dr
    ON id_doc.request_id = dr.id
INNER JOIN data_lifetime dl
    ON dl.scoped_vault_id = dr.scoped_vault_id
WHERE
    du.created_seqno IS NULL AND
    id_doc.id = du.document_id AND
    -- Find the DL that has the expected DI
    -- This doesn't technically uniquely identify a single DL if there are multiple uploads - but there are only 3 DocumentUploads in prod that have multiple DLs. I can fix those manually
    dl.kind = 'document.' || CASE WHEN id_doc.document_type = 'driver_license' THEN 'drivers_license' ELSE id_doc.document_type END || '.' || du.side || '.latest_upload';

-- We have these, but it's a huuuuge pain to backfill... We save the failure reasons on the event we transition into, not the event we transition out of.
-- So need to somehow find the event that came after the state that corresponds to the document's side.
-- Empty isn't a huge deal for our fixture data.
UPDATE document_upload
SET failure_reasons = ARRAY[]::TEXT[]
WHERE document_upload.failure_reasons IS NULL;

ALTER TABLE document_upload
    ALTER COLUMN created_seqno SET NOT NULL,
    ALTER COLUMN failure_reasons SET NOT NULL;

-- Tested with
-- select created_seqno, scoped_vault_id, id_doc.document_type, document_upload.side from document_upload inner join identity_document id_doc on id_doc.id = document_upload.document_id inner join document_request dr on dr.id = id_doc.request_id limit 5;
-- select created_seqno from data_lifetime where scoped_vault_id = 'su_wqb7nfOmcqTjR5VM1CswBD' and kind = 'document.drivers_license.selfie.latest_upload';