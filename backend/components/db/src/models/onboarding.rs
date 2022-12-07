use super::document_request::DocumentRequest;
use super::insight_event::CreateInsightEvent;
use super::liveness_event::LivenessEvent;
use super::manual_review::ManualReview;
use super::onboarding_decision::OnboardingDecision;
use super::scoped_user::ScopedUser;
use crate::actor::{self, SaturatedActor};
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configuration::ObConfiguration;
use crate::schema::{onboarding, scoped_user};
use crate::{DbError, DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    FootprintUserId, InsightEventId, ObConfigurationId, OnboardingDecisionId, OnboardingId, ScopedUserId,
    TenantId, UserVaultId,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub scoped_user_id: ScopedUserId,
    pub ob_configuration_id: ObConfigurationId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub is_authorized: bool,
    pub idv_reqs_initiated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_user_id: ScopedUserId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    insight_event_id: InsightEventId,
    is_authorized: bool,
    idv_reqs_initiated: bool,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = onboarding)]
pub struct OnboardingUpdate {
    pub is_authorized: Option<bool>,
    pub idv_reqs_initiated: Option<bool>,
}

pub struct OnboardingCreateArgs {
    pub scoped_user_id: ScopedUserId,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event: CreateInsightEvent,
    pub should_create_document_request: bool,
}

impl OnboardingUpdate {
    pub fn is_authorized(is_authorized: bool) -> Self {
        Self {
            is_authorized: Some(is_authorized),
            ..Self::default()
        }
    }

    pub fn idv_reqs_initiated(idv_reqs_initiated: bool) -> Self {
        Self {
            idv_reqs_initiated: Some(idv_reqs_initiated),
            ..Self::default()
        }
    }
}

#[derive(Debug)]
pub enum OnboardingIdentifier<'a> {
    Id(&'a OnboardingId),
    FpUserId {
        fp_user_id: &'a FootprintUserId,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    UserId {
        id: &'a OnboardingId,
        user_vault_id: &'a UserVaultId,
    },
    ConfigId {
        user_vault_id: &'a UserVaultId,
        ob_config_id: &'a ObConfigurationId,
    },
}

impl<'a> From<&'a OnboardingId> for OnboardingIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<(&'a FootprintUserId, &'a TenantId, bool)> for OnboardingIdentifier<'a> {
    fn from((fp_user_id, tenant_id, is_live): (&'a FootprintUserId, &'a TenantId, bool)) -> Self {
        Self::FpUserId {
            fp_user_id,
            tenant_id,
            is_live,
        }
    }
}

impl<'a> From<(&'a OnboardingId, &'a UserVaultId)> for OnboardingIdentifier<'a> {
    fn from((id, user_vault_id): (&'a OnboardingId, &'a UserVaultId)) -> Self {
        Self::UserId { id, user_vault_id }
    }
}

impl<'a> From<(&'a UserVaultId, &'a ObConfigurationId)> for OnboardingIdentifier<'a> {
    fn from((user_vault_id, ob_config_id): (&'a UserVaultId, &'a ObConfigurationId)) -> Self {
        Self::ConfigId {
            user_vault_id,
            ob_config_id,
        }
    }
}

type OnboardingInfo<TDecision> = (
    Onboarding,
    ObConfiguration,
    Option<LivenessEvent>,
    InsightEvent,
    Option<ManualReview>,
    Option<TDecision>,
);

fn map_ob_info<T, U, Fn>(i: OnboardingInfo<T>, f: Fn) -> DbResult<OnboardingInfo<U>>
where
    Fn: FnOnce(T) -> DbResult<U>,
{
    let u = i.5.map(f).transpose()?;
    Ok((i.0, i.1, i.2, i.3, i.4, u))
}

pub type SerializableOnboardingInfo = OnboardingInfo<(OnboardingDecision, SaturatedActor)>;

/// Wrapper around the very basic pieces of information generally needed when fetching an Onboarding
pub type BasicOnboardingInfo = (
    Onboarding,
    ScopedUser,
    Option<ManualReview>,
    Option<OnboardingDecision>,
);

impl Onboarding {
    pub fn get<'a, T>(conn: &'a mut PgConnection, id: T) -> DbResult<BasicOnboardingInfo>
    where
        T: Into<OnboardingIdentifier<'a>>,
    {
        use crate::schema::{manual_review, onboarding_decision};
        let mut query = onboarding::table
            .inner_join(scoped_user::table)
            // Only fetch active manual review for this onboarding
            .left_join(manual_review::table)
            .filter(manual_review::completed_at.is_null())
            // Only fetch active onboarding decisions for this onboarding
            .left_join(onboarding_decision::table)
            .filter(onboarding_decision::deactivated_at.is_null())
            .into_boxed();

        match id.into() {
            OnboardingIdentifier::Id(id) => query = query.filter(onboarding::id.eq(id)),
            OnboardingIdentifier::FpUserId {
                fp_user_id,
                tenant_id,
                is_live,
            } => {
                query = query
                    .filter(scoped_user::fp_user_id.eq(fp_user_id))
                    .filter(scoped_user::tenant_id.eq(tenant_id))
                    .filter(scoped_user::is_live.eq(is_live))
            }
            OnboardingIdentifier::UserId { id, user_vault_id } => {
                query = query
                    .filter(onboarding::id.eq(id))
                    .filter(scoped_user::user_vault_id.eq(user_vault_id))
            }
            OnboardingIdentifier::ConfigId {
                user_vault_id,
                ob_config_id,
            } => {
                query = query
                    .filter(scoped_user::user_vault_id.eq(user_vault_id))
                    .filter(onboarding::ob_configuration_id.eq(ob_config_id))
            }
        }

        let result = query.first(conn)?;

        Ok(result)
    }

    // TODO generify lock functions to use OnboardingIdentifier.
    // It is difficult because we can't call .for_update() on boxed queries
    pub fn lock_by_config(
        conn: &mut TxnPgConnection,
        user_vault_id: &UserVaultId,
        ob_configuration_id: &ObConfigurationId,
    ) -> DbResult<Option<(Onboarding, ScopedUser)>> {
        let result = onboarding::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .filter(onboarding::ob_configuration_id.eq(ob_configuration_id))
            .for_no_key_update()
            .first(conn.conn())
            .optional()?;
        Ok(result)
    }

    pub fn lock_for_tenant(
        conn: &mut TxnPgConnection,
        fp_user_id: &FootprintUserId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<BasicOnboardingInfo> {
        let scoped_user_ids = scoped_user::table
            .filter(scoped_user::fp_user_id.eq(fp_user_id))
            .select(scoped_user::id);
        onboarding::table
            .filter(onboarding::scoped_user_id.eq_any(scoped_user_ids))
            .for_no_key_update()
            .load::<Onboarding>(conn.conn())?;

        // It's a bit precarious to make a FOR UPDATE statement with joins
        Self::get(conn, (fp_user_id, tenant_id, is_live))
    }

    pub fn lock(conn: &mut TxnPgConnection, id: &OnboardingId) -> DbResult<Self> {
        let result = onboarding::table
            .filter(onboarding::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(result)
    }

    pub fn get_for_scoped_users(
        conn: &mut PgConnection,
        scoped_user_ids: Vec<&ScopedUserId>,
    ) -> DbResult<HashMap<ScopedUserId, SerializableOnboardingInfo>> {
        use crate::schema::{
            insight_event, liveness_event, manual_review, ob_configuration, onboarding_decision,
        };
        let result: Vec<OnboardingInfo<OnboardingDecision>> = onboarding::table
            .inner_join(ob_configuration::table)
            // TODO return all liveness events
            .left_join(liveness_event::table)
            .inner_join(insight_event::table)
            // Only fetch active manual review for this onboarding
            .left_join(manual_review::table)
            .filter(manual_review::completed_at.is_null())
            .left_join(onboarding_decision::table)
            .filter(onboarding_decision::deactivated_at.is_null())
            .filter(onboarding::scoped_user_id.eq_any(scoped_user_ids))
            .order_by(onboarding::scoped_user_id)
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
        // group_by only groups adjacent items, so this requires that the vec is sorted by scoped_user_id
        let result_map = obs
            .into_iter()
            .map(|ob| (ob.0.scoped_user_id.clone(), ob))
            .collect();
        Ok(result_map)
    }

    pub fn get_or_create(conn: &mut TxnPgConnection, args: OnboardingCreateArgs) -> DbResult<Onboarding> {
        let ob = onboarding::table
            .filter(onboarding::scoped_user_id.eq(&args.scoped_user_id))
            .filter(onboarding::ob_configuration_id.eq(&args.ob_configuration_id))
            .first(conn.conn())
            .optional()?;
        if let Some(ob) = ob {
            return Ok(ob);
        }
        // Row doesn't exist for scoped_user_id, ob_configuration_id - create a new one
        let insight_event = args.insight_event.insert_with_conn(conn)?;
        let new_ob = NewOnboarding {
            scoped_user_id: args.scoped_user_id,
            ob_configuration_id: args.ob_configuration_id,
            start_timestamp: Utc::now(),
            insight_event_id: insight_event.id,
            is_authorized: false,
            idv_reqs_initiated: false,
        };
        let ob = diesel::insert_into(onboarding::table)
            .values(new_ob)
            .get_result::<Onboarding>(conn.conn())?;

        // To prevent duplicate document requests, only create a doc request if the onboarding is new
        if args.should_create_document_request {
            DocumentRequest::create(conn, ob.id.clone(), None)?;
        }

        Ok(ob)
    }

    pub fn update(self, conn: &mut PgConnection, update: OnboardingUpdate) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used
        let result = Self::update_by_id(conn, &self.id, update)?;
        Ok(result)
    }

    pub fn update_by_id(
        conn: &mut PgConnection,
        id: &OnboardingId,
        update: OnboardingUpdate,
    ) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used
        let result = diesel::update(onboarding::table)
            .filter(onboarding::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }
}
