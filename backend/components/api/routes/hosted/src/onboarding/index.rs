use crate::auth::session::UpdateSession;
use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthGuard;
use crate::auth::user::UserAuthScope;
use crate::auth::AuthError;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::IsGuardMet;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_wire_types::hosted::onboarding::OnboardingResponse;
use db::models::business_owner::BusinessOwner;
use db::models::document_request::DocumentRequest;
use db::models::document_request::NewDocumentRequestArgs;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::IsNew;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingCreateArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::TxnPgConn;
use newtypes::CollectedDataOption;
use newtypes::CountryRestriction;
use newtypes::DataIdentifierDiscriminant;
use newtypes::DocTypeRestriction;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::ScopedVaultId;
use newtypes::Selfie;
use newtypes::VaultId;
use newtypes::VaultKind;
use newtypes::VaultPublicKey;
use newtypes::WorkflowFixtureResult;
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
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (ob, sb) = get_or_start_onboarding(
                conn,
                &scoped_user.vault_id,
                &scoped_user.id,
                &obc,
                Some(insight_event),
                maybe_new_biz_keypair,
            )?;

            // update Auth scopes
            let mut new_scopes = vec![];

            if user_auth.workflow_id().is_none() {
                // No need to add the workflow scope if we already have one from a redo flow
                // TODO: one day we should just have the client not hit this endpoint for redo flows
                if let Some(wf_id) = ob.workflow_id {
                    new_scopes.push(UserAuthScope::Workflow { wf_id });
                }
            }

            // If the ob config has business fields, create a business vault, scoped vault, and ob
            if let Some(sb) = sb {
                // Update the auth session in the DB to have the business scope, giving permission to perform other operations in onboarding.
                new_scopes.push(UserAuthScope::Business(sb.id));
            }
            let data = user_auth.data.clone().session_with_added_scopes(new_scopes);
            user_auth.update_session(conn, &session_key, data)?;

            Ok(())
        })
        .await?;

    let ff_client = state.feature_flag_client.clone();
    let onboarding_config =
        api_wire_types::OnboardingConfiguration::from_db((ob_config, tenant, None, ff_client));
    ResponseData::ok(OnboardingResponse {
        // Omit appearance serialization here
        onboarding_config,
    })
    .json()
}

pub fn get_or_start_onboarding(
    conn: &mut TxnPgConn,
    v_id: &VaultId,
    sv_id: &ScopedVaultId,
    obc: &ObConfiguration,
    insight_event: Option<CreateInsightEvent>,
    maybe_new_biz_keypair: Option<(VaultPublicKey, EncryptedVaultPrivateKey)>, // has to be generated async outside the `conn`. We also currently don't support KYB for NPV's but could one day
) -> ApiResult<(Onboarding, Option<ScopedVault>)> {
    let user_vault = Vault::lock(conn, v_id)?;

    // Create the onboarding for this scoped user
    let ob_create_args = OnboardingCreateArgs {
        scoped_vault_id: sv_id.clone(),
        ob_configuration_id: obc.id.clone(),
        insight_event: insight_event.clone(),
    };

    let fixture_result = WorkflowFixtureResult::from_sandbox_id(user_vault.sandbox_id.as_ref());
    let (ob, is_new_ob) = Onboarding::get_or_create(conn, ob_create_args, true, fixture_result)?;
    if let IsNew::Yes(ref wf) = is_new_ob {
        if let Some(doc_info) = obc
            .must_collect_data
            .iter()
            .filter_map(|cdo| match cdo {
                CollectedDataOption::Document(doc_info) => Some(doc_info),
                _ => None,
            })
            .next()
        {
            // Create a `DocumentRequest` if specified in the ob config.
            // To prevent duplicate document requests, only create a doc request if the onboarding is new
            let wf_id = wf
                .as_ref()
                .map(|wf| wf.id.clone())
                .ok_or(OnboardingError::NoWorkflow)?;
            let doc_type_restriction = if let DocTypeRestriction::Restrict(types) = doc_info.0.clone() {
                Some(types)
            } else {
                None
            };
            let args = NewDocumentRequestArgs {
                scoped_vault_id: ob.scoped_vault_id.clone(),
                ref_id: None,
                workflow_id: wf_id,
                should_collect_selfie: doc_info.2 == Selfie::RequireSelfie,
                only_us: doc_info.1 == CountryRestriction::UsOnly,
                doc_type_restriction,
            };
            DocumentRequest::create(conn, args)?;
        }
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
                sandbox_id: user_vault.sandbox_id.clone(), // Use the same sandbox ID for business vault
            };
            let business_vault = Vault::create(conn, args)?;
            BusinessOwner::create_primary(conn, user_vault.id.clone(), business_vault.id.clone())?;
            let sb = ScopedVault::get_or_create(conn, &business_vault, obc.id.clone())?;
            let ob_create_args = OnboardingCreateArgs {
                scoped_vault_id: sb.id.clone(),
                ob_configuration_id: obc.id.clone(),
                insight_event,
            };
            Onboarding::get_or_create(conn, ob_create_args, false, fixture_result)?;
            sb
        };
        Some(sb)
    } else {
        None
    };

    Ok((ob, sb))
}
