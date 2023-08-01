use super::insight_event::CreateInsightEvent;
use super::manual_review::ManualReview;
use super::onboarding_decision::OnboardingDecision;
use super::scoped_vault::ScopedVault;
use super::task::Task;
use super::tenant::Tenant;
use super::vault::Vault;
use super::workflow::Workflow;
use crate::models::ob_configuration::ObConfiguration;
use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{onboarding, scoped_vault};
use diesel::dsl::{count_star, not};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    AlpacaKycConfig, CipKind, DecisionStatus, FireWebhookArgs, FpId, InsightEventId, KycConfig, Locked,
    ObConfigurationId, OnboardingCompletedPayload, OnboardingId, OnboardingStatusChangedPayload,
    ScopedVaultId, TaskData, TenantId, TenantScope, VaultId, WebhookEvent, WorkflowFixtureResult, WorkflowId,
};
use newtypes::{OnboardingStatus, VaultKind};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub enum IsNew {
    Yes(Option<Workflow>),
    No,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: Option<InsightEventId>,
    pub authorized_at: Option<DateTime<Utc>>,
    pub idv_reqs_initiated_at: Option<DateTime<Utc>>,
    pub decision_made_at: Option<DateTime<Utc>>,
    pub status: OnboardingStatus,
    pub workflow_id: Option<WorkflowId>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_vault_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    insight_event_id: Option<InsightEventId>,
    status: OnboardingStatus,
    workflow_id: Option<WorkflowId>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = onboarding)]
pub struct OnboardingUpdate {
    pub authorized_at: Option<Option<DateTime<Utc>>>,
    pub idv_reqs_initiated_at: Option<Option<DateTime<Utc>>>,
    pub decision_made_at: Option<Option<DateTime<Utc>>>,
    pub status: Option<OnboardingStatus>,
}

pub struct OnboardingCreateArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event: Option<CreateInsightEvent>,
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
            ..Self::default()
        }
    }

    pub fn idv_reqs_initiated_and_is_authorized() -> Self {
        Self {
            idv_reqs_initiated_at: Some(Some(Utc::now())),
            authorized_at: Some(Some(Utc::now())),
            status: Some(OnboardingStatus::Pending),
            ..Self::default()
        }
    }

    pub fn set_decision_and_decision_made_at(decision_status: DecisionStatus) -> Self {
        Self {
            status: Some(decision_status.into()),
            decision_made_at: Some(Some(Utc::now())),
            ..Self::default()
        }
    }

    pub fn set_decision(decision_status: DecisionStatus) -> Self {
        Self {
            status: Some(decision_status.into()),
            ..Self::default()
        }
    }

    pub fn idv_reqs_and_has_final_decision_and_is_authorized(decision_status: DecisionStatus) -> Self {
        Self {
            authorized_at: Some(Some(Utc::now())),
            idv_reqs_initiated_at: Some(Some(Utc::now())),
            decision_made_at: Some(Some(Utc::now())),
            status: Some(decision_status.into()),
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
    ScopedVaultId {
        su_id: &'a ScopedVaultId,
        vault_id: &'a VaultId,
    },
    ScopedBusinessId {
        sb_id: &'a ScopedVaultId,
        /// Note: the ID of the user vault that owns this business
        vault_id: &'a VaultId,
    },
    /// Look up a business's onboarding from any of its owners' vault ID
    BusinessOwner {
        owner_vault_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
    },
    ConfigId {
        vault_id: &'a VaultId,
        ob_config_id: &'a ObConfigurationId,
    },
}

impl<'a> From<&'a OnboardingId> for OnboardingIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::Id(id)
    }
}

// TODO change this to su_id, vault_id?
impl<'a> From<(&'a ScopedVaultId, &'a VaultId)> for OnboardingIdentifier<'a> {
    fn from((su_id, vault_id): (&'a ScopedVaultId, &'a VaultId)) -> Self {
        Self::ScopedVaultId { su_id, vault_id }
    }
}

