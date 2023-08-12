use std::sync::Arc;

use crate::{
    config::Config,
    enclave_client::EnclaveClient,
    errors::ApiError,
    fingerprinter::AwsHmacClient,
    metrics::Metrics,
    s3,
    utils::{email::SendgridClient, twilio::TwilioClient},
    vendor_clients::VendorClients,
    GIT_HASH,
};
use crypto::aead::ScopedSealingKey;
use db::DbPool;
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use idv::{
    fingerprintjs::client::FingerprintJSClient, footprint_http_client::FootprintVendorHttpClient,
    idology::client::IdologyClient, middesk::client::MiddeskClient, socure::client::SocureClient,
    stytch::client::StytchClient,
};

use webhooks::WebhookClient;
use workos::{ApiKey, WorkOs};

#[cfg(test)]
use crate::vendor_clients::VendorClient;
#[cfg(test)]
use idv::{
    experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
    incode::{
        doc::{
            response::{
                AddConsentResponse, AddSelfieResponse, AddSideResponse, FetchOCRResponse,
                FetchScoresResponse, GetOnboardingStatusResponse, ProcessFaceResponse, ProcessIdResponse,
            },
            IncodeAddBackRequest, IncodeAddFrontRequest, IncodeAddMLConsentRequest,
            IncodeAddPrivacyConsentRequest, IncodeAddSelfieRequest, IncodeFetchOCRRequest,
            IncodeFetchScoresRequest, IncodeGetOnboardingStatusRequest, IncodeProcessFaceRequest,
            IncodeProcessIdRequest,
        },
        response::OnboardingStartResponse,
        watchlist::{response::WatchlistResultResponse, IncodeWatchlistCheckRequest},
        IncodeResponse, IncodeStartOnboardingRequest,
    },
    middesk::{
        MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, MiddeskGetBusinessRequest,
        MiddeskGetBusinessResponse,
    },
    socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
};

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
    pub idology_client: IdologyClient, // TOOD: remove, only used for now unused idology endpoints
    pub s3_client: s3::S3Client,
    pub feature_flag_client: Arc<dyn FeatureFlagClient>,
    pub feature_flag_client_raw: LaunchDarklyFeatureFlagClient, // hack for now cause JsonFlag isn't working on the trait
    pub webhook_client: Arc<dyn WebhookClient>,
    #[allow(unused)]
    pub billing_client: billing::BillingClient,
    pub fingerprintjs_client: FingerprintJSClient,
    pub vendor_clients: VendorClients,
    pub metrics: Metrics,
}
impl State {
    /// initialize global state in test context
    #[cfg(test)]
    #[allow(clippy::expect_used)]
    pub async fn test_state() -> Self {
        use crate::utils::mock_enclave::MockEnclave;
        use feature_flag::MockFeatureFlagClient;
        use webhooks::MockWebhookClient;
        let config = Config::load_from_env().expect("failed to load config");

        let mut s = Self::init_or_die(config).await;
        s.enclave_client.replace_proxy_client(Arc::new(MockEnclave));
        s.set_ff_client(Arc::new(MockFeatureFlagClient::new()));
        s.set_webhook_client(Arc::new(MockWebhookClient::new()));
        s.set_vendor_clients(VendorClients::new_with_mocks());
        s
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
                    error=?err,
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

        let socure_production_client =
            SocureClient::new(config.socure_config.production_api_key.clone(), false)
                .expect("failed to build socure certification client");

        let webhook_service_client = webhooks::WebhookServiceClient::new(
            &config.svix_auth_token,
            vec![&GIT_HASH, &config.service_config.environment],
        );

        let billing_client = billing::BillingClient::new(config.stripe.api_key.clone());

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

        // API path interpolation requires base_url to not end in '/' or else we'll get errors from Incode (`Missing Authentication Token`, argoff can explain why we get that error if interested)
        // TODO: more intelligently do this in incode client code perhaps
        if config.incode.base_url.leak_to_string().ends_with('/') {
            panic!("config.incode.base_url cannot end with /")
        }

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

        let vendor_clients = VendorClients::new(
            socure_production_client,
            twilio_client.clone(),
            footprint_vendor_http_client,
            middesk_client,
            stytch_client,
        );

        let metrics = crate::metrics::init();

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
            feature_flag_client: Arc::new(feature_flag_client.clone()),
            feature_flag_client_raw: feature_flag_client,
            webhook_client: Arc::new(webhook_service_client),
            billing_client,
            fingerprintjs_client,
            vendor_clients,
            metrics,
        }
    }

    #[cfg(test)]
    // temporar hack until we make a proper TestState
    pub fn set_db_pool(&mut self, db_pool: DbPool) {
        self.db_pool = db_pool;
    }

    #[cfg(test)]
    pub fn set_ff_client(&mut self, ff_client: Arc<dyn FeatureFlagClient>) {
        self.feature_flag_client = ff_client;
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
    pub fn set_incode_to_real_calls(&mut self, fp_client: FootprintVendorHttpClient) {
        use crate::vendor_clients::IncodeClients;

        self.vendor_clients.incode = IncodeClients::new(Arc::new(fp_client));
    }
}

#[cfg(test)]
mod test {
    use feature_flag::{BoolFlag, MockFeatureFlagClient};
    use idv::socure::SocureIDPlusRequest;
    use macros::{test_state, test_state_case};
    use newtypes::IdvData;

    use super::*;
    use crate::decision::vendor::vendor_trait::MockVendorAPICall;
    use db::{models::tenant::Tenant, tests::test_db_pool::TestDbPool};

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

        // Test
        let flag_res = state.feature_flag_client.flag(BoolFlag::DisableAllSocure);

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

        println!("flag_res: {:?}", flag_res);
        println!("socure_res.parsed_response: {:?}", socure_res.parsed_response);
    }

    pub async fn some_db_stuff(state: &State) {
        let tenants = state.db_pool.db_query(Tenant::list_live).await.unwrap().unwrap();
        println!("some_db_stuff, tenants: {:?}", tenants);
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
        let flag_res = state.feature_flag_client.flag(BoolFlag::DisableAllSocure);
        some_db_stuff(state).await; // just for good measure
        flag_res
    }
}
