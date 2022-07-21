use crate::auth::either::Either;
use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_context::HasTenant;
use crate::auth::session_data::tenant::workos::WorkOsSession;
use crate::auth::IsLive;
use crate::types::insight_event::ApiInsightEvent;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
struct LivenessRequest {
    footprint_user_id: FootprintUserId,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
struct ApiLiveness {
    // TODO other webauthn cred fields here probably
    insight_event: ApiInsightEvent,
}

type LivenessResponse = Vec<ApiLiveness>;

#[api_v2_operation(tags(Org))]
#[get("/liveness")]
/// Allows a tenant to view a customer's registered webauthn credentials
fn get(
    state: web::Data<State>,
    request: web::Query<LivenessRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<LivenessResponse>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;

    let creds = state
        .db_pool
        .db_query(move |conn| {
            WebauthnCredential::get_for_onboarding(
                conn,
                &tenant.id,
                &request.footprint_user_id,
                auth.is_live(),
            )
        })
        .await??;

    let response = creds
        .into_iter()
        .map(|(_, insight_event)| ApiLiveness {
            insight_event: ApiInsightEvent::from(insight_event),
        })
        .collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
