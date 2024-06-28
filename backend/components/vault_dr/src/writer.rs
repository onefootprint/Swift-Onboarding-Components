use crate::Error;
use api_core::config::VaultDrConfig as VaultDrStateConfig;
use api_core::FpResult;
use api_core::State;
use aws_config::default_provider::credentials::DefaultCredentialsChain;
use aws_config::retry::ErrorKind;
use aws_config::retry::ProvideErrorKind;
use aws_config::Region;
use aws_sdk_s3::config::SharedCredentialsProvider;
use aws_types::SdkConfig;
use db::errors::FpOptionalExtension;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
use std::fmt::Debug;
use tracing::info;
use tracing::warn;

const S3_ACCESS_PROBE_KEY: &str = ".footprint-access-probe";

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

    fn tenant_role_arn(&self) -> String {
        format!(
            "arn:aws:iam::{}:role/{}",
            &self.aws_account_id, &self.aws_role_name
        )
    }

    async fn default_aws_config(&self) -> Result<SdkConfig, Error> {
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
        let use_localstack = self.config.use_localstack.is_some();

        let aws_config = self.default_aws_config().await?;

        // Test that the assumed role works.
        let sts_config = aws_sdk_sts::Config::new(&aws_config);
        let client = aws_sdk_sts::Client::from_conf(sts_config);
        let req = client.get_caller_identity();

        let resp = req.send().await.map_err(|e| {
            let svc_error = e.into_service_error();
            let error_kind = svc_error.meta().retryable_error_kind();
            if error_kind == Some(ErrorKind::ClientError) {
                warn!(error = ?svc_error, "STS GetCallerIdentity failed");
                Error::RoleValidationFailed(format!("STS GetCallerIdentity failed: {}", svc_error))
            } else {
                warn!(
                    error = ?svc_error,
                    "STS GetCallerIdentity failed with unexpected error kind"
                );
                Box::new(svc_error).into()
            }
        })?;
        info!(?resp, "STS GetCallerIdentity succeeded");


        // Validate the account ID. If this fails, it's an error in our implementation.
        let assumed_role_account = resp.account.ok_or(Error::IamAssertionFailed(
            "Missing account ID in STS GetCallerIdentity response".to_string(),
        ))?;
        if assumed_role_account != self.aws_account_id {
            return Err(Error::IamAssertionFailed(
                "STS GetCallerIdentity returned the wrong account ID".to_string(),
            ));
        }

        // Test that we can't assume the role if we pass a different external ID.
        let bad_external_id = format!("{}bad", &self.aws_external_id.leak()).into();
        let bad_config = self.aws_config(Some(bad_external_id)).await?;

        let sts_config = aws_sdk_sts::Config::new(&bad_config);
        let sts_client = aws_sdk_sts::Client::from_conf(sts_config);
        let req = sts_client.get_caller_identity();
        let result = req.send().await;
        match result {
            Ok(resp) => {
                warn!(
                    ?resp,
                    "STS GetCallerIdentity with bad external ID should have failed"
                );

                // Localstack doesn't support IAM enforcement.
                if !use_localstack {
                    return Err(Error::RoleValidationFailed(
                        "Able to assume role with an incorrect external ID. The assume role policy must restrict access based on the sts:ExternalId.".to_string(),
                    ));
                }
            }
            Err(e) => {
                let svc_error = e.into_service_error();
                let error_kind = svc_error.meta().retryable_error_kind();
                if error_kind != Some(ErrorKind::ClientError) {
                    warn!(
                        error = ?svc_error,
                        "STS GetCallerIdentity failed with unexpected error kind"
                    );
                    return Err(Box::new(svc_error).into());
                }
            }
        }

        // Test for access to the S3 bucket.
        let s3_config = aws_sdk_s3::Config::from(&aws_config)
            .to_builder()
            .force_path_style(use_localstack)
            .build();
        let s3_client = aws_sdk_s3::Client::from_conf(s3_config);

        // Test for s3:PutObject.
        let req = s3_client
            .put_object()
            .bucket(&self.s3_bucket_name)
            .key(S3_ACCESS_PROBE_KEY);
        req.send().await.map_err(|e| {
            let svc_error = e.into_service_error();
            warn!(error = ?svc_error, "S3 PutObject failed");
            let error_kind = svc_error.meta().retryable_error_kind();
            if error_kind == Some(ErrorKind::ClientError) {
                Error::RoleValidationFailed(format!("S3 PutObject failed: {}", svc_error))
            } else {
                Box::new(svc_error).into()
            }
        })?;

        // Test for s3:ListBucket.
        let req = s3_client
            .list_objects_v2()
            .bucket(&self.s3_bucket_name)
            .prefix(S3_ACCESS_PROBE_KEY)
            .max_keys(1);
        req.send().await.map_err(|e| {
            let svc_error = e.into_service_error();
            warn!(error = ?svc_error, "S3 ListObjectsV2 failed");
            let error_kind = svc_error.meta().retryable_error_kind();
            if error_kind == Some(ErrorKind::ClientError) {
                Error::RoleValidationFailed(format!("S3 ListObjectsV2 failed: {}", svc_error))
            } else {
                Box::new(svc_error).into()
            }
        })?;


        // Test for s3:GetBucketLocation.
        let req = s3_client.get_bucket_location().bucket(&self.s3_bucket_name);
        let resp = req.send().await.map_err(|e| {
            let svc_error = e.into_service_error();
            warn!(error = ?svc_error, "S3 GetBucketLocation failed");
            let error_kind = svc_error.meta().retryable_error_kind();
            if error_kind == Some(ErrorKind::ClientError) {
                Error::RoleValidationFailed(format!("S3 GetBucketLocation failed: {}", svc_error))
            } else {
                Box::new(svc_error).into()
            }
        })?;
        info!(?resp, "S3 GetBucketLocation response");

        let client_region = aws_config.region().ok_or(Error::AwsClientMissingRegion)?;

        // For some reason, the null location constraint is deserialized as an empty
        // string UnknownVariantValue.
        let location_constraint = resp
            .location_constraint
            .as_ref()
            .map(|lc| lc.as_str().to_owned())
            .unwrap_or_default();
        match location_constraint.as_str() {
            "" => {
                // Implicitly us-east-1.
                // https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucketConfiguration.html
                if client_region != &Region::new("us-east-1") {
                    return Err(Error::BucketValidationFailed(
                        "Bucket must be created in the us-east-1 region".to_string(),
                    ));
                }
            }
            other => {
                return Err(Error::BucketValidationFailed(format!(
                    "Bucket locaton constraint {} is not supported",
                    other
                )));
            }
        }

        // Test that we don't have s3:GetObject.
        let req = s3_client
            .get_object()
            .bucket(&self.s3_bucket_name)
            .key(S3_ACCESS_PROBE_KEY);
        let result = req.send().await;
        match result {
            Ok(resp) => {
                warn!(?resp, "S3 GetObject should have failed");
                if !use_localstack {
                    return Err(Error::RoleValidationFailed(
                        "S3 GetObject should have failed. Ensure the role is granted only permissions listed in the documentation.".to_string(),
                    ));
                }
            }
            Err(e) => {
                let svc_error = e.into_service_error();
                let error_kind = svc_error.meta().retryable_error_kind();
                if error_kind != Some(ErrorKind::ClientError) {
                    warn!(
                        error = ?svc_error,
                        "S3 GetObject failed with unexpected error kind"
                    );
                    return Err(Box::new(svc_error).into());
                }
            }
        }

        Ok(())
    }
}
