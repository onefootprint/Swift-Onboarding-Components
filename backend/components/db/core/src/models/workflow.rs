use super::insight_event::CreateInsightEvent;
use super::manual_review::ManualReview;
use super::ob_configuration::ObConfiguration;
use super::onboarding_decision::NewDecisionArgs;
use super::onboarding_decision::OnboardingDecision;
use super::scoped_vault::ScopedVault;
use super::scoped_vault::ScopedVaultUpdate;
use super::scoped_vault::SvStatusDelta;
use super::task::Task;
use super::user_timeline::UserTimeline;
use super::workflow_event::WorkflowEvent;
use super::workflow_request::WorkflowRequest;
use crate::errors::ValidationError;
use crate::models::billing_event::BillingEvent;
use crate::models::vault::Vault;
use crate::DbResult;
use crate::OffsetPaginatedResult;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::ob_configuration;
use db_schema::schema::workflow;
use diesel::dsl::count_star;
use diesel::dsl::not;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::AlpacaKycState;
use newtypes::DbActor;
use newtypes::DocumentConfig;
use newtypes::DocumentState;
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
use newtypes::TenantId;
use newtypes::TenantScope;
use newtypes::VaultId;
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

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
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
    /// Look up a business's workflow from any of its owners' vault IDs
    BusinessOwner {
        owner_vault_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
        /// To prevent the auto-derive from being misused to look up by su_id
        is_business: (),
    },
    ScopedBusinessId {
        sb_id: &'a ScopedVaultId,
        /// Note: the ID of the user vault that owns this business
        vault_id: &'a VaultId,
        /// To prevent the auto-derive from being misused to look up by su_id
        is_business: (),
    },
    ConfigId {
        vault_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
    },
}

#[derive(Debug)]
pub struct OnboardingWorkflowArgs {
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
    pub wfr: Option<WorkflowRequest>,
    pub is_neuro_enabled: bool,
}

pub type IsNew = bool;

impl Workflow {
    #[tracing::instrument("Workflow::insert", skip_all)]
    pub fn insert(conn: &mut TxnPgConn, new_workflow: NewWorkflow) -> DbResult<Self> {
        // Deactivate existing workflow, if any. We also set the deactivated_at of the previous
        // workflow to the created_at of the new workflow, just for convenience
        diesel::update(workflow::table)
            .filter(workflow::scoped_vault_id.eq(&new_workflow.scoped_vault_id))
            .filter(workflow::deactivated_at.is_null())
            .set(workflow::deactivated_at.eq(new_workflow.created_at))
            .execute(conn.conn())?;

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
    ) -> DbResult<(Self, IsNew)> {
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

        let sv = ScopedVault::lock(conn, &scoped_vault_id)?.into_inner();
        let v = Vault::get(conn.conn(), &scoped_vault_id)?;

        if !force_create {
            // Check if an active or completed workflow exists for this ob config.
            // An existing workflow (that we'd inherit) has to be _either_ active OR already
            // completed.
            // We want a user to be able to make a new workflow for the same OBC if the last
            // one was incomplete and deactivated.
            // But we don't want them to make a new workflow for the same OBC if they already
            // completed the last one.
            let active_wf = workflow::table
                .filter(workflow::scoped_vault_id.eq(&scoped_vault_id))
                .filter(workflow::ob_configuration_id.eq(&ob_configuration_id))
                .filter(workflow::deactivated_at.is_null())
                .first(conn.conn())
                .optional()?;
            let complete_wf = workflow::table
                .filter(workflow::scoped_vault_id.eq(&scoped_vault_id))
                .filter(workflow::ob_configuration_id.eq(&ob_configuration_id))
                .filter(not(workflow::completed_at.is_null()))
                .first(conn.conn())
                .optional()?;
            let wf = active_wf.or(complete_wf);
            if let Some(wf) = wf {
                return Ok((wf, false));
            }
        }

        let config = if let Some(wfr_config) = wfr.as_ref().map(|wfr| &wfr.config) {
            match wfr_config {
                WorkflowRequestConfig::RedoKyc | WorkflowRequestConfig::Onboard { .. } => {
                    if v.kind != VaultKind::Person {
                        return Err(
                            ValidationError("Cannot create a RedoKyc flow for non-person vault").into(),
                        );
                    }
                    // This is_redo flag can be deprecated - redo flows are treated no differently
                    KycConfig { is_redo: false }.into()
                }
                WorkflowRequestConfig::Document { configs } => DocumentConfig {
                    configs: configs.clone(),
                }
                .into(),
            }
        } else {
            match v.kind {
                VaultKind::Person => KycConfig { is_redo: false }.into(),
                VaultKind::Business => KybConfig {}.into(),
            }
        };

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
        let info = WorkflowStartedInfo {
            workflow_id: wf.id.clone(),
            pb_id: ob_configuration_id,
        };
        UserTimeline::create(conn, info, sv.vault_id, sv.id)?;

        Ok((wf, true))
    }

