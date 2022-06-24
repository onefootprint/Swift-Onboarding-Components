use crate::auth::session_context::{HasUserVaultId, SessionContext};
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::{client_public_key::PublicTenantAuthContext, get_onboarding_for_tenant};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::{models::insight_event::CreateInsightEvent, webauthn_credentials::get_webauthn_creds};
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
    user_auth: SessionContext<OnboardingSession>,
    tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    let onboarding = get_onboarding_for_tenant(&state.db_pool, &user_auth, &tenant_auth).await?;
    let uv = user_auth.user_vault(&state.db_pool).await?;

    let uv_id = uv.id.clone();

    let uvw = UserVaultWrapper::from(&state.db_pool, uv.clone()).await?;
    let missing_fields = uvw
        .missing_fields()
        .into_iter()
        // check if we're missing something that's required
        .filter(|x| tenant_auth.ob_config.required_user_data.contains(x))
        .map(|x| x.to_string())
        .collect::<Vec<String>>();
    let webauthn_creds = get_webauthn_creds(&state.db_pool, uv_id).await?;
    // TODO kick off user verification with data vendors

    if missing_fields.is_empty() {
        // record the insight for this onboarding
        CreateInsightEvent::from(insights).insert(&state.db_pool).await?;
        // TODO add it to the onboarding table

        Ok(Json(ApiResponseData {
            data: CommitResponse {
                footprint_user_id: onboarding.user_ob_id.clone(),
                missing_webauthn_credentials: webauthn_creds.is_empty(),
            },
        }))
    } else {
        Err(ApiError::UserMissingRequiredFields(missing_fields.join(",")))
    }
}
