use api_core::auth::session::user::ValidateUserToken;
use api_core::auth::session::AuthSessionData;
use api_core::auth::user::UserSessionContext;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use chrono::Duration;
use db::models::auth_event::AuthEvent;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::SessionAuthToken;

pub async fn create_validation_token(
    state: &State,
    user_auth: UserSessionContext,
    wf: Option<Workflow>,
) -> FpResult<SessionAuthToken> {
    let session_key = state.session_sealing_key.clone();
    let su_id = (user_auth.su_id.clone()).ok_or(ServerErr("No scoped user associated with auth session"))?;
    let biz_wf_id = user_auth.biz_wf_id.clone();
    let validation_token = state
        .db_query(move |conn| {
            if user_auth.auth_events.is_empty() {
                return ServerErrInto("No auth events found for user");
            }
            // Validate as much as possible in this API instead of in the tenant-facing API.
            // If this fails, the user may be able to retry and get a new validation token.
            // But once the tenant has the validation token, they cannot do anything if it fails
            let ae_ids = user_auth.auth_events.iter().map(|e| e.id.clone()).collect_vec();
            let auth_events = AuthEvent::get_bulk(conn, &ae_ids)?;
            if !auth_events.iter().any(|ae| ae.scoped_vault_id.is_some()) {
                return ServerErrInto("Auth event must have scoped vault");
            }
            if auth_events
                .iter()
                .filter_map(|ae| ae.scoped_vault_id.as_ref())
                .any(|ae_sv_id| ae_sv_id != &su_id)
            {
                return ServerErrInto("Auth event has different user");
            }
            if wf.as_ref().is_some_and(|wf| wf.scoped_vault_id != su_id) {
                return ServerErrInto("Workflow has different user");
            }
            let data = AuthSessionData::ValidateUserToken(ValidateUserToken {
                sv_id: su_id,
                auth_event_ids: ae_ids,
                wf_id: wf.map(|wf| wf.id),
                biz_wf_id,
            });
            let (validation_token, _) =
                AuthSession::create_sync(conn, &session_key, data, Duration::minutes(15))?;
            Ok(validation_token)
        })
        .await?;
    Ok(validation_token)
}
