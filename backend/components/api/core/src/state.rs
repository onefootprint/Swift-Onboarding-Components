use crate::config::Config;
use crate::enclave_client::EnclaveClient;
use crate::fingerprinter::AwsHmacClient;
use crate::metrics::Metrics;
use crate::s3::S3Client;
use crate::s3::{
    self,
};
use crate::utils::email::SendgridClient;
use crate::utils::sms::SmsClient;
#[cfg(test)]
use crate::vendor_clients::VendorClient;
use crate::vendor_clients::VendorClients;
use crate::GIT_HASH;
use api_errors::FpError;
use crypto::aead::ScopedSealingKey;
use db::tests::MockFFClient;
use db::DbPool;
use feature_flag::FeatureFlagClient;
use feature_flag::LaunchDarklyFeatureFlagClient;
#[cfg(test)]
use idv::experian::ExperianCrossCoreRequest;
#[cfg(test)]
use idv::experian::ExperianCrossCoreResponse;
use idv::fingerprintjs::client::FingerprintJSClient;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::footprint_http_client::FpVendorClientArgs;
use idv::idology::client::IdologyClient;
#[cfg(test)]
use idv::idology::pa::IdologyPaAPIResponse;
#[cfg(test)]
use idv::idology::pa::IdologyPaRequest;
#[cfg(test)]
use idv::idology::IdologyExpectIDAPIResponse;
#[cfg(test)]
use idv::idology::IdologyExpectIDRequest;
#[cfg(test)]
use idv::incode::doc::response::AddConsentResponse;
#[cfg(test)]
use idv::incode::doc::response::AddSelfieResponse;
#[cfg(test)]
use idv::incode::doc::response::AddSideResponse;
#[cfg(test)]
use idv::incode::doc::response::FetchOCRResponse;
#[cfg(test)]
use idv::incode::doc::response::FetchScoresResponse;
#[cfg(test)]
use idv::incode::doc::response::GetOnboardingStatusResponse;
#[cfg(test)]
use idv::incode::doc::response::ProcessFaceResponse;
#[cfg(test)]
use idv::incode::doc::response::ProcessIdResponse;
#[cfg(test)]
use idv::incode::doc::IncodeAddBackRequest;
#[cfg(test)]
use idv::incode::doc::IncodeAddFrontRequest;
#[cfg(test)]
use idv::incode::doc::IncodeAddMLConsentRequest;
#[cfg(test)]
use idv::incode::doc::IncodeAddPrivacyConsentRequest;
#[cfg(test)]
use idv::incode::doc::IncodeAddSelfieRequest;
#[cfg(test)]
use idv::incode::doc::IncodeFetchOCRRequest;
#[cfg(test)]
use idv::incode::doc::IncodeFetchScoresRequest;
#[cfg(test)]
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
#[cfg(test)]
use idv::incode::doc::IncodeProcessFaceRequest;
#[cfg(test)]
use idv::incode::doc::IncodeProcessIdRequest;
#[cfg(test)]
use idv::incode::response::OnboardingStartResponse;
#[cfg(test)]
use idv::incode::watchlist::response::UpdatedWatchlistResultResponse;
#[cfg(test)]
use idv::incode::watchlist::response::WatchlistResultResponse;
#[cfg(test)]
use idv::incode::watchlist::IncodeUpdatedWatchlistResultRequest;
#[cfg(test)]
use idv::incode::watchlist::IncodeWatchlistCheckRequest;
#[cfg(test)]
use idv::incode::IncodeResponse;
#[cfg(test)]
use idv::incode::IncodeStartOnboardingRequest;
use idv::middesk::client::MiddeskClient;
#[cfg(test)]
use idv::middesk::MiddeskCreateBusinessRequest;
#[cfg(test)]
use idv::middesk::MiddeskCreateBusinessResponse;
#[cfg(test)]
use idv::middesk::MiddeskGetBusinessRequest;
#[cfg(test)]
use idv::middesk::MiddeskGetBusinessResponse;
use idv::socure::client::SocureClient;
#[cfg(test)]
use idv::socure::SocureIDPlusAPIResponse;
#[cfg(test)]
use idv::socure::SocureIDPlusRequest;
use idv::stytch::client::StytchClient;
#[cfg(test)]
use idv::twilio::TwilioLookupV2APIResponse;
#[cfg(test)]
use idv::twilio::TwilioLookupV2Request;
use selfie_doc::AwsSelfieDocClient;
use std::sync::Arc;
use std::time::Duration;
use twilio::TwilioConfig;
use webhooks::WebhookClient;
use workos::ApiKey;
use workos::WorkOs;

