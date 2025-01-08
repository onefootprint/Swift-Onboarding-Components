use super::data_lifetime::DataLifetime;
use super::document::Document;
use super::document::DocumentUpdate;
use super::fingerprint::Fingerprint;
use super::insight_event::CreateInsightEvent;
use super::manual_review::ManualReviewDelta;
use super::ob_configuration::ObConfiguration;
use super::playbook::Playbook;
use super::scoped_vault::ScopedVault;
use super::scoped_vault::ScopedVaultUpdate;
use super::scoped_vault::SvStatusDelta;
use super::task::Task;
use super::tenant::Tenant;
use super::user_timeline::UserTimeline;
use super::workflow_event::WorkflowEvent;
use super::workflow_request::WorkflowRequest;
use crate::models::vault::Vault;
use crate::OffsetPaginatedResult;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::BadRequestInto;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::identity_document;
use db_schema::schema::ob_configuration;
use db_schema::schema::playbook;
use db_schema::schema::workflow;
use diesel::dsl::not;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::AdhocVendorCallConfig;
use newtypes::AdhocVendorCallState;
use newtypes::AlpacaKycState;
use newtypes::ApiKeyStatus;
use newtypes::DocumentConfig;
use newtypes::DocumentState;
use newtypes::DocumentStatus;
use newtypes::Fingerprint as FingerprintData;
use newtypes::InsightEventId;
use newtypes::KybConfig;
use newtypes::KybState;
use newtypes::KycConfig;
use newtypes::KycState;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::OnboardingCompletedPayload;
use newtypes::OnboardingStatus;
use newtypes::OnboardingStatusChangedPayload;
use newtypes::PreviewApi;
use newtypes::ScopedVaultId;
use newtypes::TenantScope;
use newtypes::VaultKind;
use newtypes::WebhookEvent;
use newtypes::WorkflowConfig;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use newtypes::WorkflowKind;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowSource;
use newtypes::WorkflowStartedInfo;
use newtypes::WorkflowState;
use std::collections::HashMap;
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Selectable)]
#[diesel(table_name = workflow)]
pub struct Workflow {
    pub id: WorkflowId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: WorkflowKind,
    pub state: WorkflowState,
    pub config: WorkflowConfig,
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub status: OnboardingStatus,
    /// NOTE: this could be absolute gibberish for document workflows, which don't need owrkflow
    /// information but just generally need a playbook that belongs to this tenant
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event_id: Option<InsightEventId>,
    pub authorized_at: Option<DateTime<Utc>>,
    /// The time at which the first Footprint decision was made, if any
    pub decision_made_at: Option<DateTime<Utc>>,
    /// The time at which the workflow moves into a terminal state
    pub completed_at: Option<DateTime<Utc>>,
    /// The time at which the Wf is deactivated by creating a newer workflow for the scoped vault
    pub deactivated_at: Option<DateTime<Utc>>,
    pub source: WorkflowSource,
    /// When true, there was existing data added by another tenant (or not decryptable).
    /// This won't always be a full picture of a one-click onboarding - we might want to trace
    /// which fields specificaly were prefilled
    pub is_one_click: bool,
    /// The first timestamp at which the tenant used a validation token to "validate" the onboarding
    /// session and retrieve the fp_id and status.
    /// Note, note all workflows are expected to be validated.
    /// And not all historical workflows will have this backfilled
    pub session_validated_at: Option<DateTime<Utc>>,
    /// When we create an onboarding, we will determine if NeuroID data should be collected and run
    /// for the workflow
    pub is_neuro_enabled: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow)]
pub struct NewWorkflow {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: WorkflowKind,
    pub state: WorkflowState,
    pub config: WorkflowConfig,
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub status: OnboardingStatus,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event_id: Option<InsightEventId>,
    pub authorized_at: Option<DateTime<Utc>>,
    pub source: WorkflowSource,
    pub is_one_click: bool,
    pub is_neuro_enabled: bool,
}

