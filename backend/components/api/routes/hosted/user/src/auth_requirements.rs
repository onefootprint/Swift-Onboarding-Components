use crate::auth::user::UserAuthContext;
use crate::State;
use api_core::auth::Any;
use api_core::errors::ValidationError;
use api_core::utils::requirements::get_register_auth_method_requirements;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiResponse;
use api_core::FpResult;
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
    let user_auth = user_auth.check_guard(api_core::auth::Any)?;
    let obc = (user_auth.obc.clone()).ok_or(ValidationError("No playbook associated with this session"))?;
    let sv_id = (user_auth.su_id.clone()).ok_or(ValidationError("No scoped user associated with session"))?;

    let requirements = state
        .db_query(move |conn| -> FpResult<_> {
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv_id)?;
            let reqs = get_register_auth_method_requirements(conn, &obc, &user_auth.auth_events, &vw)?;
            Ok(reqs)
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