#[derive(Clone)]
pub struct State {
    pub config: Config,
    pub aws_hmac_client: AwsHmacClient,
    pub workos_client: Arc<WorkOs>,
    pub sms_client: SmsClient,
    pub sendgrid_client: SendgridClient,
    pub db_pool: DbPool,
    pub enclave_client: EnclaveClient,
    pub challenge_sealing_key: ScopedSealingKey,
    pub session_sealing_key: ScopedSealingKey,
    pub idology_client: IdologyClient, // TOOD: remove, only used for now unused idology endpoints
    pub s3_client: Arc<dyn S3Client>,
    pub ff_client: Arc<dyn FeatureFlagClient>,
    pub webhook_client: Arc<dyn WebhookClient>,
    #[allow(unused)]
    pub billing_client: billing::BillingClient,
    pub fingerprintjs_client: FingerprintJSClient,
    pub vendor_clients: VendorClients,
    pub metrics: Metrics,
    pub aws_selfie_doc_client: AwsSelfieDocClient,
}
impl State {
    /// initialize global state in test context
    #[cfg(test)]
    #[allow(clippy::expect_used)]
    pub async fn test_state() -> Self {
        use crate::s3::MockS3Client;
        use crate::utils::mock_enclave::MockEnclave;
        use webhooks::MockWebhookClient;
        let config = Config::load_from_env().expect("failed to load config");

        let mut s = Self::init_or_die(config, false).await;
        s.enclave_client.replace_proxy_client(Arc::new(MockEnclave));
        s.enclave_client.replace_s3_client(Arc::new(MockS3Client::new()));

        // by default, the ff_client on a test state will just return the default
        s.set_ff_client(MockFFClient::new().into_mock());
        // by default, any s3 calls will be stubbed out and a test will fail unless you mock or update this
        // to use a client with local aws creds
        s.set_s3_client(Arc::new(MockS3Client::new()));

        // by default, the webhook_client on a test state will expect anything
        let mut mock_webhook_client = MockWebhookClient::new();
        mock_webhook_client
            .expect_send_event_to_tenant()
            .returning(move |_, _, _, _| Ok(()));
        s.set_webhook_client(Arc::new(mock_webhook_client));

        s.set_vendor_clients(VendorClients::new_with_mocks());
        s
    }

