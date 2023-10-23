use crate::auth::session::UpdateSession;
use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthGuard;
use crate::auth::AuthError;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::session::user::UserSessionArgs;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::onboarding::NewBusinessVaultArgs;
use api_wire_types::hosted::onboarding::OnboardingResponse;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use newtypes::DataIdentifierDiscriminant;
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
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;

    let scoped_user_id = user_auth.scoped_user_id().ok_or(AuthError::MissingScopedUser)?;
    let uv_id = user_auth.user_vault_id().clone();
    let obc_id = user_auth.ob_configuration_id();
    let (scoped_user, ob_config, tenant) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su = ScopedVault::get(conn, (&scoped_user_id, &uv_id))?;
            let obc_id = obc_id.ok_or(OnboardingError::NoObConfig)?;
            // Check that the ob configuration is still active
            let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &obc_id)?;
            Ok((su, ob_config, tenant))
        })
        .await??;

    // TODO don't always create a new business vault - once we have portable businesses,
    // we should display to the client an ability to select the business they want to use
    let should_create_new_business_vault = ob_config.must_collect(DataIdentifierDiscriminant::Business)
        && user_auth.scoped_business_id().is_none();
    let maybe_new_biz_args = if should_create_new_business_vault {
        // If we're going to make a new business vault,
        let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
        Some(NewBusinessVaultArgs {
            public_key,
            e_private_key,
            should_create_workflow: true,
        })
    } else {
        None
    };
    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let obc = ob_config.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (wf_id, biz_wf) = api_core::utils::onboarding::get_or_start_onboarding(
                conn,
                // TODO do we always create a new WF when there isn't one attached? or do we sometimes inherit???
                user_auth.workflow_id(),
                user_auth.is_from_api,
                &scoped_user.vault_id,
                &scoped_user.id,
                &obc,
                Some(insight_event.clone()),
                maybe_new_biz_args,
            )?;

            // Update auth token with new identifiers
            let args = UserSessionArgs {
                wf_id: user_auth.workflow_id().is_none().then_some(wf_id),
                sb_id: biz_wf.map(|wf| wf.scoped_vault_id),
                ..Default::default()
            };
            let data = user_auth.data.clone().update(args, vec![], None)?;
            user_auth.update_session(conn, &session_key, data)?;

            Ok(())
        })
        .await?;

    let ff_client = state.feature_flag_client.clone();
    let onboarding_config =
        api_wire_types::PublicOnboardingConfiguration::from_db((ob_config, tenant, None, None, ff_client));
    ResponseData::ok(OnboardingResponse {
        // Omit appearance serialization here
        onboarding_config,
    })
    .json()
}
