use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::types::response::ResponseData;
use crate::State;
use api_core::{
    auth::{
        session::{user::ValidateUserToken, AuthSessionData},
        user::{UserAuthContext, UserWfAuthContext},
    },
    errors::{ApiResult, AssertionError},
    types::JsonApiResponse,
    utils::session::AuthSession,
};
use api_wire_types::hosted::validate::HostedValidateResponse;
use chrono::Duration;
use db::models::auth_event::AuthEvent;
use itertools::Itertools;
use newtypes::ObConfigurationKind;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the validation token that can be exchanged for a permanent Footprint user token."
)]
#[actix::post("/hosted/onboarding/validate")]
pub async fn post(
    state: web::Data<State>,
    // We should build some better consolidation for accepting these two auths
    user_auth: UserAuthContext,
    user_wf_auth: Option<UserWfAuthContext>,
) -> JsonApiResponse<HostedValidateResponse> {
    let (wf, user_auth) = if let Some(user_wf_auth) = user_wf_auth {
        // Token from onboarding
        let user_wf_auth = user_wf_auth.check_guard(UserAuthGuard::SignUp)?;

        // Verify there are no unmet requirements
        let reqs = api_core::utils::requirements::get_requirements_for_person_and_maybe_business(
            &state,
            api_core::utils::requirements::GetRequirementsArgs::from(&user_wf_auth)?,
        )
        .await?;
        let unmet_reqs = reqs.into_iter().filter(|r| !r.is_met()).collect_vec();
        if !unmet_reqs.is_empty() {
            let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
            return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
        }

        let wf = user_wf_auth.workflow().clone();
        (Some(wf), user_wf_auth.data.user_session)
    } else {
        // Token from auth
        let user_auth = user_auth.check_guard(UserAuthGuard::Auth)?;
        let ob_config = user_auth
            .ob_config()
            .ok_or(OnboardingError::ObConfigKindNotAuth)?;
        if ob_config.kind != ObConfigurationKind::Auth {
            return Err(OnboardingError::ObConfigKindNotAuth.into());
        }
        // TODO assert there are no "requirements" remaining for the auth playbook here.
        // Maybe just assert that everything is collected that must be collected, in case we start
        // collecting phone
        (None, user_auth.data)
    };
    let sv_id = user_auth
        .scoped_user_id()
        .ok_or(AssertionError("No scoped user associated with auth session"))?;
    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let auth_event_ids = if !user_auth.auth_event_ids.is_empty() {
                user_auth.auth_event_ids
            } else {
                // This should never happen, but will add logging for now and rm this branch later
                // TODO rm this logic and always use from token. assert there's always an auth event
                tracing::error!("No auth event ID associated with auth token");
                let (events, _) = AuthEvent::list(conn, &sv_id, None)?;
                if events.is_empty() {
                    return Err(AssertionError("No auth events found for user").into());
                }
                events.first().into_iter().map(|e| e.event.id.clone()).collect()
            };
            // Validate as much as possible in this API instead of in the tenant-facing API.
            // If this fails, the user may be able to retry and get a new validation token.
            // But once the tenant has the validation token, they cannot do anything if it fails
            let auth_events = AuthEvent::get_bulk(conn, &auth_event_ids)?;
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
                auth_event_ids,
                wf_id: wf.map(|wf| wf.id),
            });
            let (validation_token, _) =
                AuthSession::create_sync(conn, &session_key, data, Duration::minutes(15))?;
            Ok(validation_token)
        })
        .await??;

    ResponseData::ok(HostedValidateResponse { validation_token }).json()
}
