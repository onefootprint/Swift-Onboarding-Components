ALTER TABLE identity_document ADD COLUMN onboarding_id UUID,
ADD CONSTRAINT fk_identity_document_onboarding_id
    FOREIGN KEY(onboarding_id) 
    REFERENCES onboarding(id);
