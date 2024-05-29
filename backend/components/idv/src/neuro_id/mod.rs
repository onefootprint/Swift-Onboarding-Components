use newtypes::vendor_credentials::NeuroIdCredentials;
use newtypes::NeuroIdentityId;

pub mod client;
pub mod error;
pub mod response;

pub type NeuroApiResult<T> = Result<T, error::Error>;

pub struct NeuroIdAnalyticsRequest {
    pub credentials: NeuroIdCredentials,
    pub id: NeuroIdentityId,
}
