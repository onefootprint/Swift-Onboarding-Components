use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOs;
use crate::auth::Either;
use crate::auth::TenantAuth;
use crate::types::liveness::ApiLiveness;
use crate::types::response::ApiResponseData;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
pub struct LivenessRequest {
    footprint_user_id: FootprintUserId,
}

#[api_v2_operation(
    summary = "/users/liveness",
    operation_id = "users-liveness",
    description = "Allows a tenant to view a customer's registered webauthn credentials.",
    tags(PublicApi)
)]
#[get("/liveness")]
pub async fn get(
    state: web::Data<State>,
    request: web::Query<LivenessRequest>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<Vec<ApiLiveness>>>, ApiError> {
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let creds = state
        .db_pool
        .db_query(move |conn| {
            WebauthnCredential::get_for_scoped_user(conn, &tenant_id, &request.footprint_user_id, is_live)
        })
        .await??;

    let response = creds.into_iter().map(ApiLiveness::from).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
