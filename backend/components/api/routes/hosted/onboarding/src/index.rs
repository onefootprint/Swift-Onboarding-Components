use crate::auth::session::UpdateSession;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::auth::AuthError;
use crate::errors::onboarding::OnboardingError;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::session::user::UserSessionBuilder;
use api_core::auth::user::load_auth_events;
use api_core::types::ApiResponse;
use api_core::utils::actix::OptionalJson;
use api_core::utils::onboarding::create_biz_wfl_if_not_exists;
use api_core::utils::onboarding::get_or_create_user_workflow;
use api_core::utils::onboarding::CommonWfArgs;
use api_core::utils::onboarding::CreateUserWfArgs;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::PrefillData;
use api_core::utils::vault_wrapper::PrefillKind;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::hosted::onboarding::OnboardingResponse;
use api_wire_types::PostOnboardingRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use newtypes::AuthEventKind;
use newtypes::VerificationCheckKind;
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
    // TODO: is anyone using this? can we rm?
    ob_pk_auth: Option<ObConfigAuth>,
    insights: InsightHeaders,
    request: OptionalJson<PostOnboardingRequest>,
) -> ApiResponse<OnboardingResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let PostOnboardingRequest { fixture_result } = request.into_inner().unwrap_or_default();

    let auth_events = user_auth.auth_events.clone();

    let scoped_user_id = (user_auth.su_id.clone()).ok_or(AuthError::MissingScopedUser)?;
    let uv_id = user_auth.user.id.clone();
    let pk_obc_id = ob_pk_auth.map(|ob_pk| ob_pk.ob_config().id.clone());
    let obc_id = (user_auth.obc_id.clone().or(pk_obc_id)).ok_or(OnboardingError::NoPlaybook)?;
    let (scoped_user, playbook, ob_config, portable_vw, auth_events) = state
        .db_query(move |conn| {
            let su = ScopedVault::get(conn, (&scoped_user_id, &uv_id))?;
            // Check that the ob configuration is still active
            let (playbook, ob_config) = ObConfiguration::get_enabled(conn, &obc_id)?;
            let portable_vw = VaultWrapper::<Any>::build_portable(conn, &su.vault_id)?;

            let auth_events = load_auth_events(conn, &auth_events)?;

            Ok((su, playbook, ob_config, portable_vw, auth_events))
        })
        .await?;

    // Only prefill data if the user used a strong auth method.
    //
    // SMS is not strong auth due to risk of SIM swapping and phone number recycling.
    //
    // It might be desirable to have SMS+KBA be considered "strong auth", but currently we only
    // allow KBA on the phone number DI, which doesn't represent useful KBA if you've successfully
    // completed SMS OTP.
    tracing::info!(
        fp_id = %scoped_user.fp_id,
        auth_events = ?user_auth.auth_events,
        "Evaluating prefill"
    );

    let session_has_strong_auth = auth_events
        .iter()
        .any(|(ae, _)| matches!(ae.kind, AuthEventKind::Email | AuthEventKind::Passkey));
    let prefill_data = if session_has_strong_auth {
        tracing::info!("Prefilling data because session has strong auth");
        portable_vw
            .get_data_to_prefill(
                &state,
                &playbook,
                &ob_config,
                PrefillKind::Onboarding(&scoped_user),
            )
            .await?
    } else {
        tracing::info!("Not prefilling data because session lacks strong auth");
        PrefillData::default()
    };


    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let obc = ob_config.clone();
    let is_neuro_enabled = obc
        .verification_checks()
        .get(VerificationCheckKind::NeuroId)
        .is_some();
    let auth_token = state
        .db_transaction(move |conn| {
            // TODO: allow_reonboard here technically allows creating multiple Workflows per auth token. This
            // is harmless, but ideally we have idempotency protection here and only allow creating one
            // onboarding for the purpose of associating with the auth session.
            let wfr = (user_auth.wfr_id.as_ref())
                .map(|wfr_id| WorkflowRequest::get(conn, wfr_id, &scoped_user.id))
                .transpose()?;

            // If this auth token allows reonboarding, force create a new workflow
            let force_create = user_auth.data.metadata.allow_reonboard;
            let common_args = CommonWfArgs {
                playbook: &playbook,
                obc: &obc,
                insight_event: Some(insight_event),
                source: WorkflowSource::Hosted,
                wfr: wfr.as_ref(),
                force_create,
                su: &scoped_user,
            };
            let args = CreateUserWfArgs {
                existing_wf_id: user_auth.wf_id.clone(),
                seqno: portable_vw.seqno,
                fixture_result,
                actor: None,
                maybe_prefill_data: Some(prefill_data),
                is_neuro_enabled,
            };
            // TODO in order to support reuse_existing_bo_kyc = False here for redo KYB, we should kind of
            // force create here when the secondary BO needs to redo KYC.
            let (user_wf, _) = get_or_create_user_workflow(conn, common_args.clone(), args)?;

            if let Some(biz_wf_id) = user_auth.biz_wf_id.as_ref() {
                // Even though we aren't creating business workflows here, we need to keep this to associate
                // new user workflows with existing business workflows in the secondary BO flow.
                let biz_wf = Workflow::get(conn, biz_wf_id)?;
                create_biz_wfl_if_not_exists(conn, &biz_wf, &user_wf)?;
            }

            // Update auth token with new identifiers
            let mut session =
                UserSessionBuilder::from_existing(&user_auth, TokenCreationPurpose::AddWorkflow)?;
            if session.wf_id.is_none() {
                session = session.replace_wf_id(Some(user_wf.id));
            }
            if session.obc_id.is_none() {
                session = session.replace_obc_id(Some(obc.id.clone()));
            }
            let session = session.finish()?;
            let (auth_token, _) = user_auth.create_derived(conn, &session_key, session.clone(), None)?;
            // We need to keep mutating the existing session for backwards compatibility,
            // but we should deprecate this eventually
            user_auth.update_session(conn, &session_key, session)?;

            Ok(auth_token)
        })
        .await?;

    Ok(OnboardingResponse { auth_token })
}
