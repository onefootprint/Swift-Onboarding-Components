CREATE TABLE vault_dr_aws_pre_enrollment (
    id text PRIMARY KEY DEFAULT prefixed_uid('vdrawspre_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    tenant_id TEXT NOT NULL,
    is_live BOOLEAN NOT NULL,
    aws_external_id TEXT NOT NULL,

    CONSTRAINT fk_vault_dr_aws_pre_enrollment_tenant_id
        FOREIGN KEY(tenant_id)
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('vault_dr_aws_pre_enrollment');
CREATE INDEX IF NOT EXISTS vault_dr_aws_pre_enrollment_tenant_id ON vault_dr_aws_pre_enrollment(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_aws_pre_enrollment_tenant_id_is_live ON vault_dr_aws_pre_enrollment(tenant_id, is_live);
CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_aws_pre_enrollment_aws_external_id ON vault_dr_aws_pre_enrollment(aws_external_id);

CREATE TABLE vault_dr_config (
    id text PRIMARY KEY DEFAULT prefixed_uid('vdrc_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    created_at timestamptz NOT NULL,
    deactivated_at timestamptz,

    tenant_id TEXT NOT NULL,
    is_live BOOLEAN NOT NULL,

    aws_pre_enrollment_id TEXT NOT NULL,

    aws_account_id TEXT NOT NULL,
    aws_role_name TEXT NOT NULL,
    s3_bucket_name TEXT NOT NULL,

    org_public_key TEXT NOT NULL,
    recovery_public_key TEXT NOT NULL,
    wrapped_recovery_key TEXT NOT NULL,

    CONSTRAINT fk_vault_dr_config_tenant_id
        FOREIGN KEY(tenant_id)
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_vault_dr_config_aws_pre_enrollment_id
        FOREIGN KEY(aws_pre_enrollment_id)
        REFERENCES vault_dr_aws_pre_enrollment(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('vault_dr_config');
CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_config_tenant_id ON vault_dr_config(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_config_tenant_id_is_live ON vault_dr_config(tenant_id, is_live);
CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_config_aws_pre_enrollment_id ON vault_dr_config(aws_pre_enrollment_id);
