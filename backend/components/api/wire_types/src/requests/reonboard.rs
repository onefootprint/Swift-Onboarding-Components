use crate::*;
use newtypes::PiiString;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ReonboardResponse {
    /// A Footprint link specific to this user that can be sent to reonboard the user
    #[openapi(example = "https://verify.onefootprint.com/?type=user#tok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt")]
    pub link: PiiString,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
}
