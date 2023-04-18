use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};
use newtypes::RequirementStatus;
use paperclip::actix::{self, api_v2_operation, Apiv2Schema};

#[derive(Debug, serde::Serialize, Apiv2Schema)]
pub struct StatusResponse {
    status: RequirementStatus,
}

/// These shouldn't get called if we remove the identity check requirement.
/// TODO(argoff): To be deprecated
#[api_v2_operation(tags(Hosted), description = "Check the status of KYC checks for a user")]
#[actix::get("/hosted/onboarding/kyc")]
pub async fn get(user_auth: UserAuthContext) -> JsonApiResponse<StatusResponse> {
    user_auth.check_guard(UserAuthGuard::OrgOnboardingInit)?;

    let response = StatusResponse {
        status: RequirementStatus::Complete,
    };
    ResponseData::ok(response).json()
}

/// TODO(argoff): To be deprecated
#[api_v2_operation(
    tags(Hosted),
    description = "[DEPRECATED] Indicate data collection has finished and is ready to be processed by Footprint"
)]
#[actix::post("/hosted/onboarding/submit")]
pub async fn post() -> JsonApiResponse<EmptyResponse> {
    EmptyResponse::ok().json()
}
