use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::utils::sms::SmsClient;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::idology::pa::IdologyPaAPIResponse;
use idv::idology::pa::IdologyPaRequest;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::incode::curp_validation::response::CurpValidationResponse;
use idv::incode::curp_validation::IncodeCurpValidationRequest;
use idv::incode::doc::response::AddConsentResponse;
use idv::incode::doc::response::AddSelfieResponse;
use idv::incode::doc::response::AddSideResponse;
use idv::incode::doc::response::FetchOCRResponse;
use idv::incode::doc::response::FetchScoresResponse;
use idv::incode::doc::response::GetOnboardingStatusResponse;
use idv::incode::doc::response::ProcessFaceResponse;
use idv::incode::doc::response::ProcessIdResponse;
use idv::incode::doc::IncodeAddBackRequest;
use idv::incode::doc::IncodeAddFrontRequest;
use idv::incode::doc::IncodeAddMLConsentRequest;
use idv::incode::doc::IncodeAddPrivacyConsentRequest;
use idv::incode::doc::IncodeAddSelfieRequest;
use idv::incode::doc::IncodeFetchOCRRequest;
use idv::incode::doc::IncodeFetchScoresRequest;
use idv::incode::doc::IncodeGetOnboardingStatusRequest;
use idv::incode::doc::IncodeProcessFaceRequest;
use idv::incode::doc::IncodeProcessIdRequest;
use idv::incode::government_validation::request::IncodeGovernmentValidationRequest;
use idv::incode::government_validation::response::GovernmentValidationResponse;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::watchlist::response::UpdatedWatchlistResultResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::watchlist::IncodeUpdatedWatchlistResultRequest;
use idv::incode::watchlist::IncodeWatchlistCheckRequest;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::lexis::client::LexisFlexIdRequest;
use idv::lexis::client::LexisFlexIdResponse;
use idv::middesk::client::MiddeskClient;
use idv::middesk::MiddeskCreateBusinessRequest;
use idv::middesk::MiddeskCreateBusinessResponse;
use idv::middesk::MiddeskGetBusinessRequest;
use idv::middesk::MiddeskGetBusinessResponse;
use idv::neuro_id::response::NeuroApiResponse;
use idv::neuro_id::NeuroIdAnalyticsRequest;
use idv::samba::common::SambaGetReportRequest;
use idv::samba::common::SambaOrderRequest;
use idv::samba::response::license_validation::GetLVOrderResponse;
use idv::samba::response::CreateOrderResponse;
use idv::samba::SambaAPIResponse;
use idv::sentilink::SentilinkAPIResponse;
use idv::sentilink::SentilinkApplicationRiskRequest;
use idv::socure::client::SocureClient;
use idv::socure::SocureIDPlusAPIResponse;
use idv::socure::SocureIDPlusRequest;
use idv::stytch::client::StytchClient;
use idv::stytch::StytchLookupRequest;
use idv::stytch::StytchLookupResponse;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use newtypes::SambaLicenseValidationCreate;
use newtypes::SambaLicenseValidationGetReport;
use std::sync::Arc;

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
    pub incode_curp_validation: VendorClient<
        IncodeCurpValidationRequest,
        IncodeResponse<CurpValidationResponse>,
        idv::incode::error::Error,
    >,
    pub incode_government_validation: VendorClient<
        IncodeGovernmentValidationRequest,
        IncodeResponse<GovernmentValidationResponse>,
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
            incode_curp_validation: Arc::new(MockVendorAPICall::<
                IncodeCurpValidationRequest,
                IncodeResponse<CurpValidationResponse>,
                idv::incode::error::Error,
            >::new()),
            incode_government_validation: Arc::new(MockVendorAPICall::<
                IncodeGovernmentValidationRequest,
                IncodeResponse<GovernmentValidationResponse>,
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
            incode_get_onboarding_status: footprint_client.clone(),
            incode_curp_validation: footprint_client.clone(),
            incode_government_validation: footprint_client.clone(),
        }
    }
}

#[derive(Clone)]
pub struct SambaClients {
    pub samba_create_license_validation_order: VendorClient<
        SambaOrderRequest<SambaLicenseValidationCreate>,
        SambaAPIResponse<CreateOrderResponse>,
        idv::samba::error::Error,
    >,
    pub samba_get_license_validation_report: VendorClient<
        SambaGetReportRequest<SambaLicenseValidationGetReport>,
        SambaAPIResponse<GetLVOrderResponse>,
        idv::samba::error::Error,
    >,
}

