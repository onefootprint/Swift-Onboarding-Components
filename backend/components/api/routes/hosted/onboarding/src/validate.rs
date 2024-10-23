use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::IsGuardMet;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::onboarding::UnmetRequirements;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::utils::requirements::get_register_auth_method_requirements;
use api_core::utils::requirements::get_requirements_for_person_and_maybe_business;
use api_core::utils::requirements::GetRequirementsArgs;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_route_hosted_core::validation_token::create_validation_token;
use api_wire_types::hosted::onboarding_validate::HostedValidateResponse;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Finish onboarding the user. Returns the validation token that can be exchanged for a permanent Footprint user token."
)]
#[actix::post("/hosted/onboarding/validate")]
pub async fn post(
    state: web::Data<State>,
    // We should build some better consolidation for accepting these two auths
    user_auth: UserAuthContext,
    user_wf_auth: Option<UserWfAuthContext>,
) -> ApiResponse<HostedValidateResponse> {
    let (wf, user_auth) = if let Some(user_wf_auth) = user_wf_auth {
        // We're generating a token after onboarding has finished
        let user_wf_auth = user_wf_auth.check_guard(UserAuthScope::SignUp)?;

        // Verify there are no unmet requirements
        let args = GetRequirementsArgs::from(&user_wf_auth)?;
        let reqs = get_requirements_for_person_and_maybe_business(&state, args).await?;
        let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
        if !unmet_reqs.is_empty() {
            return Err(OnboardingError::from(UnmetRequirements(unmet_reqs)).into());
        }

        let wf = user_wf_auth.workflow.clone();
        (Some(wf), user_wf_auth.data.user_session)
    } else {
        // We're generating a token after auth has finished
        let user_auth = user_auth.check_guard(UserAuthScope::Auth.or(UserAuthScope::SignUp))?;
        let obc = (user_auth.obc.clone()).ok_or(ValidationError("No playbook associated with session"))?;
        let su_id =
            (user_auth.su_id.clone()).ok_or(ValidationError("No scoped user associated with session"))?;
        let auth_events = user_auth.auth_events.clone();
        let reqs = state
            .db_query(move |conn| -> FpResult<_> {
                let vw = VaultWrapper::<Any>::build_for_tenant(conn, &su_id)?;
                let reqs = get_register_auth_method_requirements(conn, &obc, &auth_events, &vw)?;
                Ok(reqs)
            })
            .await?;
        let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
        if !unmet_reqs.is_empty() {
            return Err(OnboardingError::from(UnmetRequirements(unmet_reqs)).into());
        }
        (None, user_auth.data)
    };

    let validation_token = create_validation_token(&state, user_auth, wf).await?;
    Ok(HostedValidateResponse { validation_token })
}
