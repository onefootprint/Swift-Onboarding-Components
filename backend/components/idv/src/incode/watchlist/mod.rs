use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::AmlMatchKind;
use newtypes::IdvData;
use newtypes::IncodeWatchlistResultRef;

pub mod request;
pub mod response;

pub struct IncodeWatchlistCheckRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub idv_data: IdvData,
    pub match_kind: AmlMatchKind,
}

pub struct IncodeUpdatedWatchlistResultRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub ref_: IncodeWatchlistResultRef,
}
