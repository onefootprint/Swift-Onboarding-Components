use super::create_onboarding_validation_token;
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
use db::models::business_owner::BusinessOwner;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingCreateArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use newtypes::SessionAuthToken;
use newtypes::VaultKind;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

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

    let user_auth2 = user_auth.clone();
    let (scoped_user, ob_config) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = user_auth2.scoped_user(conn)?.ok_or_else(|| {
                AuthError::MissingScope(vec![UserAuthScopeDiscriminant::OrgOnboardingInit].into())
            })?;
            let ob_configuration_id = scoped_user
                .ob_configuration_id
                .as_ref()
                .ok_or(OnboardingError::NonPortableScopedUser)?;
            // Check that the ob configuration is still active
            let (ob_config, _) = ObConfiguration::get_enabled(conn, ob_configuration_id)?;
            Ok((scoped_user, ob_config))
        })
        .await??;

    // TODO don't always create a new business vault - once we have portable businesses,
    // we should display to the client an ability to select the business they want to use
    let should_create_new_business_vault = ob_config.must_collect_business();
    let new_business_keypair = if should_create_new_business_vault {
        // If we're going to make a new business vault,
        Some(state.enclave_client.generate_sealed_keypair().await?)
    } else {
        None
    };

    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let validation_token = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let user_vault = Vault::lock(conn, user_auth.user_vault_id())?;

            // Create the onboarding for this scoped user
            let ob_create_args = OnboardingCreateArgs {
                scoped_user_id: scoped_user.id,
                ob_configuration_id: ob_config.id.clone(),
                insight_event: insight_event.clone(),
            };
            let (ob, is_new_ob) = Onboarding::get_or_create(conn, ob_create_args)?;
            if is_new_ob && ob_config.must_collect_document() {
                // Create a `DocumentRequest` if specified in the ob config.
                // To prevent duplicate document requests, only create a doc request if the onboarding is new
                DocumentRequest::create(
                    conn,
                    ob.scoped_user_id.clone(),
                    None,
                    ob_config.must_collect_selfie(),
                    None,
                )?;
            }

            // If the ob config has business fields, create a business vault, scoped vault, and ob
            let business_scope = if let Some(new_business_keypair) = new_business_keypair {
                let (public_key, e_private_key) = new_business_keypair;
                let args = NewVaultArgs {
                    public_key,
                    e_private_key,
                    is_live: user_vault.is_live,
                    is_portable: true,
                    kind: VaultKind::Business,
                };
                // TODO don't create a business vault for this onboarding if already exists. Can
                // also short circuit if ob config is authorized
                let business_vault = Vault::create(conn, args)?;
                BusinessOwner::create(conn, user_vault.id.clone(), business_vault.id.clone())?;
                let ob_config_id = scoped_user.ob_configuration_id.ok_or_else(|| {
                    ApiError::AssertionError("Expected scoped user vault to have ob config id".to_owned())
                })?;
                let sb = ScopedVault::get_or_create(conn, &business_vault, ob_config_id)?;
                let ob_create_args = OnboardingCreateArgs {
                    scoped_user_id: sb.id.clone(),
                    ob_configuration_id: ob_config.id.clone(),
                    insight_event: insight_event.clone(),
                };
                Onboarding::get_or_create(conn, ob_create_args)?;
                Some(UserAuthScope::Business(sb.id))
            } else {
                None
            };

            // Update the auth session in the DB to have the OrgOnboarding scope and potentially
            // business scope, giving permission to perform other operations in onboarding.
            let new_scopes = vec![UserAuthScope::OrgOnboarding]
                .into_iter()
                .chain(business_scope.into_iter())
                .collect();
            let data = user_auth.data.clone().add_scopes(new_scopes);
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
