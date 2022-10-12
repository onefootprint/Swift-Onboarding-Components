use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::{user::UserAuth, Either, SessionContext};
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::requirement_kind::RequirementKind;
use crate::types::response::ResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::insight_event::CreateInsightEvent;
use newtypes::db_types::requirement::RequirementKind as DbRequirementKind;

use db::models::onboarding::Onboarding;

use db::models::scoped_user::ScopedUser;

use newtypes::SessionAuthToken;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use super::create_onboarding_validation_token;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingResponse {
    requirements: Vec<RequirementKind>,
    /// Populated if the user has already onboarded onto this tenant's ob_configuration
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
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<OnboardingResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let session_key = state.session_sealing_key.clone();
    let (validation_token, requirements) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let uvw = UserVaultWrapper::get(conn, &user_auth.user_vault_id())?;
            if onboarding_context.ob_config().is_live != uvw.user_vault.is_live {
                return Err(OnboardingError::InvalidSandboxState.into());
            }

            let scoped_user = ScopedUser::get_or_create(
                conn,
                uvw.user_vault.id.clone(),
                onboarding_context.tenant().id.clone(),
                onboarding_context.ob_config().is_live,
            )?;

            let insight_event = CreateInsightEvent::from(insights);

            let ob = Onboarding::get_or_create(
                conn,
                scoped_user.id.clone(),
                onboarding_context.ob_config().id.clone(),
                insight_event,
            )?;

            let requirements: Vec<DbRequirementKind> = decision::create_requirements(
                conn,
                &uvw.user_vault.id,
                &ob.id,
                onboarding_context.ob_config(),
            )?
            .into_iter()
            .map(|r| r.kind)
            .collect();

            // If the user has already onboarded onto this same ob config, return a validation token
            // TODO: add in requirements here once we mark as fulfilled
            let validation_token =
                ob.is_authorized
                    .then_some(create_onboarding_validation_token(conn, &session_key, ob.id)?);
            Ok((validation_token, requirements))
        })
        .await?;

    let requirements = requirements.into_iter().map(RequirementKind::from).collect();

    ResponseData::ok(OnboardingResponse {
        validation_token,
        requirements,
    })
    .json()
}
