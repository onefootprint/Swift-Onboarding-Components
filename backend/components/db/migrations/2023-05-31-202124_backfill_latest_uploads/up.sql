-- This is crazy - i need the old dl.id from which the new DL is derived in order to locate the old doc...
-- Never do anything like this again
ALTER TABLE data_lifetime ADD COLUMN temp_link_dl_id TEXT;

WITH new_dls AS (
    INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind, temp_link_dl_id)
        SELECT 
            dl.vault_id,
            dl.scoped_vault_id,
            dl.created_at,
            dl.portablized_at,
            dl.deactivated_at,
            dl.created_seqno,
            dl.portablized_seqno,
            dl.deactivated_seqno,
            CASE
                WHEN doc.kind = 'passport' THEN 'document.latest_upload.passport.front' -- One custom translation
                ELSE 'document.latest_upload.' || doc.kind
            END,
            dl.id  -- Use the old DL id to link back to the old document
        FROM document_data doc
        INNER JOIN data_lifetime dl
            ON doc.lifetime_id = dl.id
        WHERE doc.kind IN ('passport', 'passport.selfie', 'drivers_license.front', 'drivers_license.back', 'drivers_license.selfie', 'id_card.front', 'id_card.back', 'id_card.selfie')
    RETURNING data_lifetime.id, data_lifetime.kind, data_lifetime.temp_link_dl_id
)
INSERT INTO document_data(lifetime_id, kind, mime_type, filename, s3_url, e_data_key)
    SELECT
        new_dls.id,
        REPLACE(new_dls.kind, 'document.', ''),
        doc.mime_type,
        doc.filename,
        doc.s3_url,
        doc.e_data_key
    FROM new_dls
    INNER JOIN document_data doc
        ON doc.lifetime_id = new_dls.temp_link_dl_id;

COMMIT;
BEGIN;

ALTER TABLE data_lifetime DROP COLUMN temp_link_dl_id;