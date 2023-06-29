-- First, we create a new data_lifetime for each of the new rows that we'll end up inserting into
-- document_data. Instead of making this generic, just running one query

-- Front passport
INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.passport'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'passport' AND doc.front_image_s3_url IS NOT NULL;

-- Front driver's license
INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.drivers_license_front'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'driver_license' AND doc.front_image_s3_url IS NOT NULL;
-- Back driver's license
INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.drivers_license_back'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'driver_license' AND doc.back_image_s3_url IS NOT NULL;

-- Front id card
INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.id_card_front'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'id_card' AND doc.front_image_s3_url IS NOT NULL;
-- Back id card
INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.id_card_back'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'id_card' AND doc.back_image_s3_url IS NOT NULL;

-- Selfie
INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.drivers_license_selfie'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'driver_license' AND doc.selfie_image_s3_url IS NOT NULL;

INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.id_card_selfie'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'id_card' AND doc.selfie_image_s3_url IS NOT NULL;

INSERT INTO data_lifetime(vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind)
    SELECT dl.vault_id, dl.scoped_vault_id, dl.created_at, dl.portablized_at, dl.deactivated_at, dl.created_seqno, dl.portablized_seqno, dl.deactivated_seqno, 'document.passport_selfie'
    FROM identity_document doc INNER JOIN data_lifetime dl ON dl.id = doc.lifetime_id
    WHERE doc.document_type = 'passport' AND doc.selfie_image_s3_url IS NOT NULL;

-- Then, we create a new document_data row for each of the front, back, selfie images with the DLs
-- we created above

-- Front images
INSERT INTO document_data(lifetime_id, kind, mime_type, filename, s3_url, e_data_key)
    SELECT
        dl.id,
        CASE
            WHEN document_type = 'id_card' THEN 'id_card_front' -- change
            WHEN document_type = 'driver_license' THEN 'drivers_license_front' -- change
            WHEN document_type = 'passport' THEN 'passport' -- change
            ELSE 'blerp'
        END,
        'image/png',
        'front.png', -- change
        doc.front_image_s3_url,
        doc.e_data_key
    FROM identity_document doc
    INNER JOIN data_lifetime existing_dl
        ON doc.lifetime_id = existing_dl.id
    -- Find the dl for this kind that we just created above
    INNER JOIN data_lifetime dl
        ON dl.kind = CASE
            WHEN document_type = 'id_card' THEN 'document.id_card_front' -- change
            WHEN document_type = 'driver_license' THEN 'document.drivers_license_front' -- change
            WHEN document_type = 'passport' THEN 'document.passport' -- change
            ELSE 'blerp'
        END
        AND dl.created_seqno = existing_dl.created_seqno 
        AND dl.scoped_vault_id = existing_dl.scoped_vault_id 
        AND dl.vault_id = existing_dl.vault_id 
    WHERE front_image_s3_url IS NOT NULL;


-- Back images
INSERT INTO document_data(lifetime_id, kind, mime_type, filename, s3_url, e_data_key)
    SELECT
        dl.id,
        CASE
            WHEN document_type = 'id_card' THEN 'id_card_back' -- change
            WHEN document_type = 'driver_license' THEN 'drivers_license_back' -- change
            ELSE 'blerp'
        END,
        'image/png',
        'back.png', -- change
        doc.back_image_s3_url,
        doc.e_data_key
    FROM identity_document doc
    INNER JOIN data_lifetime existing_dl
        ON doc.lifetime_id = existing_dl.id
    -- Find the dl for this kind that we just created above
    INNER JOIN data_lifetime dl
        ON dl.kind = CASE
            WHEN document_type = 'id_card' THEN 'document.id_card_back' -- change
            WHEN document_type = 'driver_license' THEN 'document.drivers_license_back' -- change
            ELSE 'blerp'
        END
        AND dl.created_seqno = existing_dl.created_seqno 
        AND dl.scoped_vault_id = existing_dl.scoped_vault_id 
        AND dl.vault_id = existing_dl.vault_id 
    WHERE back_image_s3_url IS NOT NULL;