impl<'a> From<(&'a VaultId, &'a ObConfigurationId)> for OnboardingIdentifier<'a> {
    fn from((vault_id, ob_config_id): (&'a VaultId, &'a ObConfigurationId)) -> Self {
        Self::ConfigId {
            vault_id,
            ob_config_id,
        }
    }
}

#[derive(Clone)]
pub struct OnboardingAndConfig(pub Onboarding, pub ObConfiguration);

/// Wrapper around the very basic pieces of information generally needed when fetching an Onboarding
pub type BasicOnboardingInfo<ObT = Onboarding> =
    (ObT, ScopedVault, Option<ManualReview>, Option<OnboardingDecision>);

impl Onboarding {
    #[tracing::instrument("Onboarding::get", skip_all)]
    pub fn get<'a, T>(conn: &'a mut PgConn, id: T) -> DbResult<BasicOnboardingInfo>
    where
        T: Into<OnboardingIdentifier<'a>>,
    {
        use db_schema::schema::{business_owner, manual_review, onboarding_decision};
        let mut query = onboarding::table
            .inner_join(scoped_vault::table)
            // Only fetch active manual review for this onboarding
            .left_join(manual_review::table.on(
                manual_review::onboarding_id.eq(onboarding::id)
                .and(manual_review::completed_at.is_null())
            ))
            // Only fetch active onboarding decisions for this onboarding
            .left_join(onboarding_decision::table.on(
                onboarding_decision::onboarding_id.eq(onboarding::id)
                .and(onboarding_decision::deactivated_at.is_null())
            ))
            .into_boxed();

        match id.into() {
            OnboardingIdentifier::Id(id) => query = query.filter(onboarding::id.eq(id)),
            OnboardingIdentifier::ScopedVaultId { su_id, vault_id } => {
                query = query
                    .filter(onboarding::scoped_vault_id.eq(su_id))
                    .filter(scoped_vault::vault_id.eq(vault_id))
            }
            OnboardingIdentifier::ScopedBusinessId { sb_id, vault_id } => {
                let business_vault_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(vault_id))
                    .select(business_owner::business_vault_id);
                query = query
                    .filter(onboarding::scoped_vault_id.eq(sb_id))
                    .filter(scoped_vault::vault_id.eq_any(business_vault_ids))
            }
            OnboardingIdentifier::BusinessOwner {
                owner_vault_id,
                ob_config_id,
            } => {
                let business_vault_ids = business_owner::table
                    .filter(business_owner::user_vault_id.eq(owner_vault_id))
                    .select(business_owner::business_vault_id);
                query = query
                    .filter(scoped_vault::vault_id.eq_any(business_vault_ids))
                    .filter(onboarding::ob_configuration_id.eq(ob_config_id))
            }
            OnboardingIdentifier::ConfigId {
                vault_id,
                ob_config_id,
            } => {
                query = query
                    .filter(scoped_vault::vault_id.eq(vault_id))
                    .filter(onboarding::ob_configuration_id.eq(ob_config_id))
            }
        }

        let result = query.first(conn)?;

        Ok(result)
    }

    // Generally we need to query by scoped vault AND user vault in authed endpoints,
    // to prove ownership, so this is broken out
    #[tracing::instrument("Onboarding::get_by_scoped_vault_internal_lookup_only", skip_all)]
    pub fn get_by_scoped_vault_internal_lookup_only(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Self> {
        let res = onboarding::table
            .filter(onboarding::scoped_vault_id.eq(scoped_vault_id))
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Onboarding::lock_for_tenant", skip_all)]
    pub fn lock_for_tenant(
        conn: &mut TxnPgConn,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<BasicOnboardingInfo<Locked<Onboarding>>> {
        let scoped_vault_ids = scoped_vault::table
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .select(scoped_vault::id);
        // Lock first, then grab the related info
        let ob = onboarding::table
            .filter(onboarding::scoped_vault_id.eq_any(scoped_vault_ids))
            .for_no_key_update()
            .first::<Onboarding>(conn.conn())?;

        // It's a bit precarious to make a FOR UPDATE statement with joins
        let result = Self::get(conn, &ob.id)?;
        Ok((Locked::new(result.0), result.1, result.2, result.3))
    }

    #[tracing::instrument("Onboarding::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &OnboardingId) -> DbResult<Locked<Self>> {
        let result = onboarding::table
            .filter(onboarding::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("Onboarding::bulk_get_for_users", skip_all)]
    pub fn bulk_get_for_users(
        conn: &mut PgConn,
        scoped_vault_ids: Vec<&ScopedVaultId>,
    ) -> DbResult<HashMap<ScopedVaultId, OnboardingAndConfig>> {
        // For now, this will be either 0 or 1 result per user
        use db_schema::schema::ob_configuration;
        let results = onboarding::table
            .inner_join(ob_configuration::table)
            .filter(onboarding::scoped_vault_id.eq_any(scoped_vault_ids))
            .get_results::<(Self, ObConfiguration)>(conn)?
            .into_iter()
            .map(|(ob, obc)| (ob.scoped_vault_id.clone(), OnboardingAndConfig(ob, obc)))
            .collect();

        Ok(results)
    }

    #[tracing::instrument("Onboarding::get_or_create", skip_all)]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        args: OnboardingCreateArgs,
        should_create_workflow: bool,
        fixture_result: Option<WorkflowFixtureResult>,
    ) -> DbResult<(Onboarding, IsNew)> {
        let ob = onboarding::table
            .filter(onboarding::scoped_vault_id.eq(&args.scoped_vault_id))
            .filter(onboarding::ob_configuration_id.eq(&args.ob_configuration_id))
            .first(conn.conn())
            .optional()?;
        if let Some(ob) = ob {
            return Ok((ob, IsNew::No));
        }

        let v = Vault::get(conn.conn(), &args.scoped_vault_id)?;
        // TODO: later have a KYB workflow and create that here as well
        let wf = if matches!(v.kind, VaultKind::Person) && should_create_workflow {
            let (obc, _) = ObConfiguration::get(conn.conn(), &args.ob_configuration_id)?;

            let config = if matches!(obc.cip_kind, Some(CipKind::Alpaca)) {
                AlpacaKycConfig { is_redo: false }.into()
            } else {
                KycConfig { is_redo: false }.into()
            };
            let wf = Workflow::create(conn, &args.scoped_vault_id, config, fixture_result)?;
            Some(wf)
        } else {
            None
        };

        // Row doesn't exist for scoped_vault_id, ob_configuration_id - create a new one
        let insight_event_id = if let Some(insight_event) = args.insight_event {
            Some(insight_event.insert_with_conn(conn)?.id)
        } else {
            None
        };
        let new_ob = NewOnboarding {
            scoped_vault_id: args.scoped_vault_id.clone(),
            ob_configuration_id: args.ob_configuration_id,
            start_timestamp: Utc::now(),
            insight_event_id,
            status: OnboardingStatus::Incomplete,
            workflow_id: wf.as_ref().map(|w| w.id.clone()),
        };
        let ob = diesel::insert_into(onboarding::table)
            .values(new_ob)
            .get_result::<Onboarding>(conn.conn())?;

        Ok((ob, IsNew::Yes(wf)))
    }

    #[tracing::instrument("Onboarding::update", skip_all)]
    pub fn update(ob: Locked<Onboarding>, conn: &mut TxnPgConn, update: OnboardingUpdate) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used

        let sv = ScopedVault::get(conn, &ob.id)?;
        let tenant = Tenant::get(conn, &sv.tenant_id)?;
        // !! it's important that code in the same txn that is going to write a review does it before this update call
        let mr = ManualReview::get_active_for_onboarding(conn, &ob.id)?;

        if let Some(new_status) = update.status {
            if ob.status != new_status {
                // Since the OnboardingCompletedPayload webhook has `requires_manual_review`, its semantics currently really mean we have to fire it when we make a
                // decision for the first time or in a redo flow
                if !ob.status.has_decision() && new_status.has_decision() {
                    let webhook_event = WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
                        fp_id: sv.fp_id.clone(),
                        footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                        timestamp: Utc::now(),
                        status: new_status,
                        requires_manual_review: mr.is_some(),
                    });
                    Task::create(
                        conn,
                        Utc::now(),
                        TaskData::FireWebhook(FireWebhookArgs {
                            scoped_vault_id: ob.scoped_vault_id.clone(),
                            tenant_id: tenant.id.clone(),
                            is_live: sv.is_live,
                            webhook_event,
                        }),
                    )?;
                };

                // fire a OnboardingStatusChanged webhook no matter what
                let webhook_event = WebhookEvent::OnboardingStatusChanged(OnboardingStatusChangedPayload {
                    fp_id: sv.fp_id.clone(),
                    footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                    timestamp: Utc::now(),
                    new_status,
                });
                Task::create(
                    conn,
                    Utc::now(),
                    TaskData::FireWebhook(FireWebhookArgs {
                        scoped_vault_id: ob.scoped_vault_id.clone(),
                        tenant_id: tenant.id,
                        is_live: sv.is_live,
                        webhook_event,
                    }),
                )?;
            }
        }

        let result = diesel::update(onboarding::table)
            .filter(onboarding::id.eq(&ob.id))
            .set(update)
            .get_result(conn.conn())?;
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

    /// Returns true if this onboarding has been entirely completed by the customer
    pub fn is_complete(&self) -> bool {
        self.idv_reqs_initiated_at.is_some()
            && self.decision_made_at.is_some()
            && self.authorized_at.is_some()
    }
}

