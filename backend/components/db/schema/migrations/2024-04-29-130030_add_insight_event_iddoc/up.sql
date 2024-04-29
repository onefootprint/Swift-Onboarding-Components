ALTER TABLE identity_document 
    ADD COLUMN insight_event_id TEXT,
    ADD CONSTRAINT fk_identity_document_insight_event_id
        FOREIGN KEY(insight_event_id) 
            REFERENCES insight_event(id)
            DEFERRABLE INITIALLY DEFERRED;