-- Selfie images
INSERT INTO document_data(lifetime_id, kind, mime_type, filename, s3_url, e_data_key)
    SELECT
        dl.id,
        CASE
            WHEN document_type = 'id_card' THEN 'id_card_selfie' -- change
            WHEN document_type = 'passport' THEN 'passport_selfie' -- change
            WHEN document_type = 'driver_license' THEN 'drivers_license_selfie' -- change
            ELSE 'blerp'
        END,
        'image/png',
        'selfie.png',
        doc.selfie_image_s3_url,
        doc.e_data_key
    FROM identity_document doc
    INNER JOIN data_lifetime existing_dl
        ON doc.lifetime_id = existing_dl.id
    -- Find the dl for this kind that we just created above
    INNER JOIN data_lifetime dl
        ON dl.kind = CASE
            WHEN document_type = 'id_card' THEN 'document.id_card_selfie' -- change
            WHEN document_type = 'driver_license' THEN 'document.drivers_license_selfie' -- change
            WHEN document_type = 'passport' THEN 'document.passport_selfie' -- change
            ELSE 'blerp'
        END
        AND dl.created_seqno = existing_dl.created_seqno 
        AND dl.scoped_vault_id = existing_dl.scoped_vault_id 
        AND dl.vault_id = existing_dl.vault_id 
    WHERE selfie_image_s3_url IS NOT NULL;

--
-- Now we do our schema migrations!
--

-- First create a backup
CREATE TABLE IF NOT EXISTS identity_document_backup AS SELECT * FROM identity_document;
ALTER TABLE identity_document_backup ADD PRIMARY KEY (id);
SELECT diesel_manage_updated_at('identity_document_backup');

-- Backup then delete data liftimes for these dropped id docs
CREATE TABLE IF NOT EXISTS data_lifetime_backup AS SELECT * FROM data_lifetime WHERE id IN (SELECT lifetime_id FROM identity_document);
ALTER TABLE data_lifetime_backup ADD CONSTRAINT data_lifetime_backup_pk PRIMARY KEY (id);
SELECT diesel_manage_updated_at('data_lifetime_backup');

COMMIT;
-- This is a hack - for some reason, running the following inside of the same transaction where we delete from data_lifetime makes
-- postgres triggers unhappy. So we escape the txn for a bit

-- Migrate the identity_document table
ALTER table identity_document  DROP COLUMN lifetime_id;

BEGIN;

DELETE FROM data_lifetime WHERE id IN (SELECT lifetime_id FROM identity_document_backup); 

ALTER table identity_document 
    DROP COLUMN front_image_s3_url,
    DROP COLUMN back_image_s3_url,
    DROP COLUMN selfie_image_s3_url;

ALTER TABLE identity_document ADD COLUMN front_lifetime_id TEXT;
ALTER TABLE identity_document   
    ADD CONSTRAINT fk_identity_document_front_lifetime_id
        FOREIGN KEY(front_lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;
    
ALTER TABLE identity_document ADD COLUMN back_lifetime_id TEXT;
ALTER TABLE identity_document   
    ADD CONSTRAINT fk_identity_document_back_lifetime_id
        FOREIGN KEY(back_lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE identity_document ADD COLUMN selfie_lifetime_id TEXT;
ALTER TABLE identity_document   
    ADD CONSTRAINT fk_identity_document_selfie_lifetime_id
        FOREIGN KEY(selfie_lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;


-- Actually backfill the identity_document table with the newly created lifetimes for the front, back, and selfie document_datas
UPDATE identity_document
    SET front_lifetime_id = doc.lifetime_id -- change
    FROM identity_document_backup backup
        INNER JOIN document_data doc
        ON doc.s3_url = backup.front_image_s3_url -- change
    WHERE backup.id = identity_document.id;

UPDATE identity_document
    SET back_lifetime_id = doc.lifetime_id -- change
    FROM identity_document_backup backup
        INNER JOIN document_data doc
        ON doc.s3_url = backup.back_image_s3_url -- change
    WHERE backup.id = identity_document.id;

UPDATE identity_document
    SET selfie_lifetime_id = doc.lifetime_id -- change
    FROM identity_document_backup backup
        INNER JOIN document_data doc
        ON doc.s3_url = backup.selfie_image_s3_url -- change
    WHERE backup.id = identity_document.id;


-- delete old access logs
DELETE FROM access_event where ARRAY_TO_STRING(targets, '||') LIKE 'id_document.%' OR ARRAY_TO_STRING(targets, '||') LIKE 'selfie.%';