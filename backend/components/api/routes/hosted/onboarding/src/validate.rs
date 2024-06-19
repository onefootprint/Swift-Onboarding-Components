use api_core::auth::user::{
    load_auth_events,
    UserAuthContext,
    UserAuthScope,
    UserIdentifier,
    UserWfAuthContext,
};
use api_core::auth::IsGuardMet;
use api_core::errors::onboarding::{
    OnboardingError,
    UnmetRequirements,
};
use api_core::errors::AssertionError;
use api_core::types::JsonApiResponse;
use api_core::utils::identify::get_user_challenge_context;
use api_core::utils::requirements::{
    get_requirements_for_person_and_maybe_business,
    GetRequirementsArgs,
};
use api_core::State;
use api_route_hosted_core::validation_token::create_validation_token;
use api_wire_types::hosted::validate::HostedValidateResponse;
use itertools::Itertools;
use newtypes::AuthEventKind;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
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
) -> JsonApiResponse<HostedValidateResponse> {
    let (wf, sv_id, user_auth) = if let Some(user_wf_auth) = user_wf_auth {
        // We're generating a token after onboarding has finished
        let user_wf_auth = user_wf_auth.check_guard(UserAuthScope::SignUp)?;

        // Verify there are no unmet requirements
        let args = GetRequirementsArgs::from(&user_wf_auth)?;
        let reqs = get_requirements_for_person_and_maybe_business(&state, args).await?;
        let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
        if !unmet_reqs.is_empty() {
            return Err(OnboardingError::from(UnmetRequirements(unmet_reqs)).into());
        }

        let wf = user_wf_auth.workflow().clone();
        let sv_id = user_wf_auth.scoped_user.id.clone();
        (Some(wf), sv_id, user_wf_auth.data.user_session)
    } else {
        // We're generating a token after auth has finished
        let user_auth = user_auth.check_guard(UserAuthScope::Auth.or(UserAuthScope::SignUp))?;
        let sv_id = user_auth
            .scoped_user_id()
            .ok_or(AssertionError("No scoped user associated with auth session"))?;
        (None, sv_id, user_auth.data)
    };
    let obc = user_auth.ob_config().cloned();

    let has_3p_auth = {
        let auth_events = user_auth.auth_events.clone();
        let auth_events = state
            .db_pool
            .db_query(move |conn| load_auth_events(conn, &auth_events))
            .await?;
        auth_events
            .iter()
            .any(|(ae, _)| ae.kind == AuthEventKind::ThirdParty)
    };
    if !has_3p_auth {
        // Third-party auth won't register an auth method, so we should waive the requirement that
        // the playbook's auth methods are met.
        // Perhaps when we start having more proper use of 3p auth from apiture we should actually
        // mark the phone as verified
        if let Some(obc) = obc {
            // There won't be an obc associated with auth tokens that were generated via API
            // without a playbook key.
            if let Some(required_auth_methods) = obc.required_auth_methods() {
                let id = UserIdentifier::ScopedVault(sv_id.clone());
                let ctx = get_user_challenge_context(&state, id, None).await?;
                let verified_auth_methods = ctx
                    .auth_methods
                    .into_iter()
                    .filter(|m| m.is_verified)
                    .map(|m| m.kind)
                    .collect_vec();
                if let Some(missing_method) = required_auth_methods
                    .iter()
                    .find(|m| !verified_auth_methods.contains(m))
                {
                    // TODO hard error
                    tracing::info!(%missing_method, ?verified_auth_methods, "Missing required auth method");
                } else {
                    tracing::info!("All auth methods provided");
                }
            }
        }
    }

    let validation_token = create_validation_token(&state, user_auth, wf).await?;
    Ok(HostedValidateResponse { validation_token })
}
