use crate::Error;
use api_core::config::VaultDrConfig as VaultDrStateConfig;
use aws_config::default_provider::credentials::DefaultCredentialsChain;
use aws_config::Region;
use aws_sdk_s3::config::SharedCredentialsProvider;
use aws_sdk_s3::error::ProvideErrorMetadata;
use aws_types::SdkConfig;
use newtypes::PiiString;
use std::fmt::Debug;
use tracing::info;
use tracing::warn;

// footprint-dr also uses this key to test s3:GetObject access.
// Update in footprint-dr if this key is changed.
const S3_ACCESS_PROBE_KEY: &str = "footprint/.vdr-access-probe";

#[derive(Debug, Clone)]
pub struct VaultDrAwsConfig {
    pub state_config: VaultDrStateConfig,

    pub aws_account_id: String,
    pub aws_external_id: PiiString,
    pub aws_role_name: String,
    pub s3_bucket_name: String,
}

impl VaultDrAwsConfig {
    fn tenant_role_arn(&self) -> String {
        format!(
            "arn:aws:iam::{}:role/{}",
            &self.aws_account_id, &self.aws_role_name
        )
    }

    async fn default_sdk_config(&self) -> Result<SdkConfig, Error> {
        self.sdk_config(None).await
    }

    async fn sdk_config(&self, external_id_override: Option<PiiString>) -> Result<SdkConfig, Error> {
        let base_config = match (
            self.state_config.aws_region.as_ref(),
            self.state_config.aws_endpoint.as_ref(),
        ) {
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
            self.state_config.aws_access_key_id.as_ref(),
            self.state_config.aws_secret_access_key.as_ref(),
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

    pub async fn s3_client(&self) -> Result<aws_sdk_s3::Client, Error> {
        let aws_config = self.default_sdk_config().await?;
        let s3_config = aws_sdk_s3::Config::from(&aws_config)
            .to_builder()
            .force_path_style(self.use_localstack())
            .build();
        let s3_client = aws_sdk_s3::Client::from_conf(s3_config);
        Ok(s3_client)
    }

    fn use_localstack(&self) -> bool {
        self.state_config.use_localstack.is_some()
    }

    pub async fn validate(&self) -> Result<(), Error> {
        let aws_config = self.default_sdk_config().await?;

        // Test that the assumed role works.
        let sts_config = aws_sdk_sts::Config::new(&aws_config);
        let client = aws_sdk_sts::Client::from_conf(sts_config);
        let req = client.get_caller_identity();

        // n.b. We currently can't check error codes on STS errors.
        // This means transient errors or implementation errors may be marked with 4xx status codes.
        // Look at the warning logs emitted by the library to see the actual error code.
        //
        // https://github.com/awslabs/aws-sdk-rust/discussions/1076#discussioncomment-8609035

        let resp = req
            .send()
            .await
            .map_err(|_| Error::RoleValidationFailed("Unable to assume role".to_owned()))?;
        info!(?resp, "STS GetCallerIdentity succeeded");


        // Validate the account ID. If this fails, it's an error in our implementation.
        let assumed_role_account = resp.account.ok_or(Error::IamAssertionFailed(
            "Missing account ID in STS GetCallerIdentity response".to_string(),
        ))?;
        if assumed_role_account != self.aws_account_id {
            if self.use_localstack() {
                tracing::error!("STS GetCallerIdentity returned an incorrect account ID because Localstack doesn't persist data across restarts and silently lets the STS AssumeRole succeed even though the destination role no longer exists. Re-enroll from scratch to re-create cloud resources, e.g. by running integration tests.");
            }

            return Err(Error::IamAssertionFailed(
                "STS GetCallerIdentity returned the wrong account ID".to_string(),
            ));
        }

        // Test that we can't assume the role if we pass a different external ID.
        let bad_external_id = format!("{}bad", &self.aws_external_id.leak()).into();
        let bad_config = self.sdk_config(Some(bad_external_id)).await?;

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
                if !self.use_localstack() {
                    return Err(Error::RoleValidationFailed(
                        "Able to assume role with an incorrect external ID. The assume role policy must restrict access based on the sts:ExternalId.".to_string(),
                    ));
                }
            }
            Err(e) => {
                let svc_error = e.into_service_error();
                info!(error = ?svc_error, "STS GetCallerIdentity failed as expected");
            }
        }

        // Test for access to the S3 bucket.
        let s3_client = self.s3_client().await?;

        // Test for s3:PutObject.
        let req = s3_client
            .put_object()
            .bucket(&self.s3_bucket_name)
            .key(S3_ACCESS_PROBE_KEY);
        req.send().await.map_err(|e| {
            let svc_error = e.into_service_error();

            warn!(error=?svc_error, "S3 PutObject failed");

            if matches!(svc_error.code(), Some("AccessDenied") | Some("NoSuchBucket")) {
                Error::RoleValidationFailed(format!("S3 PutObject failed: {}", svc_error.meta()))
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

            if matches!(svc_error.code(), Some("AccessDenied") | Some("NoSuchBucket")) {
                Error::RoleValidationFailed(format!("S3 ListObjectsV2 failed: {}", svc_error.meta()))
            } else {
                Box::new(svc_error).into()
            }
        })?;


        // Test for s3:GetBucketLocation.
        let req = s3_client.get_bucket_location().bucket(&self.s3_bucket_name);
        let resp = req.send().await.map_err(|e| {
            let svc_error = e.into_service_error();

            warn!(error = ?svc_error, "S3 GetBucketLocation failed");

            if matches!(svc_error.code(), Some("AccessDenied") | Some("NoSuchBucket")) {
                Error::RoleValidationFailed(format!("S3 GetBucketLocation failed: {}", svc_error.meta()))
            } else {
                Box::new(svc_error).into()
            }
        })?;
        info!(?resp, "S3 GetBucketLocation response");

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
                let client_region = aws_config.region().ok_or(Error::AwsClientMissingRegion)?;
                if client_region != &Region::new("us-east-1") {
                    return Err(Error::BucketValidationFailed(
                        "Bucket must be created in the us-east-1 region".to_string(),
                    ));
                }
            }
            other => {
                return Err(Error::BucketValidationFailed(format!(
                    "Bucket location constraint {} is not supported",
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
                if !self.use_localstack() {
                    return Err(Error::RoleValidationFailed(
                        "S3 GetObject should have failed. Ensure the role is granted only permissions listed in the documentation.".to_string(),
                    ));
                }
            }
            Err(e) => {
                let svc_error = e.into_service_error();

                info!(error = ?svc_error, "S3 GetObject failed as expected. Expected code is AccessDenied");
                if svc_error.code() != Some("AccessDenied") {
                    return Err(Box::new(svc_error).into());
                }
            }
        }

        Ok(())
    }
}
