use std::sync::Arc;

use crate::{
    config::Config,
    enclave_client::EnclaveClient,
    errors::ApiError,
    fingerprinter::AwsHmacClient,
    s3,
    utils::{email::SendgridClient, twilio::TwilioClient},
    GIT_HASH,
};
use crypto::aead::ScopedSealingKey;
use db::DbPool;
use feature_flag::LaunchDarklyFeatureFlagClient;
use idv::{
    experian::cross_core::client::ExperianClientAdapter, fingerprintjs::client::FingerprintJSClient,
    footprint_http_client::FootprintVendorHttpClient, idology::client::IdologyClient,
    incode::client::IncodeClient, middesk::client::MiddeskClient, socure::client::SocureClient,
};
use newtypes::PiiString;
use workos::{ApiKey, WorkOs};

#[derive(Clone)]
pub struct State {
    pub config: Config,
    pub aws_hmac_client: AwsHmacClient,
    pub workos_client: Arc<WorkOs>,
    pub twilio_client: TwilioClient,
    pub sendgrid_client: SendgridClient,
    pub db_pool: DbPool,
    pub enclave_client: EnclaveClient,
    pub challenge_sealing_key: ScopedSealingKey,
    pub session_sealing_key: ScopedSealingKey,
    pub idology_client: IdologyClient,
    pub s3_client: s3::S3Client,
    #[allow(unused)]
    pub socure_sandbox_client: SocureClient,
    #[allow(unused)]
    pub socure_production_client: SocureClient,
    pub feature_flag_client: LaunchDarklyFeatureFlagClient,
    pub webhook_service_client: webhooks::WebhookServiceClient,
    #[allow(unused)]
    pub billing_client: billing::BillingClient,
    pub experian_client: ExperianClientAdapter,
    pub fingerprintjs_client: FingerprintJSClient,
    #[allow(unused)]
    pub incode_client: IncodeClient,
    pub middesk_client: MiddeskClient,
    pub footprint_vendor_http_client: FootprintVendorHttpClient,
}
impl State {
    /// initialize global state in test context
    #[cfg(test)]
    #[allow(clippy::expect_used)]
    pub async fn test_state(enclave_proxy_port: u16) -> Self {
        let mut config = Config::load_from_env().expect("failed to load config");
        config.enclave_config.enclave_proxy_endpoint = format!("http://localhost:{}", enclave_proxy_port);
        Self::init_or_die(config).await
    }

    #[allow(clippy::expect_used)]
    pub async fn init_or_die(mut config: Config) -> Self {
        let feature_flag_client = LaunchDarklyFeatureFlagClient::new();
        let feature_flag_client = match feature_flag_client.init(&config.launch_darkly_sdk_key).await {
            Ok(client) => {
                tracing::info!("FeatureFlagClient successfully initialized");
                client
            }
            Err(err) => {
                tracing::warn!(
                    err = format!("{:?}", err),
                    "FeatureFlagClient failed to initialize"
                );
                feature_flag_client
            }
        };

        let enclave_client = EnclaveClient::new(config.clone()).await;

        let shared_config = aws_config::from_env().load().await;
        let s3_client = s3::S3Client {
            client: aws_sdk_s3::Client::new(&shared_config),
        };
        let kms_client = aws_sdk_kms::Client::new(&shared_config);
        let hmac_client = AwsHmacClient {
            client: kms_client,
            key_id: config.signing_root_key_id.clone(),
        };

        let workos_client = WorkOs::new(&ApiKey::from(config.workos_api_key.as_str()));

        let twilio_client = TwilioClient::new(
            config.twilio_acount_sid.clone(),
            config.twilio_api_key.clone(),
            config.twilio_api_key_secret.clone(),
            config.twilio_phone_number.clone(),
            config.time_s_between_sms_challenges,
            config.rp_id.clone(),
        );

        let sendgrid_client = SendgridClient::new(config.sendgrid_api_key.clone());

        let idology_client = IdologyClient::new(
            config.idology_config.username.clone().into(),
            config.idology_config.password.clone().into(),
        )
        .expect("failed to build idology client");

        let socure_sandbox_client = SocureClient::new(config.socure_config.sandbox_api_key.clone(), true)
            .expect("failed to build socure sandbox client");

        let socure_production_client =
            SocureClient::new(config.socure_config.production_api_key.clone(), false)
                .expect("failed to build socure certification client");

        let webhook_service_client = webhooks::WebhookServiceClient::new(
            &config.svix_auth_token,
            vec![&GIT_HASH, &config.service_config.environment],
        );

        let billing_client = billing::BillingClient::new(config.stripe.api_key.clone());

        let experian_client = ExperianClientAdapter::new(
            PiiString::from("crosscore2.uat@onefootprint.com"),
            PiiString::from(""),
            PiiString::from(""),
            PiiString::from(""),
            PiiString::from(""),
            PiiString::from(""),
            PiiString::from(""),
            // TODO: uncomment once we have production credentials, for now we'll just use fixtures
            // config.experian.auth_username.clone(),
            // config.experian.auth_password.clone(),
            // config.experian.auth_client_id.clone(),
            // config.experian.auth_client_secret.clone(),
            // config.experian.cross_core_username.clone(),
            // config.experian.cross_core_password.clone(),
        )
        .expect("failed to build experian client");

        let fingerprintjs_client = FingerprintJSClient::new(config.fingerprintjs_sdk_key.clone().into())
            .expect("failed to build fingerprint client");

        let incode_client = IncodeClient::new(config.incode.api_key.clone(), config.incode.client_id.clone())
            .expect("failed to build fingerprint client");

        let middesk_client = MiddeskClient::new(config.middesk_config.middesk_sandbox_api_key.clone(), true)
            .expect("failed to build middesk client");

        // let out = hmac_client
        //     .signed_hash(&vec![0xde, 0xad, 0xbe, 0xef])
        //     .await
        //     .unwrap();
        // dbg!(crypto::hex::encode(&out));

        let footprint_vendor_http_client =
            FootprintVendorHttpClient::new().expect("failed to build vendor client");

        // run migrations
        db::run_migrations(&config.database_url).expect("failed to run migrations");

        // then create the pool
        let db_pool = db::init(&config.database_url)
            .map_err(ApiError::from)
            .expect("failed to init db pool");

        // our session key
        let (challenge_sealing_key, session_sealing_key) = {
            // take here removes it from the config
            let key = if let Some(hex_key) = config.cookie_session_key_hex.take() {
                crypto::hex::decode(hex_key).expect("invalid session cookie key")
            } else {
                log::error!("WARNING GENERATING RANDOM SESSION KEY");
                crypto::random::random_cookie_session_key_bytes()
            };
            (
                ScopedSealingKey::new(key.clone(), "CHALLENGE_SEALING").expect("invalid master session key"),
                ScopedSealingKey::new(key, "SESSION_SEALING").expect("invalid master session key"),
            )
        };

        State {
            config,
            enclave_client,
            aws_hmac_client: hmac_client,
            workos_client: Arc::new(workos_client),
            twilio_client,
            sendgrid_client,
            db_pool,
            challenge_sealing_key,
            session_sealing_key,
            idology_client,
            s3_client,
            socure_sandbox_client,
            socure_production_client,
            feature_flag_client,
            webhook_service_client,
            billing_client,
            experian_client,
            fingerprintjs_client,
            incode_client,
            middesk_client,
            footprint_vendor_http_client,
        }
    }
}