#[derive(Debug, Clone)]
pub struct NewWorkflowArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub config: WorkflowConfig,
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event_id: Option<InsightEventId>,
    pub authorized: bool,
    pub source: WorkflowSource,
    pub is_one_click: bool,
    pub is_neuro_enabled: bool,
}

#[derive(derive_more::From)]
pub enum WorkflowIdentifier<'a> {
    Id {
        id: &'a WorkflowId,
    },
    ScopedVaultId {
        scoped_vault_id: &'a ScopedVaultId,
        workflow_id: &'a WorkflowId,
    },
}

#[derive(Debug)]
pub struct OnboardingWorkflowArgs<'a> {
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event: Option<CreateInsightEvent>,
    pub authorized: bool,
    pub source: WorkflowSource,
    /// Only needs to be provided for workflows created by the tenant.
    /// Workflows created in bifrost will have the fixture result sent in POST /process
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub is_one_click: bool,
    /// If starting from a WorkflowRequest, the config
    pub wfr: Option<&'a WorkflowRequest>,
    pub is_neuro_enabled: bool,
}

pub type IsNew = bool;


// This enum represents groupings of workflows where we expect to only
// have a single active workflow in at a time. So, you could have an active
// onboarding and an active adhoc vendor call, but not two active onboardings.
// Similarly, starting an adhoc workflow should not influence the active status
// of a bifrost onboarding and vice versa
#[derive(Debug, PartialEq, Eq)]
enum WorkflowGroup {
    Onboarding,
    Adhoc,
}
impl WorkflowGroup {
    fn kinds_to_deactivate(&self) -> Vec<WorkflowKind> {
        WorkflowKind::iter().filter(|k| *self == k.into()).collect()
    }
}

impl From<&WorkflowKind> for WorkflowGroup {
    fn from(kind: &WorkflowKind) -> Self {
        match kind {
            WorkflowKind::AdhocVendorCall => Self::Adhoc,
            WorkflowKind::Kyc | WorkflowKind::AlpacaKyc | WorkflowKind::Document | WorkflowKind::Kyb => {
                Self::Onboarding
            }
        }
    }
}


impl Workflow {
    #[tracing::instrument("Workflow::insert", skip_all)]
    pub fn insert(conn: &mut TxnPgConn, new_workflow: NewWorkflow) -> FpResult<Self> {
        // We only want to deactivate other workflows in the same group
        let wf_group: WorkflowGroup = (&new_workflow.kind).into();
        // Deactivate existing workflow, if any. We also set the deactivated_at of the previous
        // workflow to the created_at of the new workflow, just for convenience
        let deactivated_wf = diesel::update(workflow::table)
            .filter(workflow::scoped_vault_id.eq(&new_workflow.scoped_vault_id))
            .filter(workflow::deactivated_at.is_null())
            .filter(workflow::kind.eq_any(wf_group.kinds_to_deactivate()))
            .set(workflow::deactivated_at.eq(new_workflow.created_at))
            .returning(workflow::id)
            .get_result::<WorkflowId>(conn.conn())
            .optional()?;

        if let Some(deactivated_wf_id) = deactivated_wf {
            let documents_to_update = Document::list_by_wf_id(conn, &deactivated_wf_id)?
                .into_iter()
                .filter(|(d, _)| !d.status.is_terminal())
                .map(|(d, _)| d.id)
                .collect_vec();

            // Bulk update documents to Abandoned status
            if !documents_to_update.is_empty() {
                let update = DocumentUpdate {
                    status: Some(DocumentStatus::Abandoned),
                    ..Default::default()
                };
                diesel::update(identity_document::table)
                    .filter(identity_document::id.eq_any(documents_to_update))
                    .set(update)
                    .execute(conn.conn())?;
            }
        }

        let res: Self = diesel::insert_into(workflow::table)
            .values(new_workflow)
            .get_result(conn.conn())?;

        Ok(res)
    }