impl SambaClients {
    #[cfg(test)]
    pub fn new_with_mocks() -> Self {
        use crate::decision::vendor::vendor_trait::MockVendorAPICall;
        Self {
            samba_create_license_validation_order: Arc::new(MockVendorAPICall::<
                SambaOrderRequest<SambaLicenseValidationCreate>,
                SambaAPIResponse<CreateOrderResponse>,
                idv::samba::error::Error,
            >::new()),
            samba_get_license_validation_report: Arc::new(MockVendorAPICall::<
                SambaGetReportRequest<SambaLicenseValidationGetReport>,
                SambaAPIResponse<GetLVOrderResponse>,
                idv::samba::error::Error,
            >::new()),
        }
    }

    pub fn new(footprint_client: Arc<FootprintVendorHttpClient>) -> Self {
        Self {
            samba_create_license_validation_order: footprint_client.clone(),
            samba_get_license_validation_report: footprint_client.clone(),
        }
    }
}

#[derive(Clone)]
pub struct SentilinkClients {
    pub sentilink_application_risk:
        VendorClient<SentilinkApplicationRiskRequest, SentilinkAPIResponse, idv::sentilink::error::Error>,
}

impl SentilinkClients {
    #[cfg(test)]
    pub fn new_with_mocks() -> Self {
        use crate::decision::vendor::vendor_trait::MockVendorAPICall;
        Self {
            sentilink_application_risk: Arc::new(MockVendorAPICall::<
                SentilinkApplicationRiskRequest,
                SentilinkAPIResponse,
                idv::sentilink::error::Error,
            >::new()),
        }
    }

    pub fn new(footprint_client: Arc<FootprintVendorHttpClient>) -> Self {
        Self {
            sentilink_application_risk: footprint_client.clone(),
        }
    }
}

#[derive(Clone)]
pub struct VendorClients {
    pub socure_id_plus: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    pub twilio_lookup_v2: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    pub experian_cross_core:
        VendorClient<ExperianCrossCoreRequest, ExperianCrossCoreResponse, idv::experian::error::Error>,
    pub lexis_flex_id: VendorClient<LexisFlexIdRequest, LexisFlexIdResponse, idv::lexis::Error>,
    pub middesk_create_business:
        VendorClient<MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, idv::middesk::Error>,
    pub middesk_get_business:
        VendorClient<MiddeskGetBusinessRequest, MiddeskGetBusinessResponse, idv::middesk::Error>,
    pub idology_expect_id:
        VendorClient<IdologyExpectIDRequest, IdologyExpectIDAPIResponse, idv::idology::error::Error>,
    pub idology_pa: VendorClient<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>,
    pub stytch_lookup: VendorClient<StytchLookupRequest, StytchLookupResponse, idv::stytch::error::Error>,
    pub neuro_id: VendorClient<NeuroIdAnalyticsRequest, NeuroApiResponse, idv::neuro_id::error::Error>,
    pub incode: IncodeClients,
    pub samba: SambaClients,
    pub sentilink: SentilinkClients,
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
            lexis_flex_id: footprint_client.clone(),
            middesk_create_business: middesk_client.clone(),
            middesk_get_business: middesk_client,
            idology_expect_id: footprint_client.clone(),
            idology_pa: footprint_client.clone(),
            stytch_lookup: Arc::new(stytch_client),
            neuro_id: footprint_client.clone(),
            incode: IncodeClients::new(footprint_client.clone()),
            samba: SambaClients::new(footprint_client.clone()),
            sentilink: SentilinkClients::new(footprint_client),
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
            lexis_flex_id: Arc::new(MockVendorAPICall::<
                LexisFlexIdRequest,
                LexisFlexIdResponse,
                idv::lexis::Error,
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
            neuro_id: Arc::new(MockVendorAPICall::<
                NeuroIdAnalyticsRequest,
                NeuroApiResponse,
                idv::neuro_id::error::Error,
            >::new()),
            incode: IncodeClients::new_with_mocks(),
            samba: SambaClients::new_with_mocks(),
            sentilink: SentilinkClients::new_with_mocks(),
        }
    }
}
