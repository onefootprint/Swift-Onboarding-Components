use crate::State;
use api_core::auth::session::user::ContactInfoVerifySessionData;
use api_core::auth::session::AuthSessionData;
use api_core::auth::session::UpdateSession;
use api_core::auth::user::ContactInfoVerifyAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::FpResult;
use api_errors::ServerErr;
use api_errors::UnauthorizedInto;
use api_wire_types::Empty;
use api_wire_types::GetVerifyContactInfoResponse;
use chrono::Utc;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEventArgs;
use db::models::data_lifetime::DataLifetime;
use db::models::insight_event::CreateInsightEvent;
use db::models::insight_event::InsightEvent;
use db::models::scoped_vault::ScopedVault;
use newtypes::ActionKind;
use newtypes::AuthEventKind;
use newtypes::IdentifyScope;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Creates an auth event to mark the provided contact info as verified."
)]
#[actix::post("/hosted/identify/verify_contact_info")]
pub async fn post(
    state: web::Data<State>,
    insight_headers: InsightHeaders,
    auth: ContactInfoVerifyAuth,
) -> ApiResponse<Empty> {
    let session_key = state.session_sealing_key.clone();
    state
        .db_transaction(move |conn| {
            let session = auth.clone().lock(conn, &session_key)?.into_inner();
            let AuthSessionData::ContactInfoVerify(session_data) = session.data else {
                return UnauthorizedInto("Incorrect session kind");
            };
            if session_data.auth_event_id.is_some() {
                // No-op if we've already verified this contact info
                return Ok(());
            }

            let sv_txn = auth
                .su_id
                .as_ref()
                .map(|sv_id| -> FpResult<_> {
                    let sv = ScopedVault::lock(conn, sv_id)?;
                    DataLifetime::new_sv_txn(conn, sv)
                })
                .transpose()?;

            // let sv_txn = sv
            //     .as_ref()
            //     .map(|sv| -> FpResult<_> { })
            //     .transpose()?;

            // Specifically save the insight event from the phone that clicked on the link
            let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
            let ae_args = NewAuthEventArgs {
                vault_id: auth.user_vault_id.clone(),
                sv_txn,
                insight_event_id: Some(insight.id),
                kind: AuthEventKind::SmsLink,
                webauthn_credential_id: None,
                created_at: Utc::now(),
                // This feature is generally unused, it's only displayed in the list of auth events on the
                // dashboard. Perhaps not necessary
                scope: IdentifyScope::Onboarding,
                // Since we only support these links for signup challenges, we know this is always AddPrimary
                new_auth_method_action: Some(ActionKind::AddPrimary),
            };
            let event = AuthEvent::save(ae_args, conn)?;
            // Now, set the auth_event_id on the session data
            let session_data = ContactInfoVerifySessionData {
                auth_event_id: Some(event.id),
                ..session_data
            };
            auth.update_session(conn, &session_key, session_data.into())?;
            Ok(())
        })
        .await?;
    Ok(Empty)
}


#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Get context on a verify contact info session."
)]
#[actix::get("/hosted/identify/verify_contact_info")]
pub async fn get(
    state: web::Data<State>,
    auth: ContactInfoVerifyAuth,
) -> ApiResponse<GetVerifyContactInfoResponse> {
    let insight_event_id = auth.data.data.insight_event_id.clone();
    let insight_event = state
        .db_query(move |conn| InsightEvent::get(conn, &insight_event_id))
        .await?;
    let tenant = (auth.data.tenant.as_ref()).ok_or(ServerErr("No tenant found"))?;
    let response = GetVerifyContactInfoResponse {
        origin_insight_event: api_wire_types::InsightEvent::from_db(insight_event),
        tenant_name: tenant.name.clone(),
        is_verified: auth.data.data.auth_event_id.is_some(),
    };
    Ok(response)
}
