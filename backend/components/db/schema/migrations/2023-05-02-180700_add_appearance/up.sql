CREATE TABLE appearance (
    id text PRIMARY KEY DEFAULT prefixed_uid('ap_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    tenant_id text NOT NULL,
    data JSONB NOT NULL,
    CONSTRAINT fk_appearance_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX appearance_tenant_id ON appearance(tenant_id);

SELECT diesel_manage_updated_at('appearance');

ALTER TABLE ob_configuration
    ADD COLUMN appearance_id TEXT,
    ADD CONSTRAINT fk_ob_configuration_appearance_id
        FOREIGN KEY(appearance_id)
        REFERENCES appearance(id)
        DEFERRABLE INITIALLY DEFERRED;
    
CREATE INDEX ob_configuration_appearance_id ON ob_configuration(appearance_id);