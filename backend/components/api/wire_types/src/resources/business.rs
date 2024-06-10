use newtypes::{
    ExternalId,
    FpId,
    OnboardingStatus,
};
use paperclip::actix::Apiv2Schema;
use serde::Serialize;

/// Basic information about a business
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Business {
    #[openapi(example = "fp_bid_7p793EF07xKXHqAeg5VGPj")]
    pub id: FpId,
    pub requires_manual_review: bool,
    pub status: OnboardingStatus,
    pub external_id: Option<ExternalId>,
}
