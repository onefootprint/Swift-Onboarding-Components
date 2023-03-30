use super::insight_event::CreateInsightEvent;
use super::liveness_event::LivenessEvent;
use super::manual_review::ManualReview;
use super::onboarding_decision::OnboardingDecision;
use super::scoped_vault::ScopedVault;
use crate::actor::{self, SaturatedActor};
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configuration::ObConfiguration;
use crate::schema::{onboarding, scoped_vault};
use crate::PgConn;
use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::dsl::{count_star, not};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    DecisionStatus, FpId, InsightEventId, Locked, ObConfigurationId, OnboardingDecisionId, OnboardingId,
    ScopedVaultId, TenantId, TenantScope, VaultId,
};
use newtypes::{OnboardingStatus, VaultKind};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

type IsNew = bool;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub authorized_at: Option<DateTime<Utc>>,
    pub idv_reqs_initiated_at: Option<DateTime<Utc>>,
    pub decision_made_at: Option<DateTime<Utc>>,
    pub status: OnboardingStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_vault_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    insight_event_id: InsightEventId,
    status: OnboardingStatus,
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
    pub insight_event: CreateInsightEvent,
}

impl OnboardingUpdate {
    pub fn is_authorized() -> Self {
        Self {
            authorized_at: Some(Some(Utc::now())),
            status: Some(OnboardingStatus::Pending),
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

    pub fn set_has_final_decision(decision_status: DecisionStatus) -> Self {
        Self {
            decision_made_at: Some(Some(Utc::now())),
            status: Some(decision_status.into()),
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

type OnboardingInfo<TDecision> = (
    Onboarding,
    ObConfiguration,
    (ScopedVault, Option<LivenessEvent>),
    InsightEvent,
    Option<ManualReview>,
    Option<TDecision>,
);

#[derive(Clone)]
pub struct OnboardingAndConfig(pub Onboarding, pub ObConfiguration);

fn map_ob_info<T, U, Fn>(i: OnboardingInfo<T>, f: Fn) -> DbResult<OnboardingInfo<U>>
where
    Fn: FnOnce(T) -> DbResult<U>,
{
    let u = i.5.map(f).transpose()?;
    Ok((i.0, i.1, i.2, i.3, i.4, u))
}

pub type SerializableOnboardingInfo = OnboardingInfo<(OnboardingDecision, SaturatedActor)>;

/// Wrapper around the very basic pieces of information generally needed when fetching an Onboarding
pub type BasicOnboardingInfo<ObT> = (ObT, ScopedVault, Option<ManualReview>, Option<OnboardingDecision>);

impl Onboarding {
    #[tracing::instrument(skip_all)]
    pub fn get<'a, T>(conn: &'a mut PgConn, id: T) -> DbResult<BasicOnboardingInfo<Onboarding>>
    where
        T: Into<OnboardingIdentifier<'a>>,
    {
        use crate::schema::{business_owner, manual_review, onboarding_decision};
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

    // TODO generify lock functions to use OnboardingIdentifier.
    // It is difficult because we can't call .for_update() on boxed queries
    #[tracing::instrument(skip_all)]
    pub fn lock_by_config(
        conn: &mut TxnPgConn,
        vault_id: &VaultId,
        ob_configuration_id: &ObConfigurationId,
    ) -> DbResult<Option<Locked<Onboarding>>> {
        let su_ids = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(vault_id))
            .select(scoped_vault::id);
        let result = onboarding::table
            .filter(onboarding::scoped_vault_id.eq_any(su_ids))
            .filter(onboarding::ob_configuration_id.eq(ob_configuration_id))
            .for_no_key_update()
            .first(conn.conn())
            .optional()?;
        let result = result.map(Locked::new);
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
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

    #[tracing::instrument(skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &OnboardingId) -> DbResult<Locked<Self>> {
        let result = onboarding::table
            .filter(onboarding::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument(skip_all)]
    pub fn bulk_get_for_users(
        conn: &mut PgConn,
        scoped_vault_ids: Vec<&ScopedVaultId>,
    ) -> DbResult<HashMap<ScopedVaultId, OnboardingAndConfig>> {
        // For now, this will be either 0 or 1 result per user
        use crate::schema::ob_configuration;
        let results = onboarding::table
            .inner_join(ob_configuration::table)
            .filter(onboarding::scoped_vault_id.eq_any(scoped_vault_ids))
            .get_results::<(Self, ObConfiguration)>(conn)?
            .into_iter()
            .map(|(ob, obc)| (ob.scoped_vault_id.clone(), OnboardingAndConfig(ob, obc)))
            .collect();

        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_for_scoped_users(
        conn: &mut PgConn,
        scoped_vault_ids: Vec<&ScopedVaultId>,
    ) -> DbResult<HashMap<ScopedVaultId, SerializableOnboardingInfo>> {
        use crate::schema::{
            insight_event, liveness_event, manual_review, ob_configuration, onboarding_decision,
        };
        let result: Vec<OnboardingInfo<OnboardingDecision>> = onboarding::table
            .inner_join(ob_configuration::table)
            // TODO return all liveness events
            .inner_join(scoped_vault::table.left_join(liveness_event::table))
            .inner_join(insight_event::table)
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
            .filter(onboarding::scoped_vault_id.eq_any(scoped_vault_ids))
            .order_by(onboarding::scoped_vault_id)
            .load(conn)?;

        let onboarding_decisions: Vec<OnboardingDecision> =
            result.clone().into_iter().flat_map(|t| t.5).collect();
        let onboarding_decision_to_saturated_actor: HashMap<OnboardingDecisionId, SaturatedActor> =
            actor::saturate_actors(conn, onboarding_decisions)?
                .into_iter()
                .map(|o| (o.0.id.clone(), o.1))
                .collect();

        let obs = result
            .into_iter()
            .map(|i| {
                map_ob_info(i, |decision| {
                    let actor = onboarding_decision_to_saturated_actor
                        .get(&decision.id)
                        .ok_or(DbError::RelatedObjectNotFound)?
                        .clone();
                    Ok((decision, actor))
                })
            })
            .collect::<DbResult<Vec<_>>>()?;

        // Turn the Vec of OnboardingInfo into a hashmap of OnboadringId -> Vec<OnboardingInfo>
        // group_by only groups adjacent items, so this requires that the vec is sorted by scoped_vault_id
        let result_map = obs
            .into_iter()
            .map(|ob| (ob.0.scoped_vault_id.clone(), ob))
            .collect();
        Ok(result_map)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_or_create(conn: &mut TxnPgConn, args: OnboardingCreateArgs) -> DbResult<(Onboarding, IsNew)> {
        let ob = onboarding::table
            .filter(onboarding::scoped_vault_id.eq(&args.scoped_vault_id))
            .filter(onboarding::ob_configuration_id.eq(&args.ob_configuration_id))
            .first(conn.conn())
            .optional()?;
        if let Some(ob) = ob {
            return Ok((ob, false));
        }
        // Row doesn't exist for scoped_vault_id, ob_configuration_id - create a new one
        let insight_event = args.insight_event.insert_with_conn(conn)?;
        let new_ob = NewOnboarding {
            scoped_vault_id: args.scoped_vault_id,
            ob_configuration_id: args.ob_configuration_id,
            start_timestamp: Utc::now(),
            insight_event_id: insight_event.id,
            status: OnboardingStatus::Incomplete,
        };
        let ob = diesel::insert_into(onboarding::table)
            .values(new_ob)
            .get_result::<Onboarding>(conn.conn())?;

        Ok((ob, true))
    }

    #[tracing::instrument(skip_all)]
    pub fn update(self, conn: &mut PgConn, update: OnboardingUpdate) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used
        let result = Self::update_by_id(conn, &self.id, update)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn update_by_id(conn: &mut PgConn, id: &OnboardingId, update: OnboardingUpdate) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used
        let result = diesel::update(onboarding::table)
            .filter(onboarding::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        kind: VaultKind,
    ) -> DbResult<i64> {
        use crate::schema::{onboarding, scoped_vault, vault};
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

impl OnboardingAndConfig {
    /// returns the TenantScopes to which this ObConfiguration (upon authorization!) grants access
    /// to decrypt.
    /// Don't use this on Onboardings that have not been authorized
    pub fn can_decrypt_scopes(&self) -> Vec<TenantScope> {
        let Self(ob, obc) = &self;
        if ob.authorized_at.is_none() {
            // Only authorized onboardings give permission to decrypt data
            vec![]
        } else {
            let cdos = obc.can_access_data.clone();
            cdos.into_iter().map(TenantScope::Decrypt).collect()
        }
    }

    /// Returns the TenantScopes that represent the data this ObConfiguration grants access to see.
    /// NOTE: this is not the same as the data that is allowed to be decrypted.
    /// If an ob config intended to collect a field, a tenant is able to see that it exists whether
    /// or not they can decrypt it.
    /// Don't use this on Onboardings that have not been authorized
    pub fn visible_scopes(&self) -> Vec<TenantScope> {
        // Even un-approved onboardings give permissions to see data, just not decrypt
        let Self(_, obc) = &self;
        let cdos = obc.must_collect_data.clone();
        cdos.into_iter().map(TenantScope::Decrypt).collect()
    }
}
