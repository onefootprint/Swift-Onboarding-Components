use crate::models::annotation::Annotation;
use crate::models::liveness_event::LivenessEvent;
use crate::models::scoped_user::ScopedUser;
use crate::DbError;
use crate::{schema::user_timeline, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{DbUserTimelineEvent, FootprintUserId, OnboardingId, TenantId, UserTimelineId, UserVaultId};
use serde::{Deserialize, Serialize};

use super::annotation::AnnotationInfo;
use super::insight_event::InsightEvent;
use super::onboarding_decision::{OnboardingDecision, SaturatedOnboardingDecisionInfo};

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

#[allow(clippy::large_enum_variant)]
/// Mirrors structure of DbUserTimelineEvent but includes resources hydrated from the DB rather than identifiers
pub enum SaturatedTimelineEvent {
    DataCollected(newtypes::DataCollectedInfo),
    OnboardingDecision(SaturatedOnboardingDecisionInfo, Option<AnnotationInfo>),
    DocumentUploaded(newtypes::DocumentUploadedInfo), // TODO
    Liveness(LivenessEvent, InsightEvent),
    Annotation(AnnotationInfo),
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
        let annotation_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::OnboardingDecision(ref e) => e.annotation_id.as_ref(),
            DbUserTimelineEvent::Annotation(ref e) => Some(&e.annotation_id),
            _ => None,
        });
        let liveness_event_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::Liveness(ref e) => Some(&e.id),
            _ => None,
        });

        let mut decisions = OnboardingDecision::get_bulk(conn, decision_ids.collect())?;
        let mut annotations = Annotation::get_bulk(conn, annotation_ids.collect())?;
        let mut liveness_events = LivenessEvent::get_bulk(conn, liveness_event_ids.collect())?;

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
                            e.annotation_id
                                .as_ref()
                                .map(|a_id| annotations.remove(a_id).ok_or(DbError::RelatedObjectNotFound))
                                .transpose()?,
                        )
                    }
                    DbUserTimelineEvent::DocumentUploaded(ref e) => {
                        SaturatedTimelineEvent::DocumentUploaded(e.clone())
                    }
                    DbUserTimelineEvent::Liveness(ref e) => {
                        let (liveness, insight) = liveness_events
                            .remove(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?;

                        SaturatedTimelineEvent::Liveness(liveness, insight)
                    }
                    DbUserTimelineEvent::Annotation(ref e) => {
                        let annotation = annotations
                            .remove(&e.annotation_id)
                            .ok_or(DbError::RelatedObjectNotFound)?;
                        SaturatedTimelineEvent::Annotation(annotation)
                    }
                };
                Ok(UserTimelineInfo(ut, saturated_event))
            })
            .collect::<DbResult<Vec<_>>>()?;

        Ok(results)
    }
}
