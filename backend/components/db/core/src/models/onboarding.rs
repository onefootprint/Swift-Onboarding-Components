use super::insight_event::CreateInsightEvent;
use super::manual_review::ManualReview;
use super::scoped_vault::ScopedVault;
use super::task::Task;
use super::tenant::Tenant;
use super::vault::Vault;
use super::workflow::{Workflow, WorkflowUpdate};
use crate::models::ob_configuration::ObConfiguration;
use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{onboarding, scoped_vault};
use diesel::dsl::{count_star, not};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    AlpacaKycConfig, CipKind, DecisionStatus, FireWebhookArgs, InsightEventId, KybConfig, KycConfig, Locked,
    ObConfigurationId, OnboardingCompletedPayload, OnboardingId, OnboardingStatusChangedPayload,
    ScopedVaultId, TaskData, TenantId, WebhookEvent, WorkflowFixtureResult, WorkflowId,
};
use newtypes::{OnboardingStatus, VaultKind};
use serde::{Deserialize, Serialize};

pub type IsNew = bool;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub scoped_vault_id: ScopedVaultId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    // TODO rm
    insight_event_id: Option<InsightEventId>,
    // There are still some reads of these in DB queries that we have to rm first
    authorized_at: Option<DateTime<Utc>>,
    idv_reqs_initiated_at: Option<DateTime<Utc>>,
    decision_made_at: Option<DateTime<Utc>>,
    workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_vault_id: ScopedVaultId,
    start_timestamp: DateTime<Utc>,
    insight_event_id: Option<InsightEventId>,
    workflow_id: WorkflowId,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = onboarding)]
struct OnboardingUpdateRow {
    authorized_at: Option<Option<DateTime<Utc>>>,
    idv_reqs_initiated_at: Option<Option<DateTime<Utc>>>,
    decision_made_at: Option<Option<DateTime<Utc>>>,
}

#[derive(Debug, Default)]
pub struct OnboardingUpdate {
    pub authorized_at: Option<Option<DateTime<Utc>>>,
    pub idv_reqs_initiated_at: Option<Option<DateTime<Utc>>>,
    pub decision_made_at: Option<Option<DateTime<Utc>>>,
    pub status: Option<OnboardingStatus>,
}

#[derive(Debug)]
pub struct OnboardingCreateArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event: Option<CreateInsightEvent>,
}

/// While we are migrating the source of truth to workflow, use these utils to read from either
/// workflow or onboarding
impl Onboarding {
    pub fn workflow_id<'a>(&'a self, wf: Option<&'a Workflow>) -> &'a WorkflowId {
        wf.map(|wf| &wf.id).unwrap_or(&self.workflow_id)
    }
}

impl OnboardingUpdate {
    pub fn is_authorized() -> Self {
        Self {
            authorized_at: Some(Some(Utc::now())),
            ..Self::default()
        }
    }

    pub fn idv_reqs_initiated() -> Self {
        Self {
            idv_reqs_initiated_at: Some(Some(Utc::now())),
            status: Some(OnboardingStatus::Pending),
            ..Self::default()
        }
    }

    pub fn set_decision(decision_status: DecisionStatus, ob: &Onboarding) -> Self {
        let decision_made_at = ob.decision_made_at.is_none().then_some(Some(Utc::now()));
        Self {
            status: Some(decision_status.into()),
            decision_made_at,
            ..Self::default()
        }
    }

    pub fn set_status(status: OnboardingStatus) -> Self {
        Self {
            status: Some(status),
            ..Self::default()
        }
    }
}

#[derive(Debug)]
pub enum OnboardingIdentifier<'a> {
    Id(&'a OnboardingId),
    ScopedVaultId { sv_id: &'a ScopedVaultId },
    WorkflowId { wf_id: &'a WorkflowId },
}

impl<'a> From<&'a OnboardingId> for OnboardingIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ScopedVaultId> for OnboardingIdentifier<'a> {
    fn from(sv_id: &'a ScopedVaultId) -> Self {
        Self::ScopedVaultId { sv_id }
    }
}

impl<'a> From<&'a WorkflowId> for OnboardingIdentifier<'a> {
    fn from(wf_id: &'a WorkflowId) -> Self {
        Self::WorkflowId { wf_id }
    }
}

/// Wrapper around the very basic pieces of information generally needed when fetching an Onboarding
pub type BasicOnboardingInfo<ObT = Onboarding> = (ObT, ScopedVault);

