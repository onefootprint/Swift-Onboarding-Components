use crate::auth::user::UserAuthContext;
use crate::State;
use api_core::auth::Any;
use api_core::errors::ValidationError;
use api_core::utils::requirements::get_register_auth_method_requirements;
use api_core::ApiResponse;
use api_wire_types::hosted::onboarding_status::ApiOnboardingRequirement;
use api_wire_types::hosted::onboarding_status::AuthRequirementsResponse;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Challenge, Hosted),
    description = "Returns the set of auth requirements to satisfy the auth portion of the playbook in the provided session"
)]
#[actix::get("/hosted/user/auth_requirements")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> ApiResponse<AuthRequirementsResponse> {
    let user_auth = user_auth.check_guard(Any)?;
    let obc = user_auth
        .ob_config()
        .ok_or(ValidationError("No playbook associated with this session"))?
        .clone();
    let sv_id = user_auth
        .scoped_user_id()
        .ok_or(ValidationError("No scoped user associated with session"))?;

    let requirements = state
        .db_pool
        .db_query(move |conn| {
            get_register_auth_method_requirements(conn, &obc, &sv_id, &user_auth.auth_events)
        })
        .await?;

    let all_requirements = requirements
        .into_iter()
        .map(|r| ApiOnboardingRequirement {
            is_met: r.is_met(),
            requirement: r,
        })
        .collect_vec();
    let result = AuthRequirementsResponse { all_requirements };
    Ok(result)
}
