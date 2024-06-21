use crate::Error;
use api_core::config::VaultDrConfig as VaultDrStateConfig;
use api_core::FpResult;
use api_core::State;
use aws_config::default_provider::credentials::DefaultCredentialsChain;
use aws_config::Region;
use aws_credential_types::provider::SharedCredentialsProvider;
use aws_types::SdkConfig;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use newtypes::PiiString;
use newtypes::TenantId;
use std::fmt::Debug;

#[derive(Debug, Clone)]
pub struct VaultDrWriter {
    pub config: VaultDrStateConfig,

    pub tenant_id: TenantId,
    pub is_live: bool,

    pub aws_account_id: String,
    pub aws_external_id: PiiString,
    pub aws_role_name: String,
    pub s3_bucket_name: String,
}

impl VaultDrWriter {
    pub async fn new(state: &State, tenant_id: &TenantId, is_live: bool) -> FpResult<Self> {
        let tenant_id = tenant_id.clone();

        let state_config = state.config.vault_dr_config.clone();

        let writer = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let aws_pre_enrollment = VaultDrAwsPreEnrollment::get(conn, &tenant_id, is_live)?
                    .ok_or(Error::MissingAwsPreEnrollment)?;

                let config = VaultDrConfig::get(conn, &tenant_id, is_live)?.ok_or(Error::AlreadyEnrolled)?;

                let VaultDrConfig {
                    tenant_id,
                    is_live,
                    aws_account_id,
                    aws_role_name,
                    s3_bucket_name,
                    ..
                } = config;

                Ok(VaultDrWriter {
                    config: state_config,
                    tenant_id,
                    is_live,
                    aws_account_id,
                    aws_external_id: aws_pre_enrollment.aws_external_id,
                    aws_role_name,
                    s3_bucket_name,
                })
            })
            .await?;

        writer.validate_aws_config().await?;

        Ok(writer)
    }

    pub fn tenant_role_arn(&self) -> String {
        format!(
            "arn:aws:iam::{}:role/{}",
            &self.aws_account_id, &self.aws_role_name
        )
    }

    pub async fn default_aws_config(&self) -> Result<SdkConfig, Error> {
        self.aws_config(None).await
    }

    async fn aws_config(&self, external_id_override: Option<PiiString>) -> Result<SdkConfig, Error> {
        let base_config = match (self.config.aws_region.as_ref(), self.config.aws_endpoint.as_ref()) {
            (Some(aws_region), Some(aws_endpoint)) => {
                aws_config::from_env()
                    .region(Region::new(aws_region.clone()))
                    .endpoint_url(aws_endpoint)
                    .load()
                    .await
            }
            _ => aws_config::from_env().load().await,
        };

        let external_id = external_id_override
            .as_ref()
            .unwrap_or(&self.aws_external_id)
            .leak();

        let assume_role_provider_builder =
            aws_config::sts::AssumeRoleProvider::builder(self.tenant_role_arn())
                .external_id(external_id)
                .session_name("FootprintVaultDisasterRecovery")
                .configure(&base_config);

        let assume_role_provider = match (
            self.config.aws_access_key_id.as_ref(),
            self.config.aws_secret_access_key.as_ref(),
        ) {
            (Some(aws_access_key_id), Some(aws_secret_access_key)) => {
                let provider = aws_credential_types::Credentials::from_keys(
                    aws_access_key_id.leak(),
                    aws_secret_access_key.leak(),
                    None,
                );
                assume_role_provider_builder.build_from_provider(provider).await
            }
            _ => {
                let provider = DefaultCredentialsChain::builder().build().await;
                assume_role_provider_builder.build_from_provider(provider).await
            }
        };


        let assume_role_config = base_config
            .into_builder()
            .credentials_provider(SharedCredentialsProvider::new(assume_role_provider))
            .build();

        Ok(assume_role_config)
    }

    pub async fn validate_aws_config(&self) -> Result<(), Error> {
        // TODO: implement this
        Ok(())
    }
}