    /// get_or_create a workflow for the purpose of onboarding onto a specific ob config
    #[tracing::instrument("Workflow::get_or_create_onboarding", skip_all)]
    pub fn get_or_create_onboarding(
        conn: &mut TxnPgConn,
        args: OnboardingWorkflowArgs,
        force_create: bool,
    ) -> FpResult<(Self, IsNew)> {
        let OnboardingWorkflowArgs {
            scoped_vault_id,
            ob_configuration_id,
            insight_event,
            authorized,
            source,
            fixture_result,
            is_one_click,
            wfr,
            is_neuro_enabled,
        } = args;

        let sv = ScopedVault::lock(conn, &scoped_vault_id)?;
        let v = Vault::get(conn.conn(), &scoped_vault_id)?;

        if sv.is_live && fixture_result.is_some() {
            return BadRequestInto("Cannot add a fixture_result for live vault");
        }

        let (_, obc) = ObConfiguration::get(conn, &ob_configuration_id)?;

        if !force_create {
            // Check if an active or completed workflow exists for this ob config.
            // An existing workflow (that we'd inherit) has to be _either_ active OR already
            // completed.
            // We want a user to be able to make a new workflow for the same OBC if the last
            // one was incomplete and deactivated.
            // But we don't want them to make a new workflow for the same OBC if they already
            // completed the last one.
            let active_wf = workflow::table
                .inner_join(ob_configuration::table)
                .filter(workflow::scoped_vault_id.eq(&scoped_vault_id))
                .filter(ob_configuration::playbook_id.eq(&obc.playbook_id))
                .filter(workflow::deactivated_at.is_null())
                .filter(not(workflow::kind.eq(WorkflowKind::AdhocVendorCall)))
                .select(Workflow::as_select())
                .first(conn.conn())
                .optional()?;

            let complete_wf = workflow::table
                .inner_join(ob_configuration::table)
                .filter(workflow::scoped_vault_id.eq(&scoped_vault_id))
                .filter(ob_configuration::playbook_id.eq(&obc.playbook_id))
                .filter(not(workflow::completed_at.is_null()))
                .filter(not(workflow::kind.eq(WorkflowKind::AdhocVendorCall)))
                .select(Workflow::as_select())
                .first(conn.conn())
                .optional()?;
            let wf = active_wf.or(complete_wf);
            if let Some(wf) = wf {
                return Ok((wf, false));
            }
        }

        let config: WorkflowConfig = match wfr.map(|wfr| wfr.config.clone()) {
            Some(WorkflowRequestConfig::Document(cfg)) => DocumentConfig {
                configs: cfg.configs,
                business_configs: cfg.business_configs,
            }
            .into(),
            Some(WorkflowRequestConfig::Onboard(cfg)) => match v.kind {
                VaultKind::Person => KycConfig {
                    recollect_attributes: cfg.recollect_attributes,
                }
                .into(),
                VaultKind::Business => KybConfig {
                    recollect_attributes: cfg.recollect_attributes,
                    reuse_existing_bo_kyc: cfg.reuse_existing_bo_kyc,
                }
                .into(),
            },
            Some(WorkflowRequestConfig::AdhocVendorCall(cfg)) => AdhocVendorCallConfig {
                verification_checks: cfg.verification_checks,
            }
            .into(),
            None => match v.kind {
                VaultKind::Person => KycConfig::default().into(),
                VaultKind::Business => KybConfig::default().into(),
            },
        };

        if !config.kind().is_compatible_with(obc.kind) {
            return BadRequestInto!(
                "Cannot create workflow of kind {} with playbook of kind {}",
                config.kind(),
                obc.kind
            );
        }

        // Create a new workflow
        let insight_event_id = if let Some(insight_event) = insight_event {
            Some(insight_event.insert_with_conn(conn)?.id)
        } else {
            None
        };
        let args = NewWorkflowArgs {
            scoped_vault_id,
            config,
            fixture_result,
            ob_configuration_id: ob_configuration_id.clone(),
            authorized,
            insight_event_id,
            source,
            is_one_click,
            is_neuro_enabled,
        };
        let wf = Self::create(conn, args)?;

        // In locked transaction, update scoped vault status to Incomplete if we don't yet have a decision
        ScopedVault::update_status_if_valid(conn, &sv.id, OnboardingStatus::Incomplete)?;

        // Create a timeline event showing the onboarding started
        let sv_txn = DataLifetime::new_sv_txn(conn, &sv)?;
        let info = WorkflowStartedInfo {
            workflow_id: wf.id.clone(),
            pb_id: ob_configuration_id,
        };
        UserTimeline::create(conn, &sv_txn, info)?;

        Ok((wf, true))
    }