    #[allow(clippy::expect_used)]
    #[tracing::instrument(skip_all)]
    pub async fn init_or_die(mut config: Config, is_api_server: bool) -> Self {
        let ff_client: Arc<dyn FeatureFlagClient> = if config.disable_launch_darkly.is_none() {
            let ff_client = LaunchDarklyFeatureFlagClient::new();
            let ff_client = match ff_client.init(&config.launch_darkly_sdk_key).await {
                Ok(client) => {
                    tracing::info!("FeatureFlagClient successfully initialized");
                    client
                }
                Err(error) => {
                    tracing::warn!(?error, "FeatureFlagClient failed to initialize");
                    ff_client
                }
            };
            Arc::new(ff_client)
        } else {
            // The launch darkly client seems to make network requests and block server startup.
            // This option allows you to run the server with LD mocked out.
            MockFFClient::new().into_mock()
        };

        let enclave_client = EnclaveClient::new(config.clone()).await;

        let shared_config = aws_config::defaults(aws_config::BehaviorVersion::v2023_11_09())
            .load()
            .await;
        let s3_client = s3::AwsS3Client {
            client: aws_sdk_s3::Client::new(&shared_config),
        };
        let kms_client = aws_sdk_kms::Client::new(&shared_config);
        let hmac_client = AwsHmacClient {
            client: kms_client,
            key_id: config.signing_root_key_id.clone(),
        };
        let aws_selfie_doc_client = AwsSelfieDocClient::new(&shared_config);

        let workos_client = WorkOs::new(&ApiKey::from(config.workos_api_key.as_str()));

        let twilio = TwilioConfig {
            account_sid: config.twilio_acount_sid.clone(),
            api_key: config.twilio_api_key.clone(),
            api_secret: config.twilio_api_key_secret.clone(),
            from_number: config.twilio_phone_number.clone(),
            whatsapp_sender_sid: config.twilio_whatsapp_sender_sid.clone(),
            whatsapp_otp_template_id: config.twilio_whatsapp_otp_template_id.clone(),
        };
        let twilio_backup = TwilioConfig {
            account_sid: config.twilio_acount_sid_backup.clone(),
            api_key: config.twilio_api_key_backup.clone(),
            api_secret: config.twilio_api_key_secret_backup.clone(),
            from_number: config.twilio_phone_number_backup.clone(),
            whatsapp_sender_sid: config.twilio_whatsapp_sender_sid_backup.clone(),
            whatsapp_otp_template_id: config.twilio_whatsapp_otp_template_id_backup.clone(),
        };
        let twilio_client = SmsClient::new(
            twilio,
            twilio_backup,
            config.time_s_between_challenges,
            ff_client.clone(),
        )
        .expect("failed to build SMS client");

        let sendgrid_client = SendgridClient::new(config.sendgrid_api_key.clone());

        let idology_client = IdologyClient::new(
            config.idology_config.username.clone().into(),
            config.idology_config.password.clone().into(),
        )
        .expect("failed to build idology client");

        let socure_production_client =
            SocureClient::new(config.socure_config.production_api_key.clone(), false)
                .expect("failed to build socure certification client");

        let webhook_service_client = webhooks::WebhookServiceClient::new(
            &config.svix_auth_token,
            vec![&GIT_HASH, &config.service_config.environment],
        );

        let billing_client = billing::BillingClient::new(
            config.stripe.api_key.clone(),
            config.service_config.environment.clone(),
        );

        let fingerprintjs_client = FingerprintJSClient::new(config.fingerprintjs_sdk_key.clone().into())
            .expect("failed to build fingerprint client");

        let middesk_client = MiddeskClient::new(config.middesk_config.middesk_base_url.clone())
            .expect("failed to build middesk client");

        let stytch_client = StytchClient::new(
            config.stytch_config.stytch_project.clone(),
            config.stytch_config.stytch_secret.clone(),
        )
        .expect("failed to build stytch client");

        // Check experian in dev so we fail early if something is misconfigured
        if !config.service_config.is_production()
            && !config.service_config.is_local()
            && config.experian.auth_client_secret.leak().len() > 1
        {
            panic!("should not have experian credentials in anything other than local or production!")
        }

        // API path interpolation requires base_url to not end in '/' or else we'll get errors from Incode
        // (`Missing Authentication Token`, argoff can explain why we get that error if interested)
        // TODO: more intelligently do this in incode client code perhaps
        if config.incode.base_url.leak_to_string().ends_with('/') {
            panic!("config.incode.base_url cannot end with /")
        }

        let footprint_vendor_http_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default())
            .expect("failed to build vendor client");

        // run migrations
        let result = db::run_migrations(&config.database_url);
        if let Err(ref err) = result {
            tracing::error!(err=%err, "Failed to run migrations");
        }
        result.expect("failed to run migrations");

