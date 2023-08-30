use std::collections::HashMap;

use chrono::{DateTime, Utc};
use diesel::dsl::{count_star, not};
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::{
    AlpacaKycConfig, AlpacaKycState, CipKind, DbActor, DocumentState, FireWebhookArgs, InsightEventId,
    KybConfig, KybState, KycConfig, OnboardingCompletedPayload, OnboardingStatus,
    OnboardingStatusChangedPayload, TaskData, TenantId, TenantScope, VaultId, VaultKind, WebhookEvent,
    WorkflowFixtureResult,
};
use newtypes::{
    Locked, ObConfigurationId, ScopedVaultId, WorkflowConfig, WorkflowId, WorkflowKind, WorkflowState,
};

use super::insight_event::CreateInsightEvent;
use super::manual_review::ManualReview;
use super::ob_configuration::ObConfiguration;
use super::onboarding_decision::{NewDecisionArgs, OnboardingDecision};
use super::scoped_vault::ScopedVault;
use super::task::Task;
use super::tenant::Tenant;
use super::workflow_event::WorkflowEvent;
use crate::models::vault::Vault;
use crate::{DbResult, PgConn, TxnPgConn};
use db_schema::schema::workflow;
use newtypes::KycState;

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
    pub status: Option<OnboardingStatus>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub insight_event_id: Option<InsightEventId>,
    pub authorized_at: Option<DateTime<Utc>>,
    /// The time at which the first Footprint decision was made, if any
    pub decision_made_at: Option<DateTime<Utc>>,
    /// The time at which the workflow moves into a terminal state
    pub completed_at: Option<DateTime<Utc>>,
    /// The time at which the Wf is deactivated by creating a newer workflow for the scoped vault
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow)]
pub struct NewWorkflow {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: WorkflowKind,
    pub state: WorkflowState,
    pub config: WorkflowConfig,
    // One day we'll get rid of this
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub status: Option<OnboardingStatus>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub insight_event_id: Option<InsightEventId>,
}

#[derive(Debug, Clone)]
pub struct NewWorkflowArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub config: WorkflowConfig,
    // One day we'll get rid of this
    pub fixture_result: Option<WorkflowFixtureResult>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub insight_event_id: Option<InsightEventId>,
}

#[derive(Debug, Default, AsChangeset)]
#[diesel(table_name = workflow)]
struct WorkflowUpdateRow {
    status: Option<OnboardingStatus>,
    authorized_at: Option<Option<DateTime<Utc>>>,
    decision_made_at: Option<Option<DateTime<Utc>>>,
}

#[derive(Debug, Default)]
pub struct WorkflowUpdate {
    update: WorkflowUpdateRow,
    decision: Option<NewDecisionArgs>,
}

impl WorkflowUpdate {
    pub fn set_status(status: OnboardingStatus) -> Self {
        let update = WorkflowUpdateRow {
            status: Some(status),
            ..Default::default()
        };
        let decision = None;
        Self { update, decision }
    }

    /// Similar to set_decision, but updates based on information from the OBD
    pub fn set_decision(wf: &Locked<Workflow>, decision: NewDecisionArgs) -> Self {
        let is_first_fp_decision =
            wf.decision_made_at.is_none() && matches!(decision.actor, DbActor::Footprint);
        let update = WorkflowUpdateRow {
            status: Some(decision.status.into()),
            decision_made_at: is_first_fp_decision.then_some(Some(Utc::now())),
            ..Default::default()
        };
        let decision = Some(decision);
        Self { update, decision }
    }

    pub fn is_authorized() -> Self {
        let update = WorkflowUpdateRow {
            authorized_at: Some(Some(Utc::now())),
            ..Default::default()
        };
        let decision = None;
        Self { update, decision }
    }
}

pub enum WorkflowIdentifier<'a> {
    Id {
        id: &'a WorkflowId,
    },
    /// Look up a business's workflow from any of its owners' vault IDs
    BusinessOwner {
        owner_vault_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
    },
    ScopedBusinessId {
        sb_id: &'a ScopedVaultId,
        /// Note: the ID of the user vault that owns this business
        vault_id: &'a VaultId,
    },
    ConfigId {
        vault_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
    },
}

impl<'a> From<&'a WorkflowId> for WorkflowIdentifier<'a> {
    fn from(id: &'a WorkflowId) -> Self {
        Self::Id { id }
    }
}