    #[tracing::instrument("Workflow::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewWorkflowArgs) -> FpResult<Self> {
        let NewWorkflowArgs {
            scoped_vault_id,
            config,
            fixture_result,
            ob_configuration_id,
            insight_event_id,
            authorized,
            source,
            is_one_click,
            is_neuro_enabled,
        } = args;
        let kind = config.kind();
        let initial_state = match kind {
            WorkflowKind::AlpacaKyc => WorkflowState::AlpacaKyc(AlpacaKycState::DataCollection),
            WorkflowKind::Kyc => WorkflowState::Kyc(KycState::DataCollection),
            WorkflowKind::Document => WorkflowState::Document(DocumentState::DataCollection),
            WorkflowKind::Kyb => WorkflowState::Kyb(KybState::DataCollection),
            WorkflowKind::AdhocVendorCall => {
                WorkflowState::AdhocVendorCall(AdhocVendorCallState::VendorCalls)
            }
        };
        let initial_status = match kind {
            WorkflowKind::AlpacaKyc | WorkflowKind::Kyc | WorkflowKind::Document | WorkflowKind::Kyb => {
                OnboardingStatus::Incomplete
            }
            WorkflowKind::AdhocVendorCall => OnboardingStatus::Pending,
        };

        let new_workflow = NewWorkflow {
            created_at: Utc::now(),
            scoped_vault_id,
            kind,
            state: initial_state,
            config,
            fixture_result,
            status: initial_status,
            ob_configuration_id,
            insight_event_id,
            authorized_at: authorized.then_some(Utc::now()),
            source,
            is_one_click,
            is_neuro_enabled,
        };

