use crate::{
    auth::{
        session::UpdateSession,
        user::{UserAuth, UserAuthContext, UserAuthScope},
        AuthError,
    },
    errors::{onboarding::OnboardingError, ApiError},
    types::response::ResponseData,
    utils::headers::InsightHeaders,
    State,
};
use api_core::{
    auth::{
        ob_config::ObConfigAuth,
        session::user::{NewUserSessionContext, TokenCreationPurpose},
    },
    types::JsonApiResponse,
    utils::{
        db2api::DbToApi,
        onboarding::{NewBusinessVaultArgs, NewOnboardingArgs},
        vault_wrapper::{Any, PrefillKind, VaultWrapper},
    },
};
use api_wire_types::hosted::onboarding::OnboardingResponse;
use db::models::{
    insight_event::CreateInsightEvent, ob_configuration::ObConfiguration, scoped_vault::ScopedVault,
};
use newtypes::{ObConfigurationKind, WorkflowSource};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Gets or creates the Onboarding for this (user, ob_config) pair."
)]
#[actix::post("/hosted/onboarding")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    ob_pk_auth: Option<ObConfigAuth>,
    insights: InsightHeaders,
) -> JsonApiResponse<OnboardingResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;

    let scoped_user_id = user_auth.scoped_user_id().ok_or(AuthError::MissingScopedUser)?;
    let uv_id = user_auth.user_vault_id().clone();
    let pk_obc_id = ob_pk_auth.map(|ob_pk| ob_pk.ob_config().id.clone());
    let obc_id = user_auth
        .ob_configuration_id()
        .or(pk_obc_id)
        .ok_or(OnboardingError::NoObConfig)?;
    let (scoped_user, ob_config, tenant, vw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su = ScopedVault::get(conn, (&scoped_user_id, &uv_id))?;
            // Check that the ob configuration is still active
            let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &obc_id)?;
            let vw = VaultWrapper::<Any>::build_portable(conn, &su.vault_id)?;
            Ok((su, ob_config, tenant, vw))
        })
        .await?;

    // TODO don't always create a new business vault - once we have portable businesses,
    // we should display to the client an ability to select the business they want to use
    let should_create_new_business_vault =
        ob_config.kind == ObConfigurationKind::Kyb && user_auth.scoped_business_id().is_none();
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

    let prefill_data = vw
        .get_data_to_prefill(&state, &scoped_user, &ob_config, PrefillKind::Onboarding)
        .await?;

    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let obc = ob_config.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            // If this auth token was created via API, the tenant is specifically requesting that
            // a new Workflow is created, even if one already exists
            let force_create = user_auth.data.is_from_api();
            let args = NewOnboardingArgs {
                existing_wf_id: user_auth.workflow_id(),
                wfr_id: user_auth.wfr_id.clone(),
                force_create,
                sv: &scoped_user,
                obc: &obc,
                insight_event: Some(insight_event.clone()),
                new_biz_args: maybe_new_biz_args,
                source: WorkflowSource::Hosted,
                actor: None,
                maybe_prefill_data: Some(prefill_data),
            };
            let (wf_id, biz_wf) = api_core::utils::onboarding::get_or_start_onboarding(conn, args)?;

            // Update auth token with new identifiers
            // TODO should we issue a new token here for good measure?
            let args = NewUserSessionContext {
                wf_id: user_auth.workflow_id().is_none().then_some(wf_id),
                obc_id: user_auth
                    .ob_configuration_id()
                    .is_none()
                    .then_some(obc.id.clone()),
                sb_id: biz_wf.map(|wf| wf.scoped_vault_id),
                ..Default::default()
            };
            let session = user_auth.data.session.clone();
            let session = session.update(args, vec![], TokenCreationPurpose::AddWorkflow, None)?;
            user_auth.update_session(conn, &session_key, session)?;

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
