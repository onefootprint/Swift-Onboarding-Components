use newtypes::{vendor_credentials::IncodeCredentialsWithToken, IdvData};

pub mod request;
pub mod response;

pub struct IncodeWatchlistCheckRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub idv_data: IdvData,
}
