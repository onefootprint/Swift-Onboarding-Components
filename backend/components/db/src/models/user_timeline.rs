use crate::models::annotation::Annotation;
use crate::models::liveness_event::LivenessEvent;
use crate::models::scoped_user::ScopedUser;
use crate::DbError;
use crate::PgConn;
use crate::{schema::user_timeline, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::VendorAPI;
use newtypes::{DbUserTimelineEvent, FootprintUserId, ScopedUserId, TenantId, UserTimelineId, UserVaultId};
use serde::{Deserialize, Serialize};

use super::annotation::AnnotationInfo;
use super::document_request::DocumentRequest;
use super::identity_document::IdentityDocument;
use super::insight_event::InsightEvent;
use super::onboarding_decision::{OnboardingDecision, SaturatedOnboardingDecisionInfo};
use strum::IntoEnumIterator;
#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_timeline)]
pub struct UserTimeline {
    pub id: UserTimelineId,
    pub scoped_user_id: Option<ScopedUserId>,
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
    pub scoped_user_id: Option<ScopedUserId>,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
}

#[allow(clippy::large_enum_variant)]
/// Mirrors structure of DbUserTimelineEvent but includes resources hydrated from the DB rather than identifiers
pub enum SaturatedTimelineEvent {
    DataCollected(newtypes::DataCollectedInfo),
    OnboardingDecision(SaturatedOnboardingDecisionInfo, Option<AnnotationInfo>),
    DocumentUploaded((IdentityDocument, DocumentRequest)),
    Liveness(LivenessEvent, InsightEvent),
    Annotation(AnnotationInfo),
}

pub struct UserTimelineInfo(pub UserTimeline, pub SaturatedTimelineEvent);

impl UserTimeline {
    #[tracing::instrument(skip_all)]
    pub fn create<T>(
        conn: &mut PgConn,
        event: T,
        user_vault_id: UserVaultId,
        scoped_user_id: Option<ScopedUserId>,
    ) -> DbResult<()>
    where
        T: Into<DbUserTimelineEvent>,
    {
        let new = NewUserTimeline {
            event: event.into(),
            scoped_user_id,
            user_vault_id,
            timestamp: chrono::Utc::now(),
        };
        diesel::insert_into(user_timeline::table)
            .values(new)
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument(skip_all)]
    pub fn list(
        conn: &mut PgConn,
        footprint_user_id: FootprintUserId,
        tenant_id: TenantId,
        tenant_can_view_socure_risk_signal: bool,
        is_live: bool,
    ) -> DbResult<Vec<UserTimelineInfo>> {
        // Fetch all events for user vault to which this footprint_user_id belongs, and events
        // that belong to an onboarding for this tenant
        let su = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
        let results: Vec<Self> = user_timeline::table
            .filter(user_timeline::user_vault_id.eq(su.user_vault_id))
            .filter(
                user_timeline::scoped_user_id
                    .is_null()
                    .or(user_timeline::scoped_user_id.eq(su.id)),
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

        let identity_document_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::DocumentUploaded(ref e) => Some(&e.id),
            _ => None,
        });

        let mut decisions = OnboardingDecision::get_bulk(conn, decision_ids.collect())?;
        let mut annotations = Annotation::get_bulk(conn, annotation_ids.collect())?;
        let mut liveness_events = LivenessEvent::get_bulk(conn, liveness_event_ids.collect())?;
        let mut identity_documents_and_requests =
            IdentityDocument::get_bulk_with_requests(conn, identity_document_ids.collect())?;
        let mut vendor_apis_to_include: Vec<VendorAPI> = VendorAPI::iter()
            .filter(|v| !matches!(v, &VendorAPI::SocureIDPlus))
            .collect();

        if tenant_can_view_socure_risk_signal {
            vendor_apis_to_include.push(VendorAPI::SocureIDPlus)
        }

        // Join the UserTimeline events with the saturated info we fetched from different tables
        let results = results
            .into_iter()
            .map(|ut| {
                let saturated_event = match ut.event {
                    DbUserTimelineEvent::DataCollected(ref e) => {
                        SaturatedTimelineEvent::DataCollected(e.clone())
                    }
                    DbUserTimelineEvent::OnboardingDecision(ref e) => {
                        let (obd, ob_config, mut verification_requests, actor) =
                            decisions.remove(&e.id).ok_or(DbError::RelatedObjectNotFound)?;
                        // filter out socure, if applicable
                        verification_requests.retain(|v| vendor_apis_to_include.contains(&v.vendor_api));

                        let decision: SaturatedOnboardingDecisionInfo =
                            (obd, ob_config, verification_requests, actor);

                        SaturatedTimelineEvent::OnboardingDecision(
                            decision,
                            e.annotation_id
                                .as_ref()
                                .map(|a_id| annotations.remove(a_id).ok_or(DbError::RelatedObjectNotFound)) // TODO: annotations.remove here and in a below match is sketch, could replace with .get.clone
                                .transpose()?,
                        )
                    }
                    DbUserTimelineEvent::DocumentUploaded(ref e) => SaturatedTimelineEvent::DocumentUploaded(
                        identity_documents_and_requests
                            .remove(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?,
                    ),
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

#[cfg(test)]
mod tests {
    use newtypes::DbActor;

    use super::*;
    use crate::actor::SaturatedActor;
    use crate::tests::prelude::*;
    // TODO modernize utils
    use crate::test::{test_annotation, test_tenant_api_key, test_tenant_user};
    use crate::tests::fixtures;
    use crate::tests::prelude::TestPgConn;
    use macros::db_test;

    #[db_test]
    fn test_list(conn: &mut TestPgConn) {
        let is_live = true;
        let user_vault = fixtures::user_vault::create(conn).into_inner();
        let tenant = fixtures::tenant::create(conn);
        let ob_config = fixtures::ob_configuration::create(conn, &tenant.id);
        let scoped_user = fixtures::scoped_user::create(conn, &user_vault.id, &ob_config.id);

        let tenant_user1 = test_tenant_user(conn, String::from("tu1@acme.com"), None, None);
        let tenant_user2 = test_tenant_user(conn, String::from("tu2@acme.com"), None, None);

        let annotation1 = test_annotation(
            conn,
            String::from("yo sup"),
            false,
            scoped_user.id.clone(),
            user_vault.id.clone(),
            DbActor::TenantUser {
                id: tenant_user1.id.clone(),
            },
        )
        .0;

        let annotation2 = test_annotation(
            conn,
            String::from("yo sup"),
            false,
            scoped_user.id.clone(),
            user_vault.id.clone(),
            DbActor::TenantUser {
                id: tenant_user2.id.clone(),
            },
        )
        .0;

        let tenant_api_key = test_tenant_api_key(conn, String::from("test key"), tenant.id.clone(), is_live);

        let user_vault_id = user_vault.id;
        let annotation3 = test_annotation(
            conn,
            String::from("yo sup"),
            false,
            scoped_user.id.clone(),
            user_vault_id,
            DbActor::TenantApiKey {
                id: tenant_api_key.id.clone(),
            },
        )
        .0;

        let user_timeline_infos =
            UserTimeline::list(conn, scoped_user.fp_user_id, tenant.id, true, is_live).unwrap();

        assert_eq!(3, user_timeline_infos.len());

        let ut1 = match &user_timeline_infos[0].1 {
            SaturatedTimelineEvent::Annotation(a) => a,
            _ => unreachable!(),
        };
        assert_eq!(ut1.0.id, annotation1.id);
        match ut1.1 {
            SaturatedActor::TenantUser(ref tenant_user) => {
                assert_eq!(tenant_user.id, tenant_user1.id)
            }
            _ => unreachable!(),
        };

        let ut2 = match &user_timeline_infos[1].1 {
            SaturatedTimelineEvent::Annotation(a) => a,
            _ => unreachable!(),
        };
        assert_eq!(ut2.0.id, annotation2.id);
        match ut2.1 {
            SaturatedActor::TenantUser(ref tenant_user) => {
                assert_eq!(tenant_user.id, tenant_user2.id)
            }
            _ => unreachable!(),
        };

        let ut3 = match &user_timeline_infos[2].1 {
            SaturatedTimelineEvent::Annotation(a) => a,
            _ => unreachable!(),
        };
        assert_eq!(ut3.0.id, annotation3.id);
        match ut3.1 {
            SaturatedActor::TenantApiKey(ref tenant_api_key2) => {
                assert_eq!(tenant_api_key.id, tenant_api_key2.id)
            }
            _ => unreachable!(),
        };
    }
}
