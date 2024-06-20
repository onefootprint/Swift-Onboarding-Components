use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::DocVData;
use newtypes::IncodeVerificationSessionId;
use newtypes::IncodeVerificationSessionKind;

pub mod request;
pub mod response;

pub struct IncodeAddFrontRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}
pub struct IncodeAddBackRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}

pub struct IncodeAddSelfieRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub docv_data: DocVData,
}
pub struct IncodeProcessFaceRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeGetOnboardingStatusRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub session_kind: IncodeVerificationSessionKind,
    pub incode_verification_session_id: IncodeVerificationSessionId,
    pub wait_for_selfie: bool,
}

pub struct IncodeProcessIdRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeFetchScoresRequest {
    pub credentials: IncodeCredentialsWithToken,
}

pub struct IncodeAddPrivacyConsentRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub title: String,
    pub content: String,
}

pub struct IncodeAddMLConsentRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub status: bool,
}

pub struct IncodeFetchOCRRequest {
    pub credentials: IncodeCredentialsWithToken,
}
