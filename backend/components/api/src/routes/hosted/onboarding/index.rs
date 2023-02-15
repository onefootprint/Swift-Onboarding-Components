use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::auth::AuthError;

use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use db::models::insight_event::CreateInsightEvent;

use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;

use db::models::onboarding::OnboardingCreateArgs;

use db::models::user_vault::UserVault;
use newtypes::SessionAuthToken;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

use super::create_onboarding_validation_token;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingResponse {
    /// Populated if the user has already onboarded onto this tenant's ob_configuration
    validation_token: Option<SessionAuthToken>,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[actix::post("/hosted/onboarding")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<OnboardingResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboardingInit])?;

    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            UserVault::lock(conn, user_auth.user_vault_id())?;
            // By the time we call POST /hosted/onboarding, we expect that the user auth token was
            // created with a tenant's onboarding config PK. This will have already created a
            // ScopedUser and associated it with the user auth token.
            let scoped_user = user_auth.scoped_user(conn)?.ok_or_else(|| {
                AuthError::MissingScope(vec![UserAuthScopeDiscriminant::OrgOnboardingInit].into())
            })?;
            let ob_configuration_id = scoped_user
                .ob_configuration_id
                .ok_or(OnboardingError::NonPortableScopedUser)?;
            // Check that the ob configuration is still active
            let (ob_config, _) = ObConfiguration::get_enabled(conn, &ob_configuration_id)?;

            let insight_event = CreateInsightEvent::from(insights);
            let should_create_document_request = ob_config.must_collect_identity_document;
            let should_collect_selfie = ob_config.must_collect_selfie;

            let ob_create_args = OnboardingCreateArgs {
                scoped_user_id: scoped_user.id,
                ob_configuration_id,
                insight_event,
                // Create a `DocumentRequest` if specified in the ob config.
                // We do this inside the OB creation to make this route more idempotent
                should_create_document_request,
                should_collect_selfie,
            };

            let ob = Onboarding::get_or_create(conn, ob_create_args)?;
            // Update the auth session in the DB to have the OrgOnboarding scope, giving permission
            // to perform other operations
            let data = user_auth.data.clone().add_scope(UserAuthScope::OrgOnboarding);
            user_auth.update_session(conn, &session_key, data)?;

            // If the user has already onboarded onto this same ob config, return a validation token
            let validation_token = ob
                .authorized_at
                .map(|_| create_onboarding_validation_token(conn, &session_key, ob.id))
                .transpose()?;

            Ok(validation_token)
        })
        .await?;

    ResponseData::ok(OnboardingResponse { validation_token }).json()
}
