use crate::{
    auth::user::UserAuthGuard, errors::onboarding::OnboardingError, types::response::ResponseData, State,
};
use api_core::{
    auth::{
        session::{user::ValidateUserToken, AuthSessionData},
        user::{UserAuthContext, UserWfAuthContext},
        IsGuardMet,
    },
    errors::{ApiResult, AssertionError},
    types::JsonApiResponse,
    utils::{
        identify::get_user_challenge_context,
        requirements::{get_requirements_for_person_and_maybe_business, GetRequirementsArgs},
        session::AuthSession,
    },
};
use api_wire_types::hosted::validate::HostedValidateResponse;
use chrono::Duration;
use db::models::auth_event::AuthEvent;
use itertools::Itertools;
use paperclip::actix::{self, api_v2_operation, web};

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
    let (wf, sv_id, id, user_auth) = if let Some(user_wf_auth) = user_wf_auth {
        // We're generating a token after onboarding has finished
        let user_wf_auth = user_wf_auth.check_guard(UserAuthGuard::SignUp)?;

        // Verify there are no unmet requirements
        let args = GetRequirementsArgs::from(&user_wf_auth)?;
        let reqs = get_requirements_for_person_and_maybe_business(&state, args).await?;
        let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
        if !unmet_reqs.is_empty() {
            let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
            return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
        }

        let wf = user_wf_auth.workflow().clone();
        let sv_id = user_wf_auth.scoped_user.id.clone();
        let id = user_wf_auth.data.user_session.user_identifier();
        (Some(wf), sv_id, id, user_wf_auth.data.user_session)
    } else {
        // We're generating a token after auth has finished
        let user_auth = user_auth.check_guard(UserAuthGuard::Auth.or(UserAuthGuard::SignUp))?;
        let sv_id = user_auth
            .scoped_user_id()
            .ok_or(AssertionError("No scoped user associated with auth session"))?;
        let id = user_auth.user_identifier();
        (None, sv_id, id, user_auth.data)
    };
    let obc = user_auth.ob_config().cloned();

    if let Some(obc) = obc {
        if let Some(required_auth_methods) = obc.required_auth_methods() {
            // TODO don't error when there's a third-party auth event
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
    } else {
        // Don't expect this to happen, but going to add soft error before making this a hard error
        tracing::info!("Validate call with no obc");
    };

    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            if user_auth.auth_events.is_empty() {
                return Err(AssertionError("No auth events found for user").into());
            }
            // Validate as much as possible in this API instead of in the tenant-facing API.
            // If this fails, the user may be able to retry and get a new validation token.
            // But once the tenant has the validation token, they cannot do anything if it fails
            let ae_ids = user_auth.auth_events.iter().map(|e| e.id.clone()).collect_vec();
            let auth_events = AuthEvent::get_bulk(conn, &ae_ids)?;
            if !auth_events.iter().any(|ae| ae.scoped_vault_id.is_some()) {
                return Err(AssertionError("Auth event must have scoped vault").into());
            }
            if auth_events
                .iter()
                .filter_map(|ae| ae.scoped_vault_id.as_ref())
                .any(|ae_sv_id| ae_sv_id != &sv_id)
            {
                return Err(AssertionError("Auth event has different user").into());
            }
            if wf.as_ref().is_some_and(|wf| wf.scoped_vault_id != sv_id) {
                return Err(AssertionError("Workflow has different user").into());
            }
            let data = AuthSessionData::ValidateUserToken(ValidateUserToken {
                sv_id,
                auth_event_ids: ae_ids,
                wf_id: wf.map(|wf| wf.id),
            });
            let (validation_token, _) =
                AuthSession::create_sync(conn, &session_key, data, Duration::minutes(15))?;
            let auth_token_hash = validation_token.id();
            tracing::info!(%auth_token_hash, "Created validation token");
            Ok(validation_token)
        })
        .await?;

    ResponseData::ok(HostedValidateResponse { validation_token }).json()
}