impl<'a> From<(&'a VaultId, &'a ObConfigurationId)> for WorkflowIdentifier<'a> {
    fn from((vault_id, ob_config_id): (&'a VaultId, &'a ObConfigurationId)) -> Self {
        Self::ConfigId {
            vault_id,
            ob_config_id,
        }
    }
}

#[derive(Debug)]
pub struct OnboardingWorkflowArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event: Option<CreateInsightEvent>,
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
        fixture_result: Option<WorkflowFixtureResult>,
    ) -> DbResult<(Self, IsNew)> {
        let OnboardingWorkflowArgs {
            scoped_vault_id,
            ob_configuration_id,
            insight_event,
        } = args;

        let sv = ScopedVault::lock(conn, &scoped_vault_id)?;
        let insight_event_id = if let Some(insight_event) = insight_event {
            Some(insight_event.insert_with_conn(conn)?.id)
        } else {
            None
        };
        let v = Vault::get(conn.conn(), &scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get_enabled(conn, &ob_configuration_id)?;

        let config = match v.kind {
            VaultKind::Person => {
                if matches!(obc.cip_kind, Some(CipKind::Alpaca)) {
                    AlpacaKycConfig { is_redo: false }.into()
                } else {
                    KycConfig { is_redo: false }.into()
                }
            }
            VaultKind::Business => KybConfig {}.into(),
        };

        // Check if an active or completed workflow exists for this ob config
        let wf = workflow::table
            .filter(workflow::scoped_vault_id.eq(&scoped_vault_id))
            .filter(workflow::ob_configuration_id.eq(&ob_configuration_id))
            .filter(
                // An existing workflow (that we'd inherit) has to be _either_ active OR already
                // completed.
                // We want a user to be able to make a new workflow for the same OBC if the last
                // one was incomplete and deactivated.
                // But we don't want them to make a new workflow for the same OBC if they already
                // completed the last one.
                workflow::deactivated_at
                    .is_null()
                    .or(not(workflow::completed_at.is_null())),
            )
            .first(conn.conn())
            .optional()?;
        if let Some(wf) = wf {
            return Ok((wf, false));
        }

        // Create a new workflow
        let args = NewWorkflowArgs {
            scoped_vault_id,
            config,
            fixture_result,
            ob_configuration_id: Some(ob_configuration_id),
            insight_event_id,
        };
        let wf = Self::create(conn, args)?;

        // In locked transaction, update scoped vault status to Incomplete if it's null
        if sv.status.is_none() {
            ScopedVault::update_status(conn, &sv.id, OnboardingStatus::Incomplete)?;
        }

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
            status: Some(OnboardingStatus::Incomplete),
            ob_configuration_id,
            insight_event_id,
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

    #[tracing::instrument("Workflow::get", skip_all)]
    pub fn get_all<'a, T: Into<WorkflowIdentifier<'a>>>(
        conn: &mut PgConn,
        id: T,
    ) -> DbResult<(Self, ScopedVault)> {
        use db_schema::schema::{business_owner, scoped_vault};
        let mut query = workflow::table.inner_join(scoped_vault::table).into_boxed();
        match id.into() {
            WorkflowIdentifier::Id { id } => query = query.filter(workflow::id.eq(id)),
            WorkflowIdentifier::BusinessOwner {
                owner_vault_id,
                ob_config_id,
            } => {
                let business_vault_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(owner_vault_id))
                    .select(business_owner::business_vault_id);
                query = query
                    .filter(scoped_vault::vault_id.eq_any(business_vault_ids))
                    .filter(workflow::ob_configuration_id.eq(ob_config_id))
            }
            WorkflowIdentifier::ScopedBusinessId { sb_id, vault_id } => {
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
        use db_schema::schema::{scoped_vault, vault};
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
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(&e.workflow_id))
            .set(update)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::update", skip_all)]
    pub fn update(wf: Locked<Self>, conn: &mut TxnPgConn, update: WorkflowUpdate) -> DbResult<Self> {
        let new_status = update.update.status;
        // TODO short circuit if nothing changed? like status is the same?
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(&wf.id))
            .set(update.update)
            .get_result(conn.conn())?;

        // Make the new OnboardingDecision if any
        if let Some(decision) = update.decision {
            let actor = decision.actor.clone();
            let create_manual_review_reasons = decision.create_manual_review_reasons.clone();
            let decision = OnboardingDecision::create(conn, &result, decision)?;
            //
            // NOTE
            //
            // Create or clear the manual review if needed
            // MUST do all manual review bookkeeping before sending the webhooks below
            let existing_review = ManualReview::get_active(conn, &result.id)?;
            if let Some(review_reasons) = create_manual_review_reasons {
                // If the decision requested to create a manual review, this creates one
                if existing_review.is_none() {
                    let sv_id = wf.scoped_vault_id.clone();
                    ManualReview::create(conn, review_reasons, result.id.clone(), sv_id)?;
                }
            } else {
                // If there is an outstanding review, creating this override decision clears it.
                if let Some(manual_review) = existing_review {
                    manual_review.complete(conn, actor, decision.id)?;
                }
            }
        }

        // Fire webhook
        if let Some(new_status) = new_status {
            // Must lock to make sure scoped vault status isn't stale
            let sv = ScopedVault::lock(conn, &wf.scoped_vault_id)?;
            let tenant = Tenant::get(conn, &sv.tenant_id)?;
            let old_status = sv.status;
            if old_status != Some(new_status) {
                // !! it's important that code in the same txn that is going to write a review does it before this update call
                let mr = ManualReview::get_active(conn, &wf.id)?;
                let old_status_has_decision = match old_status {
                    None => false,
                    Some(s) => s.has_decision(),
                };

                // Since the OnboardingCompletedPayload webhook has `requires_manual_review`, its semantics currently really mean we have to fire it when we make a
                // decision for the first time or in a redo flow
                if !old_status_has_decision && new_status.has_decision() {
                    let webhook_event = WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
                        fp_id: sv.fp_id.clone(),
                        footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                        timestamp: Utc::now(),
                        status: new_status,
                        requires_manual_review: mr.is_some(),
                    });
                    let task_data = TaskData::FireWebhook(FireWebhookArgs {
                        scoped_vault_id: wf.scoped_vault_id.clone(),
                        tenant_id: tenant.id.clone(),
                        is_live: sv.is_live,
                        webhook_event,
                    });
                    Task::create(conn, Utc::now(), task_data)?;
                };

                if !old_status_has_decision || new_status.has_decision() {
                    // Only set to non-decision status if the current status is a non-decision status
                    // This has the effect of never letting the scoped vault status go from a decision to a non-decision status
                    ScopedVault::update_status(conn, &sv.id, new_status)?;

                    // Only fire a OnboardingStatusChanged webhook if the scoped vault staus changes
                    let webhook_event =
                        WebhookEvent::OnboardingStatusChanged(OnboardingStatusChangedPayload {
                            fp_id: sv.fp_id.clone(),
                            footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                            timestamp: Utc::now(),
                            new_status,
                        });
                    let task_data = TaskData::FireWebhook(FireWebhookArgs {
                        scoped_vault_id: wf.scoped_vault_id.clone(),
                        tenant_id: tenant.id,
                        is_live: sv.is_live,
                        webhook_event,
                    });
                    Task::create(conn, Utc::now(), task_data)?;
                }
            }
        }
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

    // TODO: maybe in future we have a concept of only 1 active workflow at a time and this queries for that instead
    #[tracing::instrument("Workflow::latest", skip_all)]
    pub fn latest(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
            .order_by(workflow::created_at.desc())
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Workflow::latest_by_kind", skip_all)]
    pub fn latest_by_kind(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: WorkflowKind,
    ) -> DbResult<Option<Self>> {
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
            .filter(workflow::kind.eq(kind))
            .order_by(workflow::created_at.desc())
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Workflow::get_billable_count", skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        kind: VaultKind,
    ) -> DbResult<i64> {
        use db_schema::schema::{scoped_vault, vault};
        let count = workflow::table
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            .filter(vault::kind.eq(kind))
            // We won't charge tenants for workflows that didn't finish authorizing, even if we
            // already ran KYC checks
            .filter(not(workflow::authorized_at.is_null()))
            // Filter for workflows that had their final decision made during this billing period
            .filter(workflow::decision_made_at.ge(start_date))
            .filter(workflow::decision_made_at.lt(end_date))
            .select(count_star())
            .get_result(conn)?;
        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{models::workflow_event::WorkflowEvent, tests::prelude::*};
    use macros::db_test;
    use newtypes::KycConfig;
    use newtypes::KycState;
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
                status: Some(OnboardingStatus::Incomplete),
                ob_configuration_id: None,
                insight_event_id: None,
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
                status: Some(OnboardingStatus::Incomplete),
                ob_configuration_id: None,
                insight_event_id: None,
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

    // Returns the TenantScopes that this ObConfiguration requires to be collected
    pub fn must_collect_scopes(&self) -> Vec<TenantScope> {
        self.1
            .must_collect_data
            .clone()
            .into_iter()
            .map(|cdo| cdo.permission())
            .collect()
    }
}
