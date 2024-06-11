use crate::{
    Apiv2Schema,
    Serialize,
};
use newtypes::{
    BusinessOwnerKind,
    FpId,
    OnboardingStatus,
};
use serde::Deserialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct PrivateBusinessOwner {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<FpId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<OnboardingStatus>,
    pub ownership_stake: Option<u32>,
    pub kind: BusinessOwnerKind,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct PrivateOwnedBusiness {
    pub id: FpId,
    pub status: OnboardingStatus,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct BusinessOwner {
    pub fp_id: FpId,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct NewBusinessOwnerRequest {
    pub fp_id: FpId,
    /// The percentage of the business that this user owns, between 0 and 100 (inclusive).
    pub ownership_stake: i32,
}