        // then create the db connection pool
        let db_max_conns = match is_api_server {
            true => 50,
            // Background workers need much fewer connections since they don't have much parallelism
            false => 5,
        };
        let db_statement_timeout = Duration::from_secs(config.database_statement_timeout_sec);
        let db_pool = db::init(&config.database_url, db_statement_timeout, db_max_conns)
            .map_err(FpError::from)
            .expect("failed to init db pool");

        // our session key
        let (challenge_sealing_key, session_sealing_key) = {
            // take here removes it from the config
            let hex_key = config
                .cookie_session_key_hex
                .take()
                .expect("No cookie_session_key_hex provided");
            let key = crypto::hex::decode(hex_key).expect("invalid session cookie key");
            (
                ScopedSealingKey::new(key.clone(), "CHALLENGE_SEALING").expect("invalid master session key"),
                ScopedSealingKey::new(key, "SESSION_SEALING").expect("invalid master session key"),
            )
        };

        let vendor_clients = VendorClients::new(
            socure_production_client,
            twilio_client.clone(),
            footprint_vendor_http_client,
            middesk_client,
            stytch_client,
        );

        // set the openai api key
        openai::set_key(config.openai_api_key.clone());

        // Initialize custom prometheus metrics
        // NOTE: we also have this `prometheus::init` that can be wrapped in actix to emit
        // metrics for each API request. But we already have enough coverage from otel traces.
        let metrics = crate::metrics::init();

