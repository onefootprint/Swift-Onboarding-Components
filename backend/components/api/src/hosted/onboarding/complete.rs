use crate::auth::key_context::ob_public_key::PublicOnboardingContext;
use crate::auth::session_data::ob_session::ParsedOnboardingSession;
use crate::auth::session_data::user::UserAuthScope;
use crate::auth::Either;
use crate::auth::SessionContext;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::onboarding::Onboarding;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::SessionAuthToken;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Footprint validation token
    validation_token: SessionAuthToken,
    /// Boolean true / false if webauthn set
    missing_webauthn_credentials: bool,
}

#[api_v2_operation(
    summary = "/hosted/onboarding/complete",
    operation_id = "hosted-onboarding-complete",
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the footprint_user_id for login. If any \
    necessary attributes were not set, returns an error with the list of missing fields."
)]
#[post("/complete")]
fn handler(
    user_auth: UserAuth,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<CommitResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &user_auth.user_vault_id()))
        .await??;
    let missing_fields = uvw.missing_fields(onboarding_context.ob_config());
    if !missing_fields.is_empty() {
        return Err(OnboardingError::UserMissingRequiredFields(missing_fields.iter().join(", ")).into());
    }

    let session_key = state.session_sealing_key.clone();
    let (validation_token, webauthn_creds) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let ob = Onboarding::get_by_config(conn, &uvw.user_vault.id, &onboarding_context.ob_config().id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            // Create validation token
            let validation_token = super::create_onboarding_validation_token(conn, &session_key, ob.id)?;
            let webauthn_creds = WebauthnCredential::get_for_user_vault(conn, &uvw.user_vault.id)?;
            Ok((validation_token, webauthn_creds))
        })
        .await?;

    Ok(Json(ResponseData {
        data: CommitResponse {
            validation_token,
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}