    #[tracing::instrument("Workflow::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewWorkflowArgs) -> DbResult<Self> {
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
        };
        let new_workflow = NewWorkflow {
            created_at: Utc::now(),
            scoped_vault_id,
            kind,
            state: initial_state,
            config,
            fixture_result,
            status: OnboardingStatus::Incomplete,
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
    pub fn get(conn: &mut PgConn, workflow_id: &WorkflowId) -> DbResult<Self> {
        let res = workflow::table
            .filter(workflow::id.eq(workflow_id))
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        pagination: OffsetPagination,
    ) -> DbResult<OffsetPaginatedResult<(Self, Option<ObConfiguration>)>> {
        let mut query = workflow::table
            .filter(workflow::scoped_vault_id.eq(sv_id))
            .order_by(workflow::created_at.desc())
            .left_join(ob_configuration::table)
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
    ) -> DbResult<Option<(Self, ObConfiguration)>> {
        let mut query = workflow::table
            .inner_join(ob_configuration::table)
            .filter(workflow::scoped_vault_id.eq(sv_id))
            .filter(ob_configuration::kind.eq_any(ObConfigurationKind::reonboardable()))
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
    ) -> DbResult<(Self, ScopedVault)> {
        use db_schema::schema::business_owner;
        use db_schema::schema::scoped_vault;
        let mut query = workflow::table.inner_join(scoped_vault::table).into_boxed();
        match id.into() {
            WorkflowIdentifier::Id { id } => query = query.filter(workflow::id.eq(id)),
            WorkflowIdentifier::BusinessOwner {
                owner_vault_id,
                ob_config_id,
                ..
            } => {
                let business_vault_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(owner_vault_id))
                    .select(business_owner::business_vault_id);
                query = query
                    .filter(scoped_vault::vault_id.eq_any(business_vault_ids))
                    .filter(workflow::ob_configuration_id.eq(ob_config_id))
            }
            WorkflowIdentifier::ScopedBusinessId { sb_id, vault_id, .. } => {
                let business_vault_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(vault_id))
                    .select(business_owner::business_vault_id);
                query = query
                    // Since businesses aren't portable, we only need to filter on scoped_vault_id
                    // to get a single workflow.
                    // TODO this will break if we allow multiple workflows per business
                    .filter(workflow::scoped_vault_id.eq(sb_id))
                    // Used in auth to check that the user is an owner of the business.
                    .filter(scoped_vault::vault_id.eq_any(business_vault_ids))
            }
            WorkflowIdentifier::ConfigId {
                vault_id,
                ob_config_id,
            } => {
                query = query
                    .filter(scoped_vault::vault_id.eq(vault_id))
                    .filter(workflow::ob_configuration_id.eq(ob_config_id))
            }
        }
        let res = query.get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::get_with_vault", skip_all)]
    pub fn get_with_vault(conn: &mut PgConn, id: &WorkflowId) -> DbResult<(Self, Vault)> {
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
    pub fn get_bulk(conn: &mut PgConn, ids: Vec<WorkflowId>) -> DbResult<HashMap<WorkflowId, Self>> {
        let res = workflow::table
            .filter(workflow::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|w| (w.id.clone(), w))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("Workflow::get_with_decisions", skip_all)]
    pub fn get_with_decisions(
        conn: &mut PgConn,
        sv_ids: Vec<ScopedVaultId>,
        obc_id: &ObConfigurationId,
    ) -> DbResult<Vec<(Self, Option<OnboardingDecision>)>> {
        use db_schema::schema::onboarding_decision;
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq_any(&sv_ids))
            .filter(workflow::ob_configuration_id.eq(obc_id))
            .left_join(
                onboarding_decision::table.on(onboarding_decision::workflow_id
                    .eq(workflow::id)
                    .and(onboarding_decision::deactivated_at.is_null())),
            )
            .get_results(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &WorkflowId) -> DbResult<Locked<Self>> {
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
    ) -> DbResult<Self> {
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

    #[tracing::instrument("Workflow::update_status", skip_all)]
    pub fn update_status(
        wf: Locked<Self>,
        conn: &mut TxnPgConn,
        new_status: OnboardingStatus,
    ) -> DbResult<(Self, SvStatusDelta)> {
        let old_status = wf.status;

        // Don't want manual review decision None to unset the workflow status.
        // TODO: get rid of this when manual review stops affecting WF status at all
        let can_transition = new_status.can_transition_from(&old_status);
        let wf = if can_transition {
            diesel::update(workflow::table)
                .filter(workflow::id.eq(&wf.id))
                .set(workflow::status.eq(new_status))
                .get_result(conn.conn())?
        } else {
            wf.into_inner()
        };

        let sv_deltas = ScopedVault::update_status_if_valid(conn, &wf.scoped_vault_id, new_status)?;
        Ok((wf, sv_deltas))
    }

    #[tracing::instrument("Workflow::update", skip_all)]
    pub fn update_decision(
        wf: Locked<Self>,
        conn: &mut TxnPgConn,
        new_decision: NewDecisionArgs,
    ) -> DbResult<Self> {
        let is_first_fp_decision =
            wf.decision_made_at.is_none() && matches!(new_decision.actor, DbActor::Footprint);
        let old_status = wf.status;
        let new_status = new_decision.status.into();

        let (obc, tenant) = ObConfiguration::get(conn, &wf.ob_configuration_id)?;

        // Bookkeeping if this workflow is getting its first Footprint decision
        if is_first_fp_decision {
            // Create the billing event(s)
            use newtypes::EnhancedAmlOption;
            match obc.enhanced_aml() {
                EnhancedAmlOption::Yes { adverse_media, .. } if adverse_media => {
                    use newtypes::BillingEventKind::AdverseMediaPerUser;
                    BillingEvent::create(conn, &wf.scoped_vault_id, Some(&obc.id), AdverseMediaPerUser)?;
                }
                _ => (),
            }

            // NOTE: returned Workflow won't have the decision_made_at set - this is fine, nobody reads it
            diesel::update(workflow::table)
                .filter(workflow::id.eq(&wf.id))
                .set(workflow::decision_made_at.eq(Utc::now()))
                .execute(conn.conn())?;
        }

        // Snapshot manual review status BEFORE updating MR
        let requires_manual_review_before_update =
            !ManualReview::get_active(conn, &wf.scoped_vault_id)?.is_empty();

        // Save the new OBD and related manual reviews
        OnboardingDecision::create_decision_and_mrs(conn, &wf, new_decision)?;

        let requires_manual_review_after_update =
            !ManualReview::get_active(conn, &wf.scoped_vault_id)?.is_empty();

        // Update the workflow's status to match the new decision's status
        let (wf, sv_delta) = Workflow::update_status(wf, conn, new_status)?;

        //
        // Fire any webhooks
        //

        let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;
        if !old_status.is_terminal() && new_status.is_terminal() {
            let webhook_event = WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
                fp_id: sv.fp_id.clone(),
                timestamp: Utc::now(),
                // TODO this doesn't really make sense in the context of ad-hoc document workflows
                status: new_status,
                requires_manual_review: requires_manual_review_after_update,
                playbook_key: obc.key,
                is_live: sv.is_live,
            });
            let task_data = sv.webhook_event(webhook_event).into();
            Task::create(conn, Utc::now(), task_data)?;
        };

        // If this is a legacy tenant that can still see the old onboarding status webhooks, send out the
        // legacy webhook event
        let old_composite_status = (sv_delta.old_status, requires_manual_review_before_update);
        let new_composite_status = (sv_delta.new_status, requires_manual_review_after_update);
        let tenant_has_legacy_webhook = tenant
            .allowed_preview_apis
            .contains(&PreviewApi::LegacyOnboardingStatusWebhook);
        if tenant_has_legacy_webhook && (new_composite_status != old_composite_status) {
            // Only fire a OnboardingStatusChanged webhook if the scoped vault status changes or
            // requires_manual_review changes
            let webhook_event = WebhookEvent::OnboardingStatusChanged(OnboardingStatusChangedPayload {
                fp_id: sv.fp_id.clone(),
                timestamp: Utc::now(),
                new_status: sv_delta.new_status,
                requires_manual_review: requires_manual_review_after_update,
                is_live: sv.is_live,
            });
            let task_data = sv.webhook_event(webhook_event).into();
            Task::create(conn, Utc::now(), task_data)?;
        };
        Ok(wf)
    }

    pub fn set_is_authorized(wf: Locked<Self>, conn: &mut TxnPgConn) -> DbResult<Self> {
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(&wf.id))
            .set(workflow::authorized_at.eq(Utc::now()))
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::update_fixture_result", skip_all)]
    pub fn update_fixture_result(
        conn: &mut TxnPgConn,
        id: &WorkflowId,
        fixture_result: WorkflowFixtureResult,
    ) -> DbResult<Self> {
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .set(workflow::fixture_result.eq(fixture_result))
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::set_session_validated_at", skip_all)]
    pub fn set_session_validated_at(conn: &mut PgConn, id: &WorkflowId) -> DbResult<()> {
        diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .filter(workflow::session_validated_at.is_null())
            .set(workflow::session_validated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("Workflow::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
            .filter(workflow::deactivated_at.is_null())
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Workflow::get_billable_count", skip_all)]
    /// Get the number of billable KYC/KYB vaults. Cannot be used to determine billing for auth or
    /// documents
    pub fn get_kyc_kyb_billable_count(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        kind: VaultKind,
    ) -> DbResult<i64> {
        use db_schema::schema::ob_configuration;
        use db_schema::schema::scoped_vault;
        let mut query = workflow::table
            .inner_join(scoped_vault::table)
            .inner_join(ob_configuration::table)
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            // Include deactivated scoped vaults.
            .filter(scoped_vault::kind.eq(kind))
            // We won't charge tenants for workflows that didn't finish authorizing, even if we
            // already ran KYC checks
            .filter(not(workflow::authorized_at.is_null()))
            // Don't bill document workflows as KYC
            .filter(not(workflow::kind.eq(WorkflowKind::Document)))
            // Filter for workflows that had their final decision made during this billing period
            .filter(workflow::decision_made_at.ge(start_date))
            .filter(workflow::decision_made_at.lt(end_date))
            .into_boxed();
        query = match kind {
            VaultKind::Person => query.filter(ob_configuration::skip_kyc.eq(false)),
            VaultKind::Business => query.filter(ob_configuration::skip_kyb.eq(false)),
        };
        let count = query.select(count_star()).get_result(conn)?;
        Ok(count)
    }
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
        let config = WorkflowConfig::Kyc(KycConfig { is_redo: false });
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
        assert!(wf.config == WorkflowConfig::Kyc(KycConfig { is_redo: false }));
    }

    #[db_test]
    fn test_update(conn: &mut TestPgConn) {
        let s: WorkflowState = KycState::VendorCalls.into();
        let config = WorkflowConfig::Kyc(KycConfig { is_redo: false });
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
    ) -> DbResult<HashMap<ScopedVaultId, Vec<WorkflowAndConfig>>> {
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
