use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::ModernApiResult;
use crate::utils::headers::TelemetryHeaders;
use crate::State;
use actix_web::web::Json;
use api_core::FpResult;
use api_wire_types::hosted::fingerprint_visit::FingerprintVisitRequest;
use db::models::fingerprint_visit_event::FingerprintVisitEvent;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Records a fingerprint visitorID for the Fingerprint SDK in the frontend"
)]
#[actix::post("/hosted/onboarding/fp")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    telemetry_headers: TelemetryHeaders,
    request: Json<FingerprintVisitRequest>,
) -> ModernApiResult<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;

    let FingerprintVisitRequest {
        visitor_id,
        path,
        request_id,
    } = request.into_inner();

    tokio::spawn(async move {
        let response = state
            .fingerprintjs_client
            .get_event(request_id.clone().into())
            .await;

        let resp = match response {
            Ok(r) => Some(r),
            Err(e) => {
                tracing::warn!(e = ?e, "error fetching fingerprint result from API");
                None
            }
        };

        let db_res = state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let user_vault_id = user_auth.user_vault_id().clone();
                let scoped_user_id = user_auth.scoped_user_id();

                FingerprintVisitEvent::create(
                    conn,
                    visitor_id.clone().into(),
                    request_id.into(),
                    Some(user_vault_id.clone()),
                    scoped_user_id.clone(),
                    path,
                    telemetry_headers.session_id.clone(),
                    resp,
                )?;

                // associate session_id with visitor_id and other identifiers in logs so we can see things in
                // observe
                tracing::info!(
                    // fp_session_id is used in telemetry to avoid conflicting with session_id,
                    // which is reserved for Datadog RUM.
                    fp_session_id=%format!("{:?}", telemetry_headers.session_id),
                    visitor_id=%visitor_id,
                    user_vault_id=%user_vault_id,
                    scoped_user_id=%format!("{:?}", scoped_user_id),
                    "fingerprint visit"
                );

                Ok(())
            })
            .await;

        if let Err(err) = db_res {
            tracing::error!(?err, "error saving fingerprint result")
        }
    });

    Ok(api_wire_types::Empty)
}
