use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::auth::{user::UserAuth, Either, SessionContext};

use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::CreateInsightEvent;

use db::models::onboarding::Onboarding;

use db::models::scoped_user::ScopedUser;

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
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<OnboardingResponse>>, ApiError> {
    let mut user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboardingInit])?;

    let uv_id = user_auth.user_vault_id();
    
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &uv_id))
        .await??;

    let must_collect_document_e_data_key = if onboarding_context.ob_config().must_collect_identity_document {
        Some(
            state
                .enclave_client
                .generated_sealed_data_key(&uvw.user_vault.public_key)
                .await?,
        )
    } else {
        None
    };

    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
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
            // Update the auth session in the DB to have the OrgOnboarding scope tied to this onboarding
            // Even though the OrgOnboardingInit scope is only used by this endpoint, we notably don't remove
            // it since we want this endpoint to be idempotent (in case the client needs to retry)
            let data = user_auth
                .data
                .clone()
                .replace_scope(UserAuthScope::OrgOnboarding { id: ob.id.clone() });
            user_auth.update_session(conn, &session_key, data)?;

            // If the user has already onboarded onto this same ob config, return a validation token
            let validation_token = ob.is_authorized.then_some(create_onboarding_validation_token(
                conn,
                &session_key,
                ob.id.clone(),
            )?);

            // Create a `DocumentRequest` if specified in the ob config and the user has not already passed onboarding
            if let Some(e_data_key) = must_collect_document_e_data_key {
                DocumentRequest::create(conn, ob.id, None, e_data_key)?;
            }

            Ok(validation_token)
        })
        .await?;

    ResponseData::ok(OnboardingResponse { validation_token }).json()
}
