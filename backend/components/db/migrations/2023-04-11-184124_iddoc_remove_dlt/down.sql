-- Note: this isnt a perfect revert but aims to restore data
-- bring back our old lifetimes
INSERT INTO data_lifetime SELECT * FROM data_lifetime_backup;

-- bring back our old iddocs
ALTER table identity_document RENAME TO identity_document_migrated_backup;

CREATE TABLE IF NOT EXISTS identity_document AS SELECT * FROM identity_document_backup;

-- add back constraints
ALTER TABLE identity_document
    ALTER COLUMN id SET DEFAULT prefixed_uid('iddoc_'),
    ALTER COLUMN request_id SET NOT NULL,
    ALTER COLUMN document_type SET NOT NULL,
    ALTER COLUMN country_code SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN _created_at SET NOT NULL,
    ALTER COLUMN _created_at SET DEFAULT NOW(),    
    ALTER COLUMN _updated_at SET NOT NULL,
    ALTER COLUMN _updated_at SET DEFAULT NOW(),
    ALTER COLUMN e_data_key SET NOT NULL,
    ALTER COLUMN lifetime_id SET NOT NULL,
    ADD CONSTRAINT fk_identity_document_lifetime_id
        FOREIGN KEY(lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_identity_document_request_id
        FOREIGN KEY(request_id) 
        REFERENCES document_request(id)
        DEFERRABLE INITIALLY DEFERRED;        

ALTER TABLE identity_document ADD PRIMARY KEY (id);

-- need to re-point verification request back at our identity_document table
-- note: this assumes that no new verification requests have been created otherwise this will error as the new iddocs are lost
ALTER TABLE verification_request DROP CONSTRAINT fk_verification_request_identity_document_id;
ALTER TABLE verification_request 
    ADD CONSTRAINT fk_verification_request_identity_document_id 
        FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED;

DROP table identity_document_migrated_backup;
DROP table data_lifetime_backup;
DROP table identity_document_backup;