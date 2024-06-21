use api_core::auth::user::UserAuthContext;
use api_core::errors::AssertionError;
use api_core::types::ApiResponse;
use api_wire_types::hosted::neuro_id::NeuroIdentityIdResponse;
use newtypes::NeuroIdentityId;
use newtypes::UserAuthScope;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Retrieve identifier used for NeuroId"
)]
#[actix::get("/hosted/onboarding/nid")]
pub async fn get(user_auth: UserAuthContext) -> ApiResponse<NeuroIdentityIdResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;

    let wf_id = user_auth
        .workflow_id()
        .ok_or(AssertionError("auth missing wf_id"))?;

    let id = NeuroIdentityId::from(wf_id);

    Ok(NeuroIdentityIdResponse { id })
}
