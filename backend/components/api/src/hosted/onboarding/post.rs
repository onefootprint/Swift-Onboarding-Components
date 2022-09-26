use crate::auth::key_context::ob_public_key::PublicOnboardingContext;
use crate::auth::session_data::ob_session::ParsedOnboardingSession;
use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::{Either, SessionContext, VerifiedUserAuth};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::insight_event::CreateInsightEvent;
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;
use newtypes::SessionAuthToken;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use super::create_onboarding_validation_token;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingResponse {
    // Populated if the user has already onboarded onto this tenant's ob_configuration
    validation_token: Option<SessionAuthToken>,
}

#[api_v2_operation(
    summary = "/hosted/onboarding",
    operation_id = "hosted-onboarding",
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
pub fn handler(
    state: web::Data<State>,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    user_auth: UserAuth,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<OnboardingResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let uvw = UserVaultWrapper::get(conn, &user_auth.user_vault_id())?;
            if onboarding_context.ob_config().is_live != uvw.user_vault.is_live {
                return Err(OnboardingError::InvalidSandboxState.into());
            }

            let scoped_user = ScopedUser::get_or_create(
                conn,
                uvw.user_vault.id,
                onboarding_context.tenant().id.clone(),
                onboarding_context.ob_config().is_live,
            )?;
            let insight_event = CreateInsightEvent::from(insights);
            let ob = Onboarding::get_or_create(
                conn,
                scoped_user.id,
                onboarding_context.ob_config().id.clone(),
                insight_event,
            )?;
            // TODO create a document request if necessary
            // https://linear.app/footprint/issue/FP-1414/create-documentrequest-rows

            // If the user has already onboarded onto this same ob config, return a validation token
            let validation_token =
                ob.is_authorized
                    .then_some(create_onboarding_validation_token(conn, &session_key, ob.id)?);
            Ok(validation_token)
        })
        .await?;

    ResponseData::ok(OnboardingResponse { validation_token }).json()
}
