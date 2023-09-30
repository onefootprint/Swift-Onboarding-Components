use newtypes::{vendor_credentials::IncodeCredentialsWithToken, IdvData, IncodeWatchlistResultRef};

pub mod request;
pub mod response;

pub struct IncodeWatchlistCheckRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub idv_data: IdvData,
}

pub struct IncodeUpdatedWatchlistResultRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub ref_: IncodeWatchlistResultRef,
}