impl Onboarding {
    #[tracing::instrument("Onboarding::get", skip_all)]
    pub fn get<'a, T>(conn: &'a mut PgConn, id: T) -> DbResult<BasicOnboardingInfo>
    where
        T: Into<OnboardingIdentifier<'a>>,
    {
        let mut query = onboarding::table.inner_join(scoped_vault::table).into_boxed();

        match id.into() {
            OnboardingIdentifier::Id(id) => query = query.filter(onboarding::id.eq(id)),
            OnboardingIdentifier::ScopedVaultId { sv_id } => {
                query = query.filter(onboarding::scoped_vault_id.eq(sv_id))
            }
            // TODO this is just for easier migration from ob -> wf
            OnboardingIdentifier::WorkflowId { wf_id } => {
                use db_schema::schema::workflow;
                let sv_ids = workflow::table
                    .filter(workflow::id.eq(wf_id))
                    .select(workflow::scoped_vault_id);
                query = query.filter(onboarding::scoped_vault_id.eq_any(sv_ids))
            }
        }

        let result = query.first(conn)?;

        Ok(result)
    }

    #[tracing::instrument("Onboarding::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &OnboardingId) -> DbResult<Locked<Self>> {
        let result = onboarding::table
            .filter(onboarding::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("Onboarding::get_or_create", skip_all)]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        args: OnboardingCreateArgs,
        fixture_result: Option<WorkflowFixtureResult>,
    ) -> DbResult<(Onboarding, Workflow, IsNew)> {
        let sv = ScopedVault::lock(conn, &args.scoped_vault_id)?;
        let insight_event_id = if let Some(insight_event) = args.insight_event {
            Some(insight_event.insert_with_conn(conn)?.id)
        } else {
            None
        };
        let v = Vault::get(conn.conn(), &args.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn.conn(), &args.ob_configuration_id)?;

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

        let (wf, is_new) = Workflow::get_or_create(
            conn,
            args.scoped_vault_id.clone(),
            config,
            fixture_result,
            obc.id,
            insight_event_id.clone(),
        )?;

        // Eventually, we'll get rid of onboarding and we'll just get_or_create the workflow here
        let ob = onboarding::table
            .filter(onboarding::scoped_vault_id.eq(&args.scoped_vault_id))
            .first(conn.conn())
            .optional()?;

        let ob = if let Some(ob) = ob {
            ob
        } else {
            let new_ob = NewOnboarding {
                scoped_vault_id: args.scoped_vault_id.clone(),
                start_timestamp: Utc::now(),
                insight_event_id,
                workflow_id: wf.id.clone(),
            };
            diesel::insert_into(onboarding::table)
                .values(new_ob)
                .get_result::<Onboarding>(conn.conn())?
        };

        // In locked transaction, update scoped vault status to Incomplete if it's null
        if sv.status.is_none() {
            ScopedVault::update_status(conn, &sv.id, OnboardingStatus::Incomplete)?;
        }

        Ok((ob, wf, is_new))
    }

    #[tracing::instrument("Onboarding::update", skip_all)]
    pub fn update(
        // Intentionally consume the value so the stale version is not used
        ob: Locked<Onboarding>,
        conn: &mut TxnPgConn,
        // While we're double writing status to wf_id, update it here if it exists
        wf_id: Option<&WorkflowId>,
        update: OnboardingUpdate,
    ) -> DbResult<Self> {
        let sv = ScopedVault::lock(conn, &ob.scoped_vault_id)?;
        let tenant = Tenant::get(conn, &sv.tenant_id)?;
        // !! it's important that code in the same txn that is going to write a review does it before this update call
        let mr_wf_id = wf_id.unwrap_or(&ob.workflow_id);
        let mr = ManualReview::get_active(conn, mr_wf_id)?;

        // Update the workflow to keep it in sync with the onboarding for now
        if let Some(wf_id) = wf_id {
            let update = WorkflowUpdate {
                status: update.status,
                authorized_at: update.authorized_at,
                decision_made_at: None,
            };
            Workflow::update(conn, wf_id, update)?;
        }
        if let Some(new_status) = update.status {
            let old_status = sv.status;
            if old_status != Some(new_status) {
                let old_status_has_decision = match old_status {
                    None => false,
                    Some(s) => s.has_decision(),
                };

                // Only set to non-decision status if the current status is a non-decision status
                // This has the effect of never letting the scoped vault status go from a decision to a non-decision status
                if !old_status_has_decision || new_status.has_decision() {
                    ScopedVault::update_status(conn, &sv.id, new_status)?;
                }

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
                        scoped_vault_id: ob.scoped_vault_id.clone(),
                        tenant_id: tenant.id.clone(),
                        is_live: sv.is_live,
                        webhook_event,
                    });
                    Task::create(conn, Utc::now(), task_data)?;
                };

                // fire a OnboardingStatusChanged webhook no matter what
                let webhook_event = WebhookEvent::OnboardingStatusChanged(OnboardingStatusChangedPayload {
                    fp_id: sv.fp_id.clone(),
                    footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                    timestamp: Utc::now(),
                    new_status,
                });
                let task_data = TaskData::FireWebhook(FireWebhookArgs {
                    scoped_vault_id: ob.scoped_vault_id.clone(),
                    tenant_id: tenant.id,
                    is_live: sv.is_live,
                    webhook_event,
                });
                Task::create(conn, Utc::now(), task_data)?;
            }
        }
        let OnboardingUpdate {
            authorized_at,
            idv_reqs_initiated_at,
            decision_made_at,
            ..
        } = update;
        let result =
            if authorized_at.is_some() || idv_reqs_initiated_at.is_some() || decision_made_at.is_some() {
                let update = OnboardingUpdateRow {
                    authorized_at,
                    idv_reqs_initiated_at,
                    decision_made_at,
                };
                diesel::update(onboarding::table)
                    .filter(onboarding::id.eq(&ob.id))
                    .set(update)
                    .get_result::<Self>(conn.conn())?
            } else {
                ob.into_inner()
            };
        Ok(result)
    }

    #[tracing::instrument("Onboarding::get_billable_count", skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        kind: VaultKind,
    ) -> DbResult<i64> {
        use db_schema::schema::{onboarding, scoped_vault, vault};
        let count = onboarding::table
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            .filter(vault::kind.eq(kind))
            // We won't charge tenants for onboardings that didn't finish authorizing, even if we
            // already ran KYC checks
            .filter(not(onboarding::authorized_at.is_null()))
            // Filter for onboardings that had their final decision made during this billing period
            .filter(onboarding::decision_made_at.ge(start_date))
            .filter(onboarding::decision_made_at.lt(end_date))
            .select(count_star())
            .get_result(conn)?;
        Ok(count)
    }
}