        State {
            config,
            enclave_client,
            aws_hmac_client: hmac_client,
            workos_client: Arc::new(workos_client),
            sms_client: twilio_client,
            sendgrid_client,
            db_pool,
            challenge_sealing_key,
            session_sealing_key,
            idology_client,
            s3_client: Arc::new(s3_client),
            ff_client,
            webhook_client: Arc::new(webhook_service_client),
            billing_client,
            fingerprintjs_client,
            vendor_clients,
            metrics,
            aws_selfie_doc_client,
        }
    }

    #[cfg(test)]
    // temporar hack until we make a proper TestState
    pub fn set_db_pool(&mut self, db_pool: DbPool) {
        self.db_pool = db_pool;
    }

    #[cfg(test)]
    pub fn set_ff_client(&mut self, ff_client: Arc<dyn FeatureFlagClient>) {
        self.ff_client = ff_client;
    }

    #[cfg(test)]
    pub fn set_s3_client(&mut self, s3_client: Arc<dyn S3Client>) {
        self.s3_client = s3_client;
    }

    #[cfg(test)]
    pub fn set_webhook_client(&mut self, webhook_client: Arc<dyn WebhookClient>) {
        self.webhook_client = webhook_client;
    }

    #[cfg(test)]
    pub fn set_vendor_clients(&mut self, vendor_clients: VendorClients) {
        self.vendor_clients = vendor_clients;
    }

    #[cfg(test)]
    pub fn set_socure_id_plus(
        &mut self,
        socure_id_plus: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    ) {
        self.vendor_clients.socure_id_plus = socure_id_plus;
    }

    #[cfg(test)]
    pub fn set_twilio_lookup_v2(
        &mut self,
        twilio_lookup_v2: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    ) {
        self.vendor_clients.twilio_lookup_v2 = twilio_lookup_v2;
    }

    #[cfg(test)]
    pub fn set_experian_cross_core(
        &mut self,
        experian_cross_core: VendorClient<
            ExperianCrossCoreRequest,
            ExperianCrossCoreResponse,
            idv::experian::error::Error,
        >,
    ) {
        self.vendor_clients.experian_cross_core = experian_cross_core;
    }

    #[cfg(test)]
    pub fn set_middesk_create_business(
        &mut self,
        middesk_create_business: VendorClient<
            MiddeskCreateBusinessRequest,
            MiddeskCreateBusinessResponse,
            idv::middesk::Error,
        >,
    ) {
        self.vendor_clients.middesk_create_business = middesk_create_business;
    }

    #[cfg(test)]
    pub fn set_middesk_get_business(
        &mut self,
        middesk_get_business: VendorClient<
            MiddeskGetBusinessRequest,
            MiddeskGetBusinessResponse,
            idv::middesk::Error,
        >,
    ) {
        self.vendor_clients.middesk_get_business = middesk_get_business;
    }

    #[cfg(test)]
    pub fn set_idology_expect_id(
        &mut self,
        idology_expect_id: VendorClient<
            IdologyExpectIDRequest,
            IdologyExpectIDAPIResponse,
            idv::idology::error::Error,
        >,
    ) {
        self.vendor_clients.idology_expect_id = idology_expect_id;
    }

    #[cfg(test)]
    pub fn set_idology_pa(
        &mut self,
        idology_pa: VendorClient<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>,
    ) {
        self.vendor_clients.idology_pa = idology_pa;
    }

    #[cfg(test)]
    pub fn set_incode_start_onboarding(
        &mut self,
        incode_start_onboarding: VendorClient<
            IncodeStartOnboardingRequest,
            IncodeResponse<OnboardingStartResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_start_onboarding = incode_start_onboarding;
    }

    #[cfg(test)]
    pub fn set_incode_add_front(
        &mut self,
        incode_add_front: VendorClient<
            IncodeAddFrontRequest,
            IncodeResponse<AddSideResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_add_front = incode_add_front;
    }

    #[cfg(test)]
    pub fn set_incode_add_back(
        &mut self,
        incode_add_back: VendorClient<
            IncodeAddBackRequest,
            IncodeResponse<AddSideResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_add_back = incode_add_back;
    }

    #[cfg(test)]
    pub fn set_incode_process_id(
        &mut self,
        incode_process_id: VendorClient<
            IncodeProcessIdRequest,
            IncodeResponse<ProcessIdResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_process_id = incode_process_id;
    }

    #[cfg(test)]
    pub fn set_incode_process_face(
        &mut self,
        incode_process_face: VendorClient<
            IncodeProcessFaceRequest,
            IncodeResponse<ProcessFaceResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_process_face = incode_process_face;
    }

    #[cfg(test)]
    pub fn set_incode_get_onboarding_status(
        &mut self,
        incode_get_onboarding_status: VendorClient<
            IncodeGetOnboardingStatusRequest,
            IncodeResponse<GetOnboardingStatusResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_get_onboarding_status = incode_get_onboarding_status;
    }

    #[cfg(test)]
    pub fn set_incode_fetch_scores(
        &mut self,
        incode_fetch_scores: VendorClient<
            IncodeFetchScoresRequest,
            IncodeResponse<FetchScoresResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_fetch_scores = incode_fetch_scores;
    }

    #[cfg(test)]
    pub fn set_incode_add_privacy_consent(
        &mut self,
        incode_add_privacy_consent: VendorClient<
            IncodeAddPrivacyConsentRequest,
            IncodeResponse<AddConsentResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_add_privacy_consent = incode_add_privacy_consent;
    }

    #[cfg(test)]
    pub fn set_incode_add_ml_consent(
        &mut self,
        incode_add_ml_consent: VendorClient<
            IncodeAddMLConsentRequest,
            IncodeResponse<AddConsentResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_add_ml_consent = incode_add_ml_consent;
    }

    #[cfg(test)]
    pub fn set_incode_fetch_ocr(
        &mut self,
        incode_fetch_ocr: VendorClient<
            IncodeFetchOCRRequest,
            IncodeResponse<FetchOCRResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_fetch_ocr = incode_fetch_ocr;
    }

    #[cfg(test)]
    pub fn set_incode_add_selfie(
        &mut self,
        incode_add_selfie: VendorClient<
            IncodeAddSelfieRequest,
            IncodeResponse<AddSelfieResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_add_selfie = incode_add_selfie;
    }

    #[cfg(test)]
    pub fn set_incode_watchlist_check(
        &mut self,
        incode_watchlist_check: VendorClient<
            IncodeWatchlistCheckRequest,
            IncodeResponse<WatchlistResultResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_watchlist_check = incode_watchlist_check;
    }

    #[cfg(test)]
    pub fn set_incode_updated_watchlist_result(
        &mut self,
        incode_updated_watchlist_result: VendorClient<
            IncodeUpdatedWatchlistResultRequest,
            IncodeResponse<UpdatedWatchlistResultResponse>,
            idv::incode::error::Error,
        >,
    ) {
        self.vendor_clients.incode.incode_updated_watchlist_result = incode_updated_watchlist_result;
    }

    #[cfg(test)]
    pub fn set_incode_to_real_calls(&mut self, fp_client: FootprintVendorHttpClient) {
        use crate::vendor_clients::IncodeClients;

        self.vendor_clients.incode = IncodeClients::new(Arc::new(fp_client));
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::decision::vendor::vendor_trait::MockVendorAPICall;
    use db::models::tenant::Tenant;
    use db::tests::test_db_pool::TestDbPool;
    use feature_flag::BoolFlag;
    use feature_flag::MockFeatureFlagClient;
    use idv::socure::SocureIDPlusRequest;
    use macros::test_state;
    use macros::test_state_case;
    use newtypes::IdvData;

    #[test_state]
    async fn test_test_state(state: &mut State) {
        // State Mocking
        let mut mock_ff_client = MockFeatureFlagClient::new();

        mock_ff_client
            .expect_flag()
            .times(1)
            .withf(move |f| *f == BoolFlag::DisableAllSocure)
            .return_once(|_| true);

        state.set_ff_client(Arc::new(mock_ff_client));

        let mut mock_socure_api_call =
            MockVendorAPICall::<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>::new();

        mock_socure_api_call
            .expect_make_request()
            .times(1)
            .return_once(|_| Ok(idv::tests::fixtures::socure::create_response()));

        state.set_socure_id_plus(Arc::new(mock_socure_api_call));

        let mut mock_s3_client = s3::MockS3Client::new();
        mock_s3_client
            .expect_put_bytes()
            .times(1)
            .return_once(move |bucket, key, _, _| Ok(format!("s3://{}/{}", bucket, key)));

        state.set_s3_client(Arc::new(mock_s3_client));

        // Test
        let flag_res = state.ff_client.flag(BoolFlag::DisableAllSocure);

        let socure_res = state
            .vendor_clients
            .socure_id_plus
            .make_request(SocureIDPlusRequest {
                idv_data: IdvData::default(),
                socure_device_session_id: None,
                ip_address: None,
            })
            .await
            .unwrap();

        some_db_stuff(state).await;
        assert_eq!("s3://bucket/object", &some_s3_jazz(state).await);

        println!("flag_res: {:?}", flag_res);
        println!("socure_res.parsed_response: {:?}", socure_res.parsed_response);
    }

    pub async fn some_db_stuff(state: &State) {
        let tenants = state.db_pool.db_query(Tenant::list_billable).await.unwrap();
        println!("some_db_stuff, tenants: {:?}", tenants);
    }

    pub async fn some_s3_jazz(state: &State) -> String {
        state
            .s3_client
            .put_bytes("bucket", String::from("object"), vec![123], None)
            .await
            .unwrap()
    }

    #[test_state_case(false => false; "false false yo")]
    #[test_state_case(true => true; "true true yo")]
    #[tokio::test]
    async fn test_test_state_case(state: &mut State, flag_value: bool) -> bool {
        // State Mocking
        let mut mock_ff_client = MockFeatureFlagClient::new();

        mock_ff_client
            .expect_flag()
            .times(1)
            .withf(move |f| *f == BoolFlag::DisableAllSocure)
            .return_once(move |_| flag_value);

        state.set_ff_client(Arc::new(mock_ff_client));

        // Test
        let flag_res = state.ff_client.flag(BoolFlag::DisableAllSocure);
        some_db_stuff(state).await; // just for good measure
        flag_res
    }
}
