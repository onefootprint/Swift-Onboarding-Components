CREATE TABLE document_request (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('dr_'),
    onboarding_id UUID NOT NULL,
    ref_id TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_document_request_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
);

CREATE INDEX IF NOT EXISTS document_request_onboarding_id ON document_request(onboarding_id);

SELECT diesel_manage_updated_at('document_request');