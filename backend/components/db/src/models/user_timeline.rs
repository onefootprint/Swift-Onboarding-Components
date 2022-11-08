use std::collections::HashMap;

use crate::models::scoped_user::ScopedUser;
use crate::DbError;
use crate::{schema::user_timeline, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{DbUserTimelineEvent, FootprintUserId, OnboardingId, TenantId, UserTimelineId, UserVaultId};
use serde::{Deserialize, Serialize};

use super::insight_event::InsightEvent;
use super::onboarding_decision::{OnboardingDecision, SaturatedOnboardingDecisionInfo};
use super::webauthn_credential::WebauthnCredential;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_timeline)]
pub struct UserTimeline {
    pub id: UserTimelineId,
    pub onboarding_id: Option<OnboardingId>,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub user_vault_id: UserVaultId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_timeline)]
pub struct NewUserTimeline {
    pub user_vault_id: UserVaultId,
    pub onboarding_id: Option<OnboardingId>,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
}

/// Mirrors structure of DbUserTimelineEvent but includes resources hydrated from the DB rather than identifiers
pub enum SaturatedTimelineEvent {
    DataCollected(newtypes::DataCollectedInfo),
    BiometricRegistered((WebauthnCredential, InsightEvent)),
    OnboardingDecision(SaturatedOnboardingDecisionInfo),
    DocumentUploaded(newtypes::DocumentUploadedInfo), // TODO
}

pub struct UserTimelineInfo(pub UserTimeline, pub SaturatedTimelineEvent);

impl UserTimeline {
    pub fn create<T>(
        conn: &mut PgConnection,
        event: T,
        user_vault_id: UserVaultId,
        onboarding_id: Option<OnboardingId>,
    ) -> DbResult<()>
    where
        T: Into<DbUserTimelineEvent>,
    {
        let new = NewUserTimeline {
            event: event.into(),
            onboarding_id,
            user_vault_id,
            timestamp: chrono::Utc::now(),
        };
        diesel::insert_into(user_timeline::table)
            .values(new)
            .execute(conn)?;
        Ok(())
    }

    pub fn list(
        conn: &mut PgConnection,
        footprint_user_id: FootprintUserId,
        tenant_id: TenantId,
        is_live: bool,
    ) -> DbResult<Vec<UserTimelineInfo>> {
        // Fetch all events for user vault to which this footprint_user_id belongs, and events
        // that belong to an onboarding for this tenant
        use crate::schema::{onboarding, scoped_user};
        let su: ScopedUser = scoped_user::table
            .filter(scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .get_result(conn)?;
        let onboarding_ids = onboarding::table
            .filter(onboarding::scoped_user_id.eq(su.id))
            .select(onboarding::id.nullable());
        let results: Vec<Self> = user_timeline::table
            .filter(user_timeline::user_vault_id.eq(su.user_vault_id))
            .filter(
                user_timeline::onboarding_id
                    .is_null()
                    .or(user_timeline::onboarding_id.eq_any(onboarding_ids)),
            )
            .order_by(user_timeline::timestamp.asc())
            .get_results(conn)?;

        // Batch fetch any related metadata from the source-of-truth business objects
        let decision_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::OnboardingDecision(ref e) => Some(&e.id),
            _ => None,
        });
        let credential_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::BiometricRegistered(ref e) => Some(&e.id),
            _ => None,
        });

        let mut decisions: HashMap<_, _> = OnboardingDecision::get_bulk(conn, decision_ids.collect())?
            .into_iter()
            .map(|d| (d.0.id.clone(), d))
            .collect();

        let mut credentials: HashMap<_, _> = WebauthnCredential::get_bulk(conn, credential_ids.collect())?
            .into_iter()
            .map(|c| (c.0.id.clone(), c))
            .collect();

        // Join the UserTimeline events with the saturated info we fetched from different tables
        let results = results
            .into_iter()
            .map(|ut| {
                let saturated_event = match ut.event {
                    DbUserTimelineEvent::DataCollected(ref e) => {
                        SaturatedTimelineEvent::DataCollected(e.clone())
                    }
                    DbUserTimelineEvent::OnboardingDecision(ref e) => {
                        SaturatedTimelineEvent::OnboardingDecision(
                            decisions.remove(&e.id).ok_or(DbError::RelatedObjectNotFound)?,
                        )
                    }
                    DbUserTimelineEvent::BiometricRegistered(ref e) => {
                        SaturatedTimelineEvent::BiometricRegistered(
                            credentials.remove(&e.id).ok_or(DbError::RelatedObjectNotFound)?,
                        )
                    }
                    DbUserTimelineEvent::DocumentUploaded(ref e) => {
                        SaturatedTimelineEvent::DocumentUploaded(e.clone())
                    }
                };
                Ok(UserTimelineInfo(ut, saturated_event))
            })
            .collect::<DbResult<Vec<_>>>()?;

        Ok(results)
    }
}
