use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::TelemetryHeaders;
use crate::State;
use actix_web::web::Json;
use api_wire_types::hosted::fingerprint_visit::FingerprintVisitRequest;
use db::models::fingerprint_visit_event::FingerprintVisitEvent;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Private),
    description = "Records a fingerprint visitorID for the Fingerprint SDK in the frontend"
)]
#[actix::post("/hosted/onboarding/fp")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    telemetry_headers: TelemetryHeaders,
    request: Json<FingerprintVisitRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboardingInit])?;

    let FingerprintVisitRequest { visitor_id, path } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let user_vault_id = user_auth.user_vault_id().clone();
            let scoped_user_id = user_auth.scoped_user_id();

            FingerprintVisitEvent::create(
                conn,
                visitor_id.into(),
                Some(user_vault_id),
                scoped_user_id,
                path,
                telemetry_headers.session_id,
            )?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
