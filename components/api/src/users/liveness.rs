use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::types::liveness::ApiLiveness;
use crate::types::response::ApiResponseData;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
struct LivenessRequest {
    footprint_user_id: FootprintUserId,
}

type LivenessResponse = Vec<ApiLiveness>;

#[api_v2_operation(tags(Org, Users))]
#[get("/liveness")]
/// Allows a tenant to view a customer's registered webauthn credentials
fn get(
    state: web::Data<State>,
    request: web::Query<LivenessRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<LivenessResponse>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live(&state.db_pool).await?;

    let creds = state
        .db_pool
        .db_query(move |conn| {
            WebauthnCredential::get_for_scoped_user(conn, &tenant.id, &request.footprint_user_id, is_live)
        })
        .await??;

    let response = creds.into_iter().map(ApiLiveness::from).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
