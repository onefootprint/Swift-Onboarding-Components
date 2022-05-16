use crate::auth::get_onboarding_for_tenant;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, liveness::get_opt_webauthn_creds};
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
    let uv_id = uv.id.clone();

    let missing_fields = db::models::user_vaults::MissingFields::missing_fields(uv);
    let webauthn_creds = get_opt_webauthn_creds(&state, uv_id).await?;

    match (missing_fields.len(), webauthn_creds) {
        (0, Some(_)) => Ok(Json(ApiResponseData {
            data: CommitResponse {
                footprint_user_id: onboarding.user_ob_id.clone(),
            },
        })),
        (0, None) => Err(ApiError::WebauthnCredentialsNotSet),
        (_, Some(_)) => Err(ApiError::UserMissingRequiredFields(
            missing_fields.join(","),
        )),
        _ => Err(ApiError::UserMissingWebauthnAndFields(
            missing_fields.join(","),
        )),
    }
}
