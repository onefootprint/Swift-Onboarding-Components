use std::sync::Arc;

use idv::{
    experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    footprint_http_client::FootprintVendorHttpClient,
    idology::{
        pa::{IdologyPaAPIResponse, IdologyPaRequest},
        IdologyExpectIDAPIResponse, IdologyExpectIDRequest,
    },
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
        watchlist::{
            response::{UpdatedWatchlistResultResponse, WatchlistResultResponse},
            IncodeUpdatedWatchlistResultRequest, IncodeWatchlistCheckRequest,
        },
        IncodeResponse, IncodeStartOnboardingRequest,
    },
    middesk::{
        client::MiddeskClient, MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse,
        MiddeskGetBusinessRequest, MiddeskGetBusinessResponse,
    },
    socure::{client::SocureClient, SocureIDPlusAPIResponse, SocureIDPlusRequest},
    stytch::{client::StytchClient, StytchLookupRequest, StytchLookupResponse},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
};

use crate::{decision::vendor::vendor_trait::VendorAPICall, utils::sms::SmsClient};

pub type VendorClient<Req, Resp, E> = Arc<dyn VendorAPICall<Req, Resp, E>>;

#[derive(Clone)]
pub struct IncodeClients {
    pub incode_start_onboarding: VendorClient<
        IncodeStartOnboardingRequest,
        IncodeResponse<OnboardingStartResponse>,
        idv::incode::error::Error,
    >,
    pub incode_add_front:
        VendorClient<IncodeAddFrontRequest, IncodeResponse<AddSideResponse>, idv::incode::error::Error>,
    pub incode_add_back:
        VendorClient<IncodeAddBackRequest, IncodeResponse<AddSideResponse>, idv::incode::error::Error>,
    pub incode_process_id:
        VendorClient<IncodeProcessIdRequest, IncodeResponse<ProcessIdResponse>, idv::incode::error::Error>,
    pub incode_process_face: VendorClient<
        IncodeProcessFaceRequest,
        IncodeResponse<ProcessFaceResponse>,
        idv::incode::error::Error,
    >,
    pub incode_fetch_scores: VendorClient<
        IncodeFetchScoresRequest,
        IncodeResponse<FetchScoresResponse>,
        idv::incode::error::Error,
    >,
    pub incode_add_privacy_consent: VendorClient<
        IncodeAddPrivacyConsentRequest,
        IncodeResponse<AddConsentResponse>,
        idv::incode::error::Error,
    >,
    pub incode_add_ml_consent: VendorClient<
        IncodeAddMLConsentRequest,
        IncodeResponse<AddConsentResponse>,
        idv::incode::error::Error,
    >,
    pub incode_fetch_ocr:
        VendorClient<IncodeFetchOCRRequest, IncodeResponse<FetchOCRResponse>, idv::incode::error::Error>,
    pub incode_add_selfie:
        VendorClient<IncodeAddSelfieRequest, IncodeResponse<AddSelfieResponse>, idv::incode::error::Error>,
    pub incode_watchlist_check: VendorClient<
        IncodeWatchlistCheckRequest,
        IncodeResponse<WatchlistResultResponse>,
        idv::incode::error::Error,
    >,
    pub incode_updated_watchlist_result: VendorClient<
        IncodeUpdatedWatchlistResultRequest,
        IncodeResponse<UpdatedWatchlistResultResponse>,
        idv::incode::error::Error,
    >,
    pub incode_get_onboarding_status: VendorClient<
        IncodeGetOnboardingStatusRequest,
        IncodeResponse<GetOnboardingStatusResponse>,
        idv::incode::error::Error,
    >,
}

