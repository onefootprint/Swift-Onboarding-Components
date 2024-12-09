use crate::Apiv2Response;
use crate::Apiv2Schema;
use crate::Serialize;
use newtypes::BoId;
use newtypes::BusinessOwnerKind;
use newtypes::BusinessOwnerSource;
use newtypes::DataIdentifier;
use newtypes::DecisionStatus;
use newtypes::FpId;
use newtypes::OnboardingStatus;
use newtypes::PiiString;
use newtypes::SessionAuthToken;
use newtypes::WorkflowId;
use serde::Deserialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PrivateBusinessOwner {
    pub id: BoId,
    pub fp_id: Option<FpId>,
    pub ownership_stake: Option<u32>,
    /// The vault field that can be used to update the ownership stake.
    pub ownership_stake_di: DataIdentifier,
    pub kind: BusinessOwnerKind,
    pub source: BusinessOwnerSource,
    pub name: Option<PiiString>,
    /// DEPRECATED. The status of the business owner's scoped vault
    pub status: Option<OnboardingStatus>,
    /// The status of the beneficial owner, computed from the latest onboarding decision on the
    /// user's workflow associated with the business's latest KYB workflow.
    pub bo_status: BeneficialOwnerStatus,
}

#[derive(
    Debug, strum_macros::Display, Clone, Copy, serde_with::SerializeDisplay, Apiv2Schema, macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum BeneficialOwnerStatus {
    Fail,
    Pass,
    None,
    AwaitingKyc,
    Incomplete,
    Pending,
}

impl From<DecisionStatus> for BeneficialOwnerStatus {
    fn from(status: DecisionStatus) -> Self {
        match status {
            DecisionStatus::Fail => Self::Fail,
            DecisionStatus::Pass => Self::Pass,
            DecisionStatus::None => Self::None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct PrivateBusinessOwnerUserWorkflow {
    pub id: WorkflowId,
    pub latest_decision: Option<crate::PublicOnboardingDecision>,
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

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateKycLinksRequest {
    /// The list of business owner IDs to which we should send KYC links via both email + SMS.
    /// Will generate and return links for all BOs regardless.
    #[serde(default)]
    #[openapi(optional)]
    #[openapi(example = r#"["bo_EBYciq9X2bkIPMMqnL4R9P"]"#)]
    pub send_to_bo_ids: Vec<BoId>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PrivateBusinessOwnerKycLink {
    #[openapi(example = "bo_EBYciq9X2bkIPMMqnL4R9P")]
    pub id: BoId,
    #[openapi(example = "Jane D.")]
    pub name: Option<PiiString>,
    #[openapi(
        example = "https://api.onefootprint.com?type=bo&r=380#botok_2dpe8Wye1ZJLsx6KoppVGdcxGzh2HUwjwR"
    )]
    pub link: PiiString,
    #[openapi(example = "botok_2dpe8Wye1ZJLsx6KoppVGdcxGzh2HUwjwR")]
    pub token: SessionAuthToken,
}
