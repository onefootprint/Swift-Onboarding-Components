use newtypes::{vendor_credentials::IncodeCredentialsWithToken, DocVData};

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
