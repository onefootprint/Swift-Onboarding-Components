use crate::auth::tenant::ObPkAuth;
use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::auth::AuthError;

use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use db::models::insight_event::CreateInsightEvent;

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
    ob_pk_auth: ObPkAuth,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<OnboardingResponse>>, ApiError> {
    let mut user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboardingInit])?;
    let uv_id = user_auth.user_vault_id();

    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            UserVault::lock(conn, &uv_id)?;
            let scoped_user = user_auth
                .scoped_user(conn)?
                .ok_or_else(|| AuthError::MissingScope(vec![UserAuthScopeDiscriminant::OrgOnboardingInit]))?;

            let insight_event = CreateInsightEvent::from(insights);
            let should_create_document_request = ob_pk_auth.ob_config().must_collect_identity_document;

            let ob_create_args = OnboardingCreateArgs {
                scoped_user_id: scoped_user.id,
                ob_configuration_id: ob_pk_auth.ob_config().id.clone(),
                insight_event,
                // Create a `DocumentRequest` if specified in the ob config.
                // We do this inside the OB creation to make this route more idempotent
                should_create_document_request,
            };

            let ob = Onboarding::get_or_create(conn, ob_create_args)?;
            // Update the auth session in the DB to have the OrgOnboarding scope, giving permission
            // to perform other operations
            let data = user_auth.data.clone().add_scope(UserAuthScope::OrgOnboarding);
            user_auth.update_session(conn, &session_key, data)?;

            // If the user has already onboarded onto this same ob config, return a validation token
            let validation_token =
                ob.is_authorized
                    .then_some(create_onboarding_validation_token(conn, &session_key, ob.id)?);

            Ok(validation_token)
        })
        .await?;

    ResponseData::ok(OnboardingResponse { validation_token }).json()
}
