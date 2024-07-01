use crate::Error;
use crate::VaultDrAwsConfig;
use api_core::FpResult;
use api_core::State;
use db::errors::FpOptionalExtension;
use db::models::ob_configuration::IsLive;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
use std::fmt::Debug;

#[derive(Debug, Clone)]
pub struct VaultDrWriter {
    #[allow(dead_code)]
    config_id: VaultDrConfigId,
    #[allow(dead_code)]
    tenant_id: TenantId,
    #[allow(dead_code)]
    is_live: IsLive,

    aws_config: VaultDrAwsConfig,
}

impl VaultDrWriter {
    pub async fn new(state: &State, config_id: &VaultDrConfigId) -> FpResult<Self> {
        let state_config = state.config.vault_dr_config.clone();

        let config_id = config_id.clone();
        let writer = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let config = VaultDrConfig::get(conn, &config_id)
                    .optional()?
                    .ok_or(Error::NotEnrolled)?;

                let aws_pre_enrollment = VaultDrAwsPreEnrollment::get(conn, &config.aws_pre_enrollment_id)?;


                let VaultDrConfig {
                    tenant_id,
                    is_live,
                    aws_account_id,
                    aws_role_name,
                    s3_bucket_name,
                    ..
                } = config;

                Ok(VaultDrWriter {
                    config_id,
                    tenant_id,
                    is_live,
                    aws_config: VaultDrAwsConfig {
                        state_config,
                        aws_account_id,
                        aws_external_id: aws_pre_enrollment.aws_external_id,
                        aws_role_name,
                        s3_bucket_name,
                    },
                })
            })
            .await?;

        writer.aws_config.validate().await?;

        Ok(writer)
    }
}