pub type AuthorizedOnboarding = (Onboarding, ScopedVault, ObConfiguration, Tenant);

impl Onboarding {
    /// List all authorized onboardings for a given vault
    pub fn list_authorized(conn: &mut PgConn, v_id: &VaultId) -> DbResult<Vec<AuthorizedOnboarding>> {
        use db_schema::schema::{ob_configuration, tenant};
        let results = onboarding::table
            .inner_join(scoped_vault::table)
            .inner_join(ob_configuration::table)
            .inner_join(tenant::table.on(tenant::id.eq(ob_configuration::tenant_id)))
            .filter(scoped_vault::vault_id.eq(v_id))
            .filter(onboarding::status.eq(OnboardingStatus::Pass))
            .order_by(onboarding::start_timestamp.desc())
            .get_results(conn)?;
        Ok(results)
    }
}

impl OnboardingAndConfig {
    /// returns the TenantScopes to which this ObConfiguration (upon authorization!) grants access
    /// to decrypt.
    pub fn can_decrypt_scopes(&self) -> Vec<TenantScope> {
        let Self(ob, obc) = &self;
        if ob.authorized_at.is_none() {
            // Only authorized onboardings give permission to decrypt data
            vec![]
        } else {
            let cdos = obc.can_access_data.clone();
            cdos.into_iter().map(|cdo| cdo.permission()).collect()
        }
    }

    /// Returns the TenantScopes that this onboarding is _not_ allowed to decrypt.
    /// This is subtly different from the inverse of `can_decrypt_scopes` above.
    pub fn cannot_decrypt_scopes(&self) -> Vec<TenantScope> {
        let Self(ob, obc) = &self;
        let cdos = if ob.authorized_at.is_none() {
            // If the onboarding isn't authorized, we shouldn't be able to decrypt all of the data requested.
            // But, data requested outside of onboarding should always be decryptable.
            obc.must_collect_data.clone()
        } else {
            // If the onboarding is authorized, we just restrict decrypting the fields that were not
            // explicitly authorized.
            // Again, all data collected outside of onboarding will be decryptable.
            obc.must_collect_data
                .clone()
                .into_iter()
                .filter(|cdo| !obc.can_access_data.contains(cdo))
                .collect()
        };
        cdos.into_iter().map(|cdo| cdo.permission()).collect()
    }
}
