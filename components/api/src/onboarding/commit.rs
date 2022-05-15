use crate::auth::client_public_key::PublicTenantAuthContext;
use crate::auth::get_onboarding_for_tenant;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Unique footprint user id
    footprint_user_id: FootprintUserId,
}

#[api_v2_operation]
#[post("/commit")]
/// Finish onboarding the user. Returns the footprint_user_id for login. If any necessary
/// attributes were not set, returns an error with the list of missing fields.
fn handler(
    user_auth: LoggedInSessionContext,
    tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    let onboarding = get_onboarding_for_tenant(&state.db_pool, &user_auth, &tenant_auth).await?;
    let uv = user_auth.user_vault();

    let missing_fields = db::models::user_vaults::MissingFields::missing_fields(uv);

    match missing_fields.len() {
        0 => Ok(Json(ApiResponseData {
            data: CommitResponse {
                footprint_user_id: onboarding.user_ob_id,
            },
        })),
        _ => Err(ApiError::UserMissingRequiredFields(
            missing_fields.join(","),
        )),
    }
}
