use crate::*;
use newtypes::PiiString;
use newtypes::ScopedVaultId;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedBusiness {
    pub name: PiiString,
    pub inviter: Inviter,
    pub invited: Invited,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct HostedBusinessList {
    pub id: ScopedVaultId,
    pub name: PiiString,
    pub created_at: DateTime<Utc>,
    pub is_incomplete: bool,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
/// The primary business owner that invited you to fill out a KYC form
pub struct Inviter {
    pub first_name: PiiString,
    pub last_name: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
/// Information on the secondary BO that was pre-populated by the primary BO
pub struct Invited {
    pub email: PiiString,
    pub phone_number: PiiString,
}
