use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
pub struct HostedBusiness {
    pub name: PiiString,
    pub inviter: Inviter,
    pub invited: Invited,
}

export_schema!(HostedBusiness);

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
/// The primary business owner that invited you to fill out a KYC form
pub struct Inviter {
    pub first_name: PiiString,
    pub last_name: PiiString,
}

export_schema!(Inviter);

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, JsonSchema)]
/// Information on the secondary BO that was pre-populated by the primary BO
pub struct Invited {
    pub email: PiiString,
    pub phone_number: PiiString,
}

export_schema!(Invited);
