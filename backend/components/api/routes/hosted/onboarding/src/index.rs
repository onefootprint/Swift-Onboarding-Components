use crate::auth::session::UpdateSession;
use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::AuthError;
use crate::errors::onboarding::OnboardingError;
use crate::utils::headers::InsightHeaders;
use crate::FpError;
use crate::State;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::types::ApiResponse;
use api_core::utils::actix::OptionalJson;
use api_core::utils::db2api::DbToApi;
use api_core::utils::onboarding::NewBusinessWfArgs;
use api_core::utils::onboarding::NewOnboardingArgs;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::PrefillKind;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_wire_types::hosted::onboarding::OnboardingResponse;
use api_wire_types::PostOnboardingRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_request::WorkflowRequest;
use newtypes::ObConfigurationKind;
use newtypes::VerificationCheckKind;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowSource;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

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
    request: OptionalJson<PostOnboardingRequest>,
) -> ApiResponse<OnboardingResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let request = request.into_inner().unwrap_or_default();

    let scoped_user_id = user_auth.scoped_user_id().ok_or(AuthError::MissingScopedUser)?;
    let uv_id = user_auth.user_vault_id().clone();
    let pk_obc_id = ob_pk_auth.map(|ob_pk| ob_pk.ob_config().id.clone());
    let obc_id = user_auth
        .ob_configuration_id()
        .or(pk_obc_id)
        .ok_or(OnboardingError::NoObConfig)?;

    let wfr_id = user_auth.wfr_id.clone();
    let (scoped_user, ob_config, tenant, vw, wfr) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let su = ScopedVault::get(conn, (&scoped_user_id, &uv_id))?;
            // Check that the ob configuration is still active
            let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &obc_id)?;
            let vw = VaultWrapper::<Any>::build_portable(conn, &su.vault_id)?;
            let wfr = wfr_id
                .map(|id| WorkflowRequest::get(conn, &id, &su.id))
                .transpose()?;
            Ok((su, ob_config, tenant, vw, wfr))
        })
        .await?;

    let collecting_biz_doc = match wfr.map(|wfr| wfr.config) {
        Some(WorkflowRequestConfig::Document { business_configs, .. }) => !business_configs.is_empty(),
        _ => false,
    };
    let should_create_biz_wf = (ob_config.kind == ObConfigurationKind::Kyb || collecting_biz_doc)
        && user_auth.business_workflow_id().is_none();

    let maybe_new_biz_args = if should_create_biz_wf {
        // If we're going to make a new business vault,
        if let Some(sb_id) = user_auth.scoped_business_id() {
            Some(NewBusinessWfArgs::NewWorkflow { sb_id })
        } else {
            let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
            Some(NewBusinessWfArgs::MaybeNewVaultAndWf {
                public_key,
                e_private_key,
            })
        }
    } else {
        None
    };

    let prefill_data = vw
        .get_data_to_prefill(&state, &ob_config, PrefillKind::Onboarding(&scoped_user))
        .await?;

    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let obc = ob_config.clone();
    let is_neuro_enabled = obc
        .verification_checks()
        .get(VerificationCheckKind::NeuroId)
        .is_some();
    let auth_token = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, FpError> {
            // TODO: allow_reonboard here technically allows creating multiple Workflows per auth token. This
            // is harmless, but ideally we have idempotency protection here and only allow creating one
            // onboarding for the purpose of associating with the auth session.

            // If this auth token allows reonboarding OR the playbook is opted into always allow reonboarding,
            // force create a new workflwo
            let force_create = user_auth.data.allow_reonboard || ob_config.allow_reonboard;
            let args = NewOnboardingArgs {
                existing_wf_id: user_auth.workflow_id(),
                wfr_id: user_auth.wfr_id.clone(),
                force_create,
                sv: &scoped_user,
                seqno: vw.seqno,
                obc: &obc,
                insight_event: Some(insight_event.clone()),
                new_biz_args: maybe_new_biz_args,
                source: WorkflowSource::Hosted,
                fixture_result: request.fixture_result,
                kyb_fixture_result: request.kyb_fixture_result,
                actor: None,
                maybe_prefill_data: Some(prefill_data),
                is_neuro_enabled,
                is_secondary_bo: user_auth.is_secondary_bo(),
            };
            let (wf_id, biz_wf, _) = api_core::utils::onboarding::get_or_start_onboarding(conn, args)?;

            // Update auth token with new identifiers
            // TODO should we issue a new token here for good measure?
            let (biz_wf_id, sb_id) = biz_wf.map(|wf| (wf.id, wf.scoped_vault_id)).unzip();
            let args = NewUserSessionContext {
                wf_id: user_auth.workflow_id().is_none().then_some(wf_id),
                biz_wf_id,
                sb_id,
                obc_id: user_auth
                    .ob_configuration_id()
                    .is_none()
                    .then_some(obc.id.clone()),
                ..Default::default()
            };
            let session = user_auth.update(args, vec![], TokenCreationPurpose::AddWorkflow, None)?;
            let (auth_token, _) = user_auth.create_derived(conn, &session_key, session.clone(), None)?;
            // We need to keep mutating the existing session for backwards compatibility,
            // but we should deprecate this eventually
            user_auth.update_session(conn, &session_key, session)?;

            Ok(auth_token)
        })
        .await?;

    let ff_client = state.ff_client.clone();
    let onboarding_config = api_wire_types::PublicOnboardingConfiguration::from_db((
        ob_config, tenant, None, None, ff_client, None,
    ));
    Ok(OnboardingResponse {
        // Omit appearance serialization here
        onboarding_config,
        auth_token,
    })
}
