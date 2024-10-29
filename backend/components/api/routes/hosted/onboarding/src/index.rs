use crate::auth::session::UpdateSession;
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
use api_core::utils::onboarding::create_biz_wfl_if_not_exists;
use api_core::utils::onboarding::get_or_create_business_wf;
use api_core::utils::onboarding::get_or_create_user_workflow;
use api_core::utils::onboarding::CommonWfArgs;
use api_core::utils::onboarding::CreateBusinessWfArgs;
use api_core::utils::onboarding::CreateUserWfArgs;
use api_core::utils::onboarding::InheritBusinessId;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::PrefillKind;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_wire_types::hosted::onboarding::OnboardingResponse;
use api_wire_types::PostOnboardingRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
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
    let PostOnboardingRequest {
        fixture_result,
        kyb_fixture_result,
        // Modern clients will send `omit_business_creation` and will create business workflows
        // separately.
        // But we still need to fetch the existing bwfl for the secondary BO flow
        // TODO: once all clients are updated, we can remove all business logic in this API. Should
        // probably rename it to `POST /hosted/user/onboarding` after that
        omit_business_creation,
    } = request.into_inner().unwrap_or_default();

    let scoped_user_id = (user_auth.su_id.clone()).ok_or(AuthError::MissingScopedUser)?;
    let uv_id = user_auth.user.id.clone();
    let pk_obc_id = ob_pk_auth.map(|ob_pk| ob_pk.ob_config().id.clone());
    let obc_id = (user_auth.obc_id.clone().or(pk_obc_id)).ok_or(OnboardingError::NoObConfig)?;
    let wfr_id = user_auth.wfr_id.clone();
    let (scoped_user, ob_config, tenant, vw, wfr) = state
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

    let collecting_biz_doc = match wfr.clone().map(|wfr| wfr.config) {
        Some(WorkflowRequestConfig::Document { business_configs, .. }) => !business_configs.is_empty(),
        _ => false,
    };

    let should_get_or_create_biz_wf = ob_config.kind == ObConfigurationKind::Kyb || collecting_biz_doc;
    let maybe_new_biz_keypair = if should_get_or_create_biz_wf {
        // Have to pre-generate the keypair since this is async
        Some(state.enclave_client.generate_sealed_keypair().await?)
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
        .db_transaction(move |conn| -> Result<_, FpError> {
            // TODO: allow_reonboard here technically allows creating multiple Workflows per auth token. This
            // is harmless, but ideally we have idempotency protection here and only allow creating one
            // onboarding for the purpose of associating with the auth session.

            // If this auth token allows reonboarding OR the playbook is opted into always allow reonboarding,
            // force create a new workflwo
            let force_create = user_auth.data.metadata().allow_reonboard || ob_config.allow_reonboard;
            let common_args = CommonWfArgs {
                obc: &obc,
                insight_event: Some(insight_event),
                source: WorkflowSource::Hosted,
                wfr: wfr.as_ref(),
                force_create,
                su: &scoped_user,
            };
            let args = CreateUserWfArgs {
                existing_wf_id: user_auth.wf_id.clone(),
                seqno: vw.seqno,
                fixture_result,
                actor: None,
                maybe_prefill_data: Some(prefill_data),
                is_neuro_enabled,
            };
            // TODO in order to support reuse_existing_bo_kyc = False here for redo KYB, we should kind of
            // force create here when the secondary BO needs to redo KYC.
            let (user_wf, _) = get_or_create_user_workflow(conn, common_args.clone(), args)?;

            let kyb_fixture_result = kyb_fixture_result.or(fixture_result);
            let args = CreateBusinessWfArgs {
                user_auth: &user_auth,
                fixture_result: kyb_fixture_result,
                inherit_business_id: InheritBusinessId::Legacy,
            };
            let biz_wf = if !omit_business_creation {
                maybe_new_biz_keypair
                    .map(|kp| get_or_create_business_wf(conn, common_args, kp, args).map(|(wf, _)| wf))
                    .transpose()?
            } else {
                (user_auth.biz_wf_id.as_ref())
                    .map(|id| Workflow::get(conn, id))
                    .transpose()?
            };

            // Even though we aren't creating business workflows here, we need to keep this to associate
            // new user workflows with existing business workflows
            if let Some(biz_wf) = biz_wf.as_ref() {
                create_biz_wfl_if_not_exists(conn, biz_wf, &user_wf)?;
            }

            // Update auth token with new identifiers
            let (biz_wf_id, sb_id) = biz_wf.map(|wf| (wf.id, wf.scoped_vault_id)).unzip();
            let args = NewUserSessionContext {
                wf_id: user_auth.wf_id.is_none().then_some(user_wf.id),
                biz_wf_id,
                sb_id,
                obc_id: user_auth.obc_id.is_none().then_some(obc.id.clone()),
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
