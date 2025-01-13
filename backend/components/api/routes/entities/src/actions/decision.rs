use super::validation::validate_adhoc_vendor_call;
use crate::actions::EntityActionPostCommit;
use api_core::decision::review::save_review_decision;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::user::UserError;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_errors::FpDbOptionalExtension;
use chrono::Utc;
use db::models::audit_event::AuditEvent;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::models::scoped_vault::ScopedVault;
use db::models::task::Task;
use db::models::task::TaskPollArgs;
use db::models::user_timeline::UserTimeline;
use db::models::workflow::OnboardingWorkflowArgs;
use db::models::workflow::Workflow;
use db::OffsetPagination;
use db::TxnPgConn;
use newtypes::AdhocWorkflowTriggeredInfo;
use newtypes::ApiKeyStatus;
use newtypes::AuditEventDetail;
use newtypes::DbActor;
use newtypes::DecisionStatus;
use newtypes::Locked;
use newtypes::ManualDecisionRequest;
use newtypes::ObConfigurationKind;
use newtypes::RunIncodeStuckWorkflowArgs;
use newtypes::TaskKind;
use newtypes::TenantId;
use newtypes::WfrAdhocVendorCallConfig;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowSource;


pub(super) fn apply_manual_decision(
    conn: &mut TxnPgConn,
    request: ManualDecisionRequest,
    sv: &ScopedVault,
    actor: DbActor,
    insight: InsightHeaders,
    tenant_id: TenantId,
) -> FpResult<EntityActionPostCommit> {
    let wf = Workflow::get_active(conn, &sv.id)
        .optional()?
        .ok_or(OnboardingError::NoWorkflow)?;
    let ManualDecisionRequest { annotation, status } = request;
    let onboarding_decision_id =
        save_review_decision(conn, wf, status.into(), Some(annotation), actor.clone())?;
    let detail = AuditEventDetail::ManuallyReviewEntity {
        onboarding_decision_id,
        scoped_vault_id: sv.id.clone(),
    };
    AuditEvent::create_with_insight(conn, &tenant_id, actor, insight, detail)?;
    let args = TaskPollArgs::Kind {
        limit: 10,
        kind: TaskKind::FireWebhook,
    };
    Ok(EntityActionPostCommit::ExecuteTasks(args))
}

pub(super) fn clear_review(
    conn: &mut TxnPgConn,
    sv: &ScopedVault,
    actor: DbActor,
) -> FpResult<EntityActionPostCommit> {
    let wf = Workflow::get_active(conn, &sv.id)
        .optional()?
        .ok_or(OnboardingError::NoWorkflow)?;
    save_review_decision(conn, wf, DecisionStatus::None, None, actor)?;
    let args = TaskPollArgs::Kind {
        limit: 10,
        kind: TaskKind::FireWebhook,
    };
    Ok(EntityActionPostCommit::ExecuteTasks(args))
}

pub(super) fn apply_adhoc_vendor_call(
    conn: &mut TxnPgConn,
    config: WfrAdhocVendorCallConfig,
    sv: &Locked<ScopedVault>,
    tvc: &TenantVendorControl,
    is_live: bool,
    actor: DbActor,
) -> FpResult<EntityActionPostCommit> {
    let vw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
    validate_adhoc_vendor_call(config.clone(), sv, tvc, is_live, &vw)?;

    let query = ObConfigurationQuery {
        tenant_id: sv.tenant_id.clone(),
        is_live: sv.is_live,
        status: Some(ApiKeyStatus::Enabled),
        kinds: Some(ObConfigurationKind::reonboardable()),
        search: None,
        playbook_id: None,
        include_deactivated_versions: false,
    };

    let (obcs, _) = ObConfiguration::list(conn, &query, OffsetPagination::page(1))?;
    let (_, obc, _, _) = obcs.into_iter().next().ok_or(UserError::NoPlaybooksExist)?;

    let config = WorkflowRequestConfig::AdhocVendorCall(config);
    let args = OnboardingWorkflowArgs {
        scoped_vault_id: sv.id.clone(),
        ob_configuration_id: obc.id.clone(),
        authorized: false,
        insight_event: None,
        source: WorkflowSource::Tenant,
        fixture_result: None,
        is_one_click: false,
        wfr_config: Some(&config),
        is_neuro_enabled: false,
    };
    let (wf, _) = Workflow::get_or_create_onboarding(conn, args, true)?;

    let sv_txn = DataLifetime::new_sv_txn(conn, sv)?;
    let event = AdhocWorkflowTriggeredInfo {
        workflow_id: wf.id.clone(),
        actor,
    };
    UserTimeline::create(conn, &sv_txn, event.clone())?;


    let task_data = RunIncodeStuckWorkflowArgs { workflow_id: wf.id };
    let task = Task::create(conn, Utc::now(), task_data)?;

    let args = TaskPollArgs::Single { id: task.id };
    Ok(EntityActionPostCommit::ExecuteTasks(args))
}
