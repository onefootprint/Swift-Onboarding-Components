use crate::*;
use newtypes::BoId;
use newtypes::PiiString;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedBusinessDetail {
    pub name: PiiString,
    pub inviter: Inviter,
    /// The basic data provided for the user accepting this invitation.
    pub invited_data: ModernUserDecryptResponse,
}


#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedBusiness {
    pub id: BoId,
    pub name: PiiString,
    pub created_at: DateTime<Utc>,
    pub last_activity_at: DateTime<Utc>,
    pub is_incomplete: bool,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
/// The primary business owner that invited you to fill out a KYC form
pub struct Inviter {
    pub first_name: PiiString,
    pub last_name: PiiString,
}
