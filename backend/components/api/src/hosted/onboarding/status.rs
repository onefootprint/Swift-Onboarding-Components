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
use newtypes::onboarding_requirement::OnboardingRequirement;
use newtypes::KycStatus;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingStatusResponse {
    requirements: Vec<OnboardingRequirement>,
}

#[api_v2_operation(
    summary = "/hosted/onboarding/status",
    operation_id = "hosted-onboarding",
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[get("/status")]
pub fn handler(
    state: web::Data<State>,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ResponseData<OnboardingStatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let requirements = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let uvw = UserVaultWrapper::get(conn, &user_auth.user_vault_id())?;
            let onboarding =
                Onboarding::get_by_config(conn, &uvw.user_vault.id, &onboarding_context.ob_config().id)?
                    .ok_or(OnboardingError::NoOnboarding)?;
            let creds = WebauthnCredential::get_for_user_vault(conn, &user_auth.data.user_vault_id)?;
            let missing_attributes = uvw.missing_fields(onboarding_context.ob_config());
            let requirements = vec![
                (onboarding.kyc_status == KycStatus::New)
                    .then_some(OnboardingRequirement::IdentityCheck { missing_attributes }),
                (creds.is_empty() && !onboarding.is_liveness_skipped)
                    .then_some(OnboardingRequirement::Liveness),
                // TODO generate CollectDocument requirement
            ]
            .into_iter()
            .flatten()
            .collect();
            Ok(requirements)
        })
        .await??;

    ResponseData::ok(OnboardingStatusResponse { requirements }).json()
}
