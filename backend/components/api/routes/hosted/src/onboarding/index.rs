use crate::auth::session::UpdateSession;
use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthGuard;
use crate::auth::user::UserAuthScope;
use crate::auth::AuthError;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::onboarding::GetRequirementsArgs;
use crate::types::response::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::IsGuardMet;
use api_core::errors::AssertionError;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_wire_types::hosted::onboarding::OnboardingResponse;
use db::models::business_owner::BusinessOwner;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::IsNew;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingCreateArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use newtypes::DataIdentifierDiscriminant;
use newtypes::VaultKind;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[actix::post("/hosted/onboarding")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<OnboardingResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let scoped_user_id = user_auth
        .scoped_user_id()
        .ok_or_else(|| AuthError::MissingScope(vec![UserAuthGuard::OrgOnboarding].into()))?;
    let uv_id = user_auth.user_vault_id().clone();
    let (scoped_user, ob_config, tenant) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su = ScopedVault::get(conn, (&scoped_user_id, &uv_id))?;
            let ob_configuration_id = su
                .ob_configuration_id
                .as_ref()
                .ok_or(OnboardingError::NonPortableScopedUser)?;
            // Check that the ob configuration is still active
            let (ob_config, tenant) = ObConfiguration::get_enabled(conn, ob_configuration_id)?;
            Ok((su, ob_config, tenant))
        })
        .await??;

    // TODO don't always create a new business vault - once we have portable businesses,
    // we should display to the client an ability to select the business they want to use
    let should_create_new_business_vault = ob_config.must_collect(DataIdentifierDiscriminant::Business)
        && !UserAuthGuard::Business.is_met(&user_auth.scopes);
    let maybe_new_biz_keypair = if should_create_new_business_vault {
        // If we're going to make a new business vault,
        Some(state.enclave_client.generate_sealed_keypair().await?)
    } else {
        None
    };
    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let obc = ob_config.clone();
    let (ob, sb, wf) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let user_vault = Vault::lock(conn, user_auth.user_vault_id())?;

            // Create the onboarding for this scoped user
            let ob_create_args = OnboardingCreateArgs {
                scoped_vault_id: scoped_user.id,
                ob_configuration_id: obc.id.clone(),
                insight_event: insight_event.clone(),
            };

            let (ob, is_new_ob) = Onboarding::get_or_create(conn, ob_create_args, true)?;

            if let IsNew::Yes(ref wf) = is_new_ob {
                if obc.must_collect(DataIdentifierDiscriminant::Document) {
                    // Create a `DocumentRequest` if specified in the ob config.
                    // To prevent duplicate document requests, only create a doc request if the onboarding is new
                    let collect_selfie = obc.must_collect_selfie();
                    let wf_id = wf.as_ref().map(|wf| wf.id.clone());
                    DocumentRequest::create(conn, ob.scoped_vault_id.clone(), None, collect_selfie, wf_id)?;
                }
            }

            let mut new_scopes = vec![];

            let wf = match is_new_ob {
                IsNew::Yes(Some(wf)) => Some(wf),
                _ => None,
            };
            if let Some(ref wf) = wf {
                new_scopes.push(UserAuthScope::Workflow { wf_id: wf.id.clone() });
            }

            // If the ob config has business fields, create a business vault, scoped vault, and ob
            let sb = if let Some(maybe_new_biz_keypair) = maybe_new_biz_keypair {
                let existing_businesses = BusinessOwner::list_businesses(conn, &user_vault.id, &obc.id)?;
                let sb = if let Some(existing) = existing_businesses.into_iter().next() {
                    // If the user has already started onboarding their business onto this exact
                    // ob config, we should locate it.
                    // Note, this isn't quite portablizing the business since we only locate it
                    // when onboarding onto the exact same ob config
                    existing.1 .0
                } else {
                    let (public_key, e_private_key) = maybe_new_biz_keypair;
                    let args = NewVaultArgs {
                        public_key,
                        e_private_key,
                        is_live: user_vault.is_live,
                        is_portable: true,
                        kind: VaultKind::Business,
                        is_fixture: false,
                    };
                    let business_vault = Vault::create(conn, args)?;
                    BusinessOwner::create_primary(conn, user_vault.id.clone(), business_vault.id.clone())?;
                    let ob_config_id = scoped_user
                        .ob_configuration_id
                        .ok_or(AssertionError("Expected scoped user vault to have ob config id"))?;
                    let sb = ScopedVault::get_or_create(conn, &business_vault, ob_config_id)?;
                    let ob_create_args = OnboardingCreateArgs {
                        scoped_vault_id: sb.id.clone(),
                        ob_configuration_id: obc.id.clone(),
                        insight_event: insight_event.clone(),
                    };
                    Onboarding::get_or_create(conn, ob_create_args, false)?;
                    sb
                };
                // Update the auth session in the DB to have the business scope, giving permission to perform other operations in onboarding.
                new_scopes.push(UserAuthScope::Business(sb.id.clone()));
                Some(sb)
            } else {
                None
            };

            let data = user_auth.data.clone().session_with_added_scopes(new_scopes);
            user_auth.update_session(conn, &session_key, data)?;

            Ok((ob, sb, wf))
        })
        .await?;

    let already_authorized = if ob.authorized_at.is_some() {
        // If the onboarding is authorized, double check that we don't have any remaining
        // requirements before telling the frontend to skip processing requirements
        let args = GetRequirementsArgs {
            ob_config: ob_config.clone(),
            onboarding: ob,
            workflow: wf,
            sb_id: sb.map(|sb| sb.id),
        };
        let reqs = crate::onboarding::get_requirements(&state, args).await?;
        reqs.into_iter().all(|r| r.is_met())
    } else {
        false
    };
    let onboarding_config = api_wire_types::OnboardingConfiguration::from_db((ob_config, tenant, None));
    ResponseData::ok(OnboardingResponse {
        already_authorized,
        // Omit appearance serialization here
        onboarding_config,
    })
    .json()
}
