use crate::auth::get_onboarding_for_tenant;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, liveness::get_webauthn_creds};
use db::models::user_vaults::UserVaultWrapper;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Unique footprint user id
    footprint_user_id: FootprintUserId,
    /// Boolean true / false if webauthn set
    missing_webauthn_credentials: bool,
}

#[api_v2_operation(tags(Onboarding))]
#[post("/complete")]
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

    let uvw = UserVaultWrapper::from(&state.db_pool, uv.clone()).await?;
    let missing_fields = uvw
        .missing_fields()
        .into_iter()
        .map(|x| x.to_string())
        .collect::<Vec<String>>();
    let webauthn_creds = get_webauthn_creds(&state, uv_id).await?;
    // TODO kick off user verification with data vendors

    if missing_fields.is_empty() {
        Ok(Json(ApiResponseData {
            data: CommitResponse {
                footprint_user_id: onboarding.user_ob_id.clone(),
                missing_webauthn_credentials: webauthn_creds.is_empty(),
            },
        }))
    } else {
        Err(ApiError::UserMissingRequiredFields(
            missing_fields.join(","),
        ))
    }
}