        Self::insert(conn, new_workflow)
    }

    #[tracing::instrument("Workflow::get", skip_all)]
    pub fn get<'a, T: Into<WorkflowIdentifier<'a>>>(conn: &mut PgConn, id: T) -> FpResult<Self> {
        let result = match id.into() {
            WorkflowIdentifier::Id { id } => workflow::table.filter(workflow::id.eq(id)).get_result(conn)?,
            WorkflowIdentifier::ScopedVaultId {
                scoped_vault_id,
                workflow_id,
            } => workflow::table
                .filter(workflow::id.eq(workflow_id))
                .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
                .get_result(conn)?,
        };

        Ok(result)
    }

    #[tracing::instrument("Workflow::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        pagination: OffsetPagination,
    ) -> FpResult<OffsetPaginatedResult<(Self, Playbook, ObConfiguration)>> {
        let mut query = workflow::table
            .filter(workflow::scoped_vault_id.eq(sv_id))
            .inner_join(ob_configuration::table.inner_join(playbook::table))
            .select((
                workflow::all_columns,
                playbook::all_columns,
                ob_configuration::all_columns,
            ))
            .order_by(workflow::created_at.desc())
            .limit(pagination.limit())
            .into_boxed();
        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let results = query.get_results(conn)?;
        Ok(pagination.results(results))
    }

    /// Gets the latest workflow that the user completed that is "reonboard-able"
    #[tracing::instrument("Workflow::latest_reonboardable", skip_all)]
    pub fn latest_reonboardable(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        only_completed: bool,
    ) -> FpResult<Option<(Self, ObConfiguration)>> {
        let mut query = workflow::table
            .inner_join(ob_configuration::table.inner_join(playbook::table))
            .filter(workflow::scoped_vault_id.eq(sv_id))
            .filter(ob_configuration::kind.eq_any(ObConfigurationKind::reonboardable()))
            .filter(not(workflow::kind.eq(WorkflowKind::AdhocVendorCall)))
            .filter(playbook::status.eq(ApiKeyStatus::Enabled))
            .select((workflow::all_columns, ob_configuration::all_columns))
            .into_boxed();

        if only_completed {
            query = query
                .filter(not(workflow::completed_at.is_null()))
                .order_by(workflow::completed_at.desc());
        } else {
            query = query.order_by(workflow::created_at.desc())
        }

        let res = query.first(conn).optional()?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::get_all", skip_all)]
    pub fn get_all<'a, T: Into<WorkflowIdentifier<'a>>>(
        conn: &mut PgConn,
        id: T,
    ) -> FpResult<(Self, ScopedVault)> {
        use db_schema::schema::scoped_vault;
        let mut query = workflow::table.inner_join(scoped_vault::table).into_boxed();
        match id.into() {
            WorkflowIdentifier::Id { id } => {
                query = query.filter(workflow::id.eq(id));
            }
            WorkflowIdentifier::ScopedVaultId {
                scoped_vault_id,
                workflow_id,
            } => {
                query = query
                    .filter(workflow::id.eq(workflow_id))
                    .filter(workflow::scoped_vault_id.eq(scoped_vault_id));
            }
        }
        let res = query.get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::get_with_vault", skip_all)]
    pub fn get_with_vault(conn: &mut PgConn, id: &WorkflowId) -> FpResult<(Self, Vault)> {
        use db_schema::schema::scoped_vault;
        use db_schema::schema::vault;
        let res = workflow::table
            .filter(workflow::id.eq(id))
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .select((workflow::all_columns, vault::all_columns))
            .get_result::<(Self, Vault)>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("Workflow::get_bulk", skip_all)]
    pub fn get_bulk(conn: &mut PgConn, ids: Vec<WorkflowId>) -> FpResult<HashMap<WorkflowId, Self>> {
        let res = workflow::table
            .filter(workflow::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|w| (w.id.clone(), w))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("Workflow::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &WorkflowId) -> FpResult<Locked<Self>> {
        let result = workflow::table
            .filter(workflow::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("Workflow::update_state", skip_all)]
    pub fn update_state(
        conn: &mut TxnPgConn,
        id: Locked<WorkflowId>, // The caller passes of the locked wf, so let's just take the ID
        old_state: WorkflowState,
        new_state: WorkflowState,
    ) -> FpResult<Self> {
        let id = id.into_inner();
        let e = WorkflowEvent::create(conn, id, old_state, new_state)?;

        #[derive(AsChangeset)]
        #[diesel(table_name = workflow)]
        struct WorkflowStateUpdate {
            state: WorkflowState,
            completed_at: Option<DateTime<Utc>>,
        }

        let update = WorkflowStateUpdate {
            state: new_state,
            completed_at: new_state.is_complete().then_some(e.created_at),
        };
        let result: Self = diesel::update(workflow::table)
            .filter(workflow::id.eq(&e.workflow_id))
            .set(update)
            .get_result(conn.conn())?;

        if new_state.is_complete() {
            // Deactivate any outstanding WorkflowRequest for this playbook
            // NOTE: this pretty arbitrarily decides to only deactivate a WorkflowRequest
            // if the request was for this playbook. But you could imagine if the
            // WorkflowRequest was only to redo KYC and the user onboards onto a KYC playbook,
            // we might want to mark the WorkflowRequest as complete anyways.
            // Maybe we'll revisit in the future with more descriptive requirements in the DB
            let sv_id = &result.scoped_vault_id;
            WorkflowRequest::deactivate(conn, sv_id, Some(&result.ob_configuration_id))?;
            // Update the scoped vault's last_activity_at to bump them to the top of the sorted
            // list of users in the dashboard
            let update = ScopedVaultUpdate {
                last_activity_at: Some(Utc::now()),
                ..Default::default()
            };
            ScopedVault::update(conn, &result.scoped_vault_id, update)?;
        }

        Ok(result)
    }

    #[tracing::instrument("Workflow::update_status_if_valid", skip_all)]
    pub fn update_status_if_valid(
        wf: Locked<Self>,
        conn: &mut TxnPgConn,
        new_status: OnboardingStatus,
    ) -> FpResult<(Self, WorkflowStatusDelta, SvStatusDelta)> {
        let old_status = wf.status;

        let can_transition = new_status.can_transition_from(&old_status);
        let wf = if can_transition {
            diesel::update(workflow::table)
                .filter(workflow::id.eq(&wf.id))
                .set(workflow::status.eq(new_status))
                .get_result(conn.conn())?
        } else {
            wf.into_inner()
        };

        let sv_delta = ScopedVault::update_status_if_valid(conn, &wf.scoped_vault_id, new_status)?;
        let wf_delta = WorkflowStatusDelta {
            old_status,
            new_status: wf.status,
        };
        Ok((wf, wf_delta, sv_delta))
    }

    pub fn maybe_fire_completed_webhook(
        &self,
        conn: &mut TxnPgConn,
        wf_delta: WorkflowStatusDelta,
        mr_deltas: ManualReviewDelta,
    ) -> FpResult<()> {
        if wf_delta.old_status.is_terminal() || !wf_delta.new_status.is_terminal() {
            return Ok(());
        }

        let (playbook, _) = ObConfiguration::get(conn, &self.ob_configuration_id)?;
        let sv = ScopedVault::get(conn, &self.scoped_vault_id)?;
        let webhook_event = WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
            fp_id: sv.fp_id.clone(),
            timestamp: Utc::now(),
            // TODO this doesn't really make sense in the context of ad-hoc document workflows
            status: wf_delta.new_status,
            requires_manual_review: mr_deltas.new_has_mrs,
            playbook_key: playbook.key,
            is_live: sv.is_live,
        });
        let task_data = sv.webhook_event(webhook_event);
        Task::create(conn, Utc::now(), task_data)?;
        Ok(())
    }

    pub fn maybe_fire_status_changed_webhook(
        &self,
        conn: &mut TxnPgConn,
        sv_delta: SvStatusDelta,
        mr_deltas: ManualReviewDelta,
    ) -> FpResult<()> {
        let tenant = Tenant::get(conn, &self.ob_configuration_id)?;
        // If this is a legacy tenant that can still see the old onboarding status webhooks, send out the
        // legacy webhook event
        let old_composite_status = (sv_delta.old_status, mr_deltas.old_has_mrs);
        let new_composite_status = (sv_delta.new_status, mr_deltas.new_has_mrs);
        let tenant_has_legacy_webhook = tenant.can_access_preview(&PreviewApi::LegacyOnboardingStatusWebhook);
        if !tenant_has_legacy_webhook || (new_composite_status == old_composite_status) {
            return Ok(());
        }

        // Only fire a OnboardingStatusChanged webhook if the scoped vault status changes or
        // requires_manual_review changes
        let sv = ScopedVault::get(conn, &self.scoped_vault_id)?;
        // NOTE: this is kind of a misnomer: the webhook fires when the scoped vault's status changes,
        // not when the onboarding's status changes
        let webhook_event = WebhookEvent::OnboardingStatusChanged(OnboardingStatusChangedPayload {
            fp_id: sv.fp_id.clone(),
            timestamp: Utc::now(),
            new_status: sv_delta.new_status,
            requires_manual_review: mr_deltas.new_has_mrs,
            is_live: sv.is_live,
        });
        let task_data = sv.webhook_event(webhook_event);
        Task::create(conn, Utc::now(), task_data)?;
        Ok(())
    }

    pub fn set_is_authorized(conn: &mut TxnPgConn, id: &WorkflowId) -> FpResult<()> {
        diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .filter(workflow::authorized_at.is_null())
            .set(workflow::authorized_at.eq(Utc::now()))
            .execute(conn.conn())?;
        Ok(())
    }

    pub fn set_decision_made_at(conn: &mut TxnPgConn, id: &WorkflowId) -> FpResult<Self> {
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .filter(workflow::decision_made_at.is_null())
            .set(workflow::decision_made_at.eq(Utc::now()))
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::update_fixture_result", skip_all)]
    pub fn update_fixture_result(
        conn: &mut TxnPgConn,
        id: &WorkflowId,
        fixture_result: WorkflowFixtureResult,
    ) -> FpResult<Self> {
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .set(workflow::fixture_result.eq(fixture_result))
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::set_session_validated_at", skip_all)]
    pub fn set_session_validated_at(conn: &mut PgConn, id: &WorkflowId) -> FpResult<()> {
        diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .filter(workflow::session_validated_at.is_null())
            .set(workflow::session_validated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("Workflow::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> FpResult<Self> {
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
            .filter(workflow::deactivated_at.is_null())
            .first(conn)?;
        Ok(res)
    }

    /// Given the fingerprint of a user's phone or email, returns a list of their in-progress
    /// onboardings. Note that their onboardings may be for different scoped vaults or even
    /// different vaults.
    pub fn get_in_progress(
        conn: &mut PgConn,
        sh_data: &[FingerprintData],
        is_live: bool,
    ) -> FpResult<Vec<(Self, ScopedVault, Tenant)>> {
        use db_schema::schema::fingerprint;
        use db_schema::schema::scoped_vault;
        use db_schema::schema::tenant;
        let sv_ids = Fingerprint::q_fingerprints(sh_data, is_live)
            .select(fingerprint::scoped_vault_id)
            .get_results::<ScopedVaultId>(conn)?;

        let results = workflow::table
            .inner_join(scoped_vault::table.inner_join(tenant::table))
            .filter(workflow::completed_at.is_null())
            .filter(workflow::deactivated_at.is_null())
            .filter(not(workflow::kind.eq(WorkflowKind::AdhocVendorCall)))
            .filter(workflow::scoped_vault_id.eq_any(sv_ids))
            .select((
                workflow::all_columns,
                scoped_vault::all_columns,
                tenant::all_columns,
            ))
            .order_by(workflow::created_at.desc())
            // TODO: implicit limit
            .limit(20)
            .get_results(conn)?;

        Ok(results)
    }
}

pub struct WorkflowStatusDelta {
    pub old_status: OnboardingStatus,
    pub new_status: OnboardingStatus,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::workflow_event::WorkflowEvent;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::KycConfig;
    use newtypes::KycState;
    use newtypes::WorkflowSource;
    use std::str::FromStr;

    #[db_test]
    fn test(conn: &mut TestPgConn) {
        let state = KycState::VendorCalls;
        let wf_state: WorkflowState = state.into();
        let config = WorkflowConfig::Kyc(KycConfig::default());
        let wf = Workflow::insert(
            conn,
            NewWorkflow {
                created_at: Utc::now(),
                scoped_vault_id: ScopedVaultId::from_str("sv_123").unwrap(),
                kind: (&wf_state).into(),
                state: wf_state,
                config,
                fixture_result: None,
                status: OnboardingStatus::Incomplete,
                ob_configuration_id: ObConfigurationId::from_str("obc_123").unwrap(),
                insight_event_id: None,
                authorized_at: None,
                source: WorkflowSource::Unknown,
                is_one_click: false,
                is_neuro_enabled: false,
            },
        )
        .unwrap();
        assert!(wf.kind == WorkflowKind::Kyc);
        assert!(wf.state == WorkflowState::Kyc(KycState::VendorCalls));
        let WorkflowConfig::Kyc(KycConfig { .. }) = wf.config else {
            panic!("Workflow config is not KycConfig");
        };
    }

    #[db_test]
    fn test_update(conn: &mut TestPgConn) {
        let s: WorkflowState = KycState::VendorCalls.into();
        let config = WorkflowConfig::Kyc(KycConfig::default());
        let wf = Workflow::insert(
            conn,
            NewWorkflow {
                created_at: Utc::now(),
                scoped_vault_id: ScopedVaultId::from_str("sv_123").unwrap(),
                kind: (&s).into(),
                state: s,
                config,
                fixture_result: None,
                status: OnboardingStatus::Incomplete,
                ob_configuration_id: ObConfigurationId::from_str("obc_123").unwrap(),
                insight_event_id: None,
                authorized_at: None,
                source: WorkflowSource::Unknown,
                is_one_click: false,
                is_neuro_enabled: false,
            },
        )
        .unwrap();

        let wf = Workflow::lock(conn, &wf.id).unwrap();
        let id = Locked::new(wf.id.clone());
        let wfid = wf.id.clone();
        let updated_wf =
            Workflow::update_state(conn, id, wf.state, WorkflowState::Kyc(KycState::Decisioning)).unwrap();
        assert!(updated_wf.state == WorkflowState::Kyc(KycState::Decisioning));

        let wfe = WorkflowEvent::list_for_workflow(conn, &wfid).unwrap();
        assert_eq!(1, wfe.len());
        let wfe = wfe.first().unwrap();
        assert!(wfe.from_state == WorkflowState::Kyc(KycState::VendorCalls));
        assert!(wfe.to_state == WorkflowState::Kyc(KycState::Decisioning));
    }
}

impl Workflow {
    #[tracing::instrument("Workflow::bulk_get_for_users", skip_all)]
    pub fn bulk_get_for_users(
        conn: &mut PgConn,
        scoped_vault_ids: Vec<&ScopedVaultId>,
    ) -> FpResult<HashMap<ScopedVaultId, Vec<WorkflowAndConfig>>> {
        use db_schema::schema::ob_configuration;
        let results = workflow::table
            .inner_join(ob_configuration::table)
            .filter(workflow::scoped_vault_id.eq_any(scoped_vault_ids))
            .get_results::<(Self, ObConfiguration)>(conn)?
            .into_iter()
            .map(|(wf, obc)| (wf.scoped_vault_id.clone(), WorkflowAndConfig(wf, obc)))
            .into_group_map();

        Ok(results)
    }
}

#[derive(Clone)]
pub struct WorkflowAndConfig(pub Workflow, pub ObConfiguration);

impl WorkflowAndConfig {
    /// returns the TenantScopes to which this ObConfiguration (upon authorization!) grants access
    /// to decrypt.
    pub fn can_decrypt_scopes(&self) -> Vec<TenantScope> {
        let Self(wf, obc) = &self;
        if wf.authorized_at.is_none() {
            // Only authorized onboardings give permission to decrypt data
            vec![]
        } else {
            let cdos = obc.can_access_data.clone();
            cdos.into_iter().map(|cdo| cdo.permission()).collect()
        }
    }

    // Returns the TenantScopes that this ObConfiguration collects
    pub fn collection_scopes(&self) -> Vec<TenantScope> {
        self.1
            .must_collect_data
            .clone()
            .into_iter()
            .chain(self.1.optional_data.clone())
            .map(|cdo| cdo.permission())
            .collect()
    }
}