impl IncodeClients {
    #[cfg(test)]
    pub fn new_with_mocks() -> Self {
        use crate::decision::vendor::vendor_trait::MockVendorAPICall;
        Self {
            incode_start_onboarding: Arc::new(MockVendorAPICall::<
                IncodeStartOnboardingRequest,
                IncodeResponse<OnboardingStartResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_add_front: Arc::new(MockVendorAPICall::<
                IncodeAddFrontRequest,
                IncodeResponse<AddSideResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_add_back: Arc::new(MockVendorAPICall::<
                IncodeAddBackRequest,
                IncodeResponse<AddSideResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_process_id: Arc::new(MockVendorAPICall::<
                IncodeProcessIdRequest,
                IncodeResponse<ProcessIdResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_process_face: Arc::new(MockVendorAPICall::<
                IncodeProcessFaceRequest,
                IncodeResponse<ProcessFaceResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_fetch_scores: Arc::new(MockVendorAPICall::<
                IncodeFetchScoresRequest,
                IncodeResponse<FetchScoresResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_add_privacy_consent: Arc::new(MockVendorAPICall::<
                IncodeAddPrivacyConsentRequest,
                IncodeResponse<AddConsentResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_add_ml_consent: Arc::new(MockVendorAPICall::<
                IncodeAddMLConsentRequest,
                IncodeResponse<AddConsentResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_fetch_ocr: Arc::new(MockVendorAPICall::<
                IncodeFetchOCRRequest,
                IncodeResponse<FetchOCRResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_add_selfie: Arc::new(MockVendorAPICall::<
                IncodeAddSelfieRequest,
                IncodeResponse<AddSelfieResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_get_onboarding_status: Arc::new(MockVendorAPICall::<
                IncodeGetOnboardingStatusRequest,
                IncodeResponse<GetOnboardingStatusResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_watchlist_check: Arc::new(MockVendorAPICall::<
                IncodeWatchlistCheckRequest,
                IncodeResponse<WatchlistResultResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_updated_watchlist_result: Arc::new(MockVendorAPICall::<
                IncodeUpdatedWatchlistResultRequest,
                IncodeResponse<UpdatedWatchlistResultResponse>,
                idv::incode::error::Error,
            >::new()),
        }
    }

    pub fn new(footprint_client: Arc<FootprintVendorHttpClient>) -> Self {
        Self {
            incode_start_onboarding: footprint_client.clone(),
            incode_add_front: footprint_client.clone(),
            incode_add_back: footprint_client.clone(),
            incode_process_id: footprint_client.clone(),
            incode_fetch_scores: footprint_client.clone(),
            incode_add_privacy_consent: footprint_client.clone(),
            incode_add_ml_consent: footprint_client.clone(),
            incode_fetch_ocr: footprint_client.clone(),
            incode_add_selfie: footprint_client.clone(),
            incode_process_face: footprint_client.clone(),
            incode_watchlist_check: footprint_client.clone(),
            incode_updated_watchlist_result: footprint_client.clone(),
            incode_get_onboarding_status: footprint_client,
        }
    }
}
#[derive(Clone)]
pub struct VendorClients {
    pub socure_id_plus: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    pub twilio_lookup_v2: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    pub experian_cross_core:
        VendorClient<ExperianCrossCoreRequest, ExperianCrossCoreResponse, idv::experian::error::Error>,
    pub middesk_create_business:
        VendorClient<MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, idv::middesk::Error>,
    pub middesk_get_business:
        VendorClient<MiddeskGetBusinessRequest, MiddeskGetBusinessResponse, idv::middesk::Error>,
    pub idology_expect_id:
        VendorClient<IdologyExpectIDRequest, IdologyExpectIDAPIResponse, idv::idology::error::Error>,
    pub idology_pa: VendorClient<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>,
    pub stytch_lookup: VendorClient<StytchLookupRequest, StytchLookupResponse, idv::stytch::error::Error>,
    pub incode: IncodeClients,
}

impl VendorClients {
    pub fn new(
        socure_client: SocureClient,
        twilio_client: SmsClient,
        footprint_client: FootprintVendorHttpClient,
        middesk_client: MiddeskClient,
        stytch_client: StytchClient,
    ) -> Self {
        let middesk_client = Arc::new(middesk_client);
        let footprint_client = Arc::new(footprint_client);

        Self {
            socure_id_plus: Arc::new(socure_client),
            twilio_lookup_v2: Arc::new(twilio_client.twilio_client),
            experian_cross_core: footprint_client.clone(),
            middesk_create_business: middesk_client.clone(),
            middesk_get_business: middesk_client,
            idology_expect_id: footprint_client.clone(),
            idology_pa: footprint_client.clone(),
            stytch_lookup: Arc::new(stytch_client),
            incode: IncodeClients::new(footprint_client),
        }
    }

    #[cfg(test)]
    pub fn new_with_mocks() -> Self {
        use crate::decision::vendor::vendor_trait::MockVendorAPICall;

        Self {
            socure_id_plus: Arc::new(MockVendorAPICall::<
                SocureIDPlusRequest,
                SocureIDPlusAPIResponse,
                idv::socure::Error,
            >::new()),
            twilio_lookup_v2: Arc::new(MockVendorAPICall::<
                TwilioLookupV2Request,
                TwilioLookupV2APIResponse,
                idv::twilio::Error,
            >::new()),
            experian_cross_core: Arc::new(MockVendorAPICall::<
                ExperianCrossCoreRequest,
                ExperianCrossCoreResponse,
                idv::experian::error::Error,
            >::new()),
            middesk_create_business: Arc::new(MockVendorAPICall::<
                MiddeskCreateBusinessRequest,
                MiddeskCreateBusinessResponse,
                idv::middesk::Error,
            >::new()),
            middesk_get_business: Arc::new(MockVendorAPICall::<
                MiddeskGetBusinessRequest,
                MiddeskGetBusinessResponse,
                idv::middesk::Error,
            >::new()),
            idology_pa: Arc::new(MockVendorAPICall::<
                IdologyPaRequest,
                IdologyPaAPIResponse,
                idv::idology::error::Error,
            >::new()),
            idology_expect_id: Arc::new(MockVendorAPICall::<
                IdologyExpectIDRequest,
                IdologyExpectIDAPIResponse,
                idv::idology::error::Error,
            >::new()),
            stytch_lookup: Arc::new(MockVendorAPICall::<
                StytchLookupRequest,
                StytchLookupResponse,
                idv::stytch::error::Error,
            >::new()),
            incode: IncodeClients::new_with_mocks(),
        }
    }
}
