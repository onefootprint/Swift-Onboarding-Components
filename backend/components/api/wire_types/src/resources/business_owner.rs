use crate::Apiv2Response;
use crate::Apiv2Schema;
use crate::Serialize;
use newtypes::BusinessOwnerKind;
use newtypes::BusinessOwnerSource;
use newtypes::DataIdentifier;
use newtypes::FpId;
use newtypes::OnboardingStatus;
use newtypes::PiiString;
use serde::Deserialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PrivateBusinessOwner {
    pub fp_id: Option<FpId>,
    pub status: Option<OnboardingStatus>,
    pub ownership_stake: Option<u32>,
    /// The vault field that can be used to update the ownership stake.
    pub ownership_stake_di: DataIdentifier,
    pub kind: BusinessOwnerKind,
    pub source: BusinessOwnerSource,
    pub name: Option<PiiString>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PrivateOwnedBusiness {
    pub id: FpId,
    pub status: OnboardingStatus,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct BusinessOwner {
    pub fp_id: FpId,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct NewBusinessOwnerRequest {
    pub fp_id: FpId,
    /// The percentage of the business that this user owns, between 0 and 100 (inclusive).
    #[openapi(example = "20")]
    pub ownership_stake: i32,
}
