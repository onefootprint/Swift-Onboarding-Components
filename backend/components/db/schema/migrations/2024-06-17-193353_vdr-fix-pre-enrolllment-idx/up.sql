DROP INDEX vault_dr_config_aws_pre_enrollment_id;

CREATE INDEX IF NOT EXISTS vault_dr_config_aws_pre_enrollment_id ON vault_dr_config(aws_pre_enrollment_id);
CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_config_unique_aws_pre_enrollment_id_active ON vault_dr_config(aws_pre_enrollment_id) WHERE deactivated_at IS NULL;


