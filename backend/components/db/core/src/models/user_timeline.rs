use std::collections::HashMap;

use crate::actor::saturate_actors;
use crate::actor::SaturatedActor;
use crate::models::annotation::Annotation;
use crate::models::liveness_event::LivenessEvent;
use crate::models::scoped_vault::ScopedVault;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::user_timeline;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::DbUserTimelineEventKind;
use newtypes::DocumentDataId;
use newtypes::VendorAPI;
use newtypes::{DbUserTimelineEvent, ScopedVaultId, UserTimelineId, VaultId};
use serde::{Deserialize, Serialize};

use super::annotation::AnnotationInfo;
use super::document_data::DocumentData;
use super::document_request::DocumentRequest;
use super::identity_document::IdentityDocument;
use super::insight_event::InsightEvent;
use super::onboarding_decision::{OnboardingDecision, SaturatedOnboardingDecisionInfo};
use super::scoped_vault::ScopedVaultIdentifier;
use super::watchlist_check::WatchlistCheck;
use super::workflow::Workflow;
use strum::IntoEnumIterator;
#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_timeline)]
pub struct UserTimeline {
    pub id: UserTimelineId,
    pub scoped_vault_id: ScopedVaultId,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub vault_id: VaultId,
    /// Designates whether the UserTimeline event can be seen by tenants other than the one that created it
    pub is_portable: bool,
    pub event_kind: DbUserTimelineEventKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_timeline)]
pub struct NewUserTimeline {
    pub vault_id: VaultId,
    pub scoped_vault_id: ScopedVaultId,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub is_portable: bool,
    pub event_kind: DbUserTimelineEventKind,
}

#[allow(clippy::large_enum_variant)]
/// Mirrors structure of DbUserTimelineEvent but includes resources hydrated from the DB rather than identifiers
pub enum SaturatedTimelineEvent {
    DataCollected(newtypes::DataCollectedInfo),
    OnboardingDecision(SaturatedOnboardingDecisionInfo, Option<AnnotationInfo>),
    IdentityDocumentUploaded((IdentityDocument, DocumentRequest)),
    Liveness(LivenessEvent, InsightEvent),
    Annotation(AnnotationInfo),
    DocumentUploaded(DocumentData),
    WatchlistCheck(WatchlistCheck),
    VaultCreated(SaturatedActor),
    WorkflowTriggered((Workflow, SaturatedActor)),
}

pub type IsFromOtherTenant = bool;
pub struct UserTimelineInfo(
    pub UserTimeline,
    pub IsFromOtherTenant,
    pub SaturatedTimelineEvent,
);

impl UserTimeline {
    #[tracing::instrument("UserTimeline::create", skip_all)]
    pub fn create<T>(
        conn: &mut PgConn,
        event: T,
        vault_id: VaultId,
        scoped_vault_id: ScopedVaultId,
    ) -> DbResult<()>
    where
        T: Into<DbUserTimelineEvent>,
    {
        let event = event.into();
        let event_kind = (&event).into();
        let new = NewUserTimeline {
            event,
            scoped_vault_id,
            vault_id,
            timestamp: chrono::Utc::now(),
            is_portable: false,
            event_kind,
        };
        diesel::insert_into(user_timeline::table)
            .values(new)
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("UserTimeline::bulk_portablize", skip_all)]
    pub fn bulk_portablize(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: DbUserTimelineEventKind,
    ) -> DbResult<()> {
        diesel::update(user_timeline::table)
            .filter(user_timeline::scoped_vault_id.eq(scoped_vault_id))
            .filter(user_timeline::event_kind.eq(kind))
            .set(user_timeline::is_portable.eq(true))
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("UserTimeline::list", skip_all)]
    pub fn list<'a, T>(
        conn: &mut PgConn,
        scoped_vault_id: T,
        tenant_can_view_socure_risk_signal: bool,
        kinds: Vec<DbUserTimelineEventKind>,
    ) -> DbResult<Vec<UserTimelineInfo>>
    where
        T: Into<ScopedVaultIdentifier<'a>>,
    {
        let su = ScopedVault::get(conn, scoped_vault_id)?;
        // Fetch all events for user vault to which this footprint_user_id belongs, and events
        // that belong to an onboarding for this tenant
        let mut query = user_timeline::table
            .filter(user_timeline::vault_id.eq(&su.vault_id))
            .filter(
                user_timeline::scoped_vault_id
                    .is_null()
                    .or(user_timeline::scoped_vault_id.eq(&su.id))
                    .or(user_timeline::is_portable),
            )
            .into_boxed();

        if !kinds.is_empty() {
            query = query.filter(user_timeline::event_kind.eq_any(kinds));
        }

        let results: Vec<Self> = query.order_by(user_timeline::timestamp.asc()).get_results(conn)?;

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
            DbUserTimelineEvent::IdentityDocumentUploaded(ref e) => Some(&e.id),
            _ => None,
        });
        let document_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::DocumentUploaded(ref e) => Some(&e.id),
            _ => None,
        });
        let watchlist_check_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::WatchlistCheck(ref e) => Some(&e.id),
            _ => None,
        });
        let db_actors = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::VaultCreated(ref e) => Some(e.actor.clone()),
            DbUserTimelineEvent::WorkflowTriggered(ref e) => Some(e.actor.clone()),
            _ => None,
        });
        let workflow_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::WorkflowTriggered(ref e) => Some(e.workflow_id.clone()),
            _ => None,
        });

        let decisions = OnboardingDecision::get_bulk(conn, decision_ids.collect())?;
        let annotations = Annotation::get_bulk(conn, annotation_ids.collect())?;
        let liveness_events = LivenessEvent::get_bulk(conn, liveness_event_ids.collect())?;
        let identity_documents_and_requests =
            IdentityDocument::get_bulk_with_requests(conn, identity_document_ids.collect())?;
        let vendor_apis_to_include = VendorAPI::iter()
            .filter(|v| (!matches!(v, &VendorAPI::SocureIDPlus)) || tenant_can_view_socure_risk_signal)
            .collect_vec();
        let documents: HashMap<DocumentDataId, DocumentData> =
            DocumentData::get_bulk(conn, document_ids.collect())?;
        let actors: HashMap<_, _> = saturate_actors(conn, db_actors.collect())?.into_iter().collect();
        let watchlist_checks = WatchlistCheck::get_bulk(conn, watchlist_check_ids.collect())?;
        let workflows = Workflow::get_bulk(conn, workflow_ids.collect())?;

        // Join the UserTimeline events with the saturated info we fetched from different tables
        let results = results
            .into_iter()
            .map(|ut| {
                let saturated_event = match ut.event {
                    DbUserTimelineEvent::DataCollected(ref e) => {
                        SaturatedTimelineEvent::DataCollected(e.clone())
                    }
                    DbUserTimelineEvent::OnboardingDecision(ref e) => {
                        let (obd, ob_config, mut verification_requests, actor, mr) = decisions
                            .get(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        // filter out socure, if applicable
                        verification_requests.retain(|v| vendor_apis_to_include.contains(&v.vendor_api));

                        let decision: SaturatedOnboardingDecisionInfo =
                            (obd, ob_config, verification_requests, actor, mr);

                        SaturatedTimelineEvent::OnboardingDecision(
                            decision,
                            e.annotation_id
                                .as_ref()
                                .map(|a_id| annotations.get(a_id).ok_or(DbError::RelatedObjectNotFound))
                                .transpose()?
                                .cloned(),
                        )
                    }
                    DbUserTimelineEvent::IdentityDocumentUploaded(ref e) => {
                        SaturatedTimelineEvent::IdentityDocumentUploaded(
                            identity_documents_and_requests
                                .get(&e.id)
                                .ok_or(DbError::RelatedObjectNotFound)?
                                .clone(),
                        )
                    }
                    DbUserTimelineEvent::Liveness(ref e) => {
                        let (liveness, insight) = liveness_events
                            .get(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();

                        SaturatedTimelineEvent::Liveness(liveness, insight)
                    }
                    DbUserTimelineEvent::Annotation(ref e) => {
                        let annotation = annotations
                            .get(&e.annotation_id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        SaturatedTimelineEvent::Annotation(annotation)
                    }
                    DbUserTimelineEvent::DocumentUploaded(ref e) => SaturatedTimelineEvent::DocumentUploaded(
                        documents
                            .get(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone(),
                    ),
                    DbUserTimelineEvent::WatchlistCheck(ref e) => SaturatedTimelineEvent::WatchlistCheck(
                        watchlist_checks
                            .get(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone(),
                    ),
                    DbUserTimelineEvent::VaultCreated(ref e) => SaturatedTimelineEvent::VaultCreated(
                        actors
                            .get(&e.actor)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone(),
                    ),
                    DbUserTimelineEvent::WorkflowTriggered(ref e) => {
                        let workflow = workflows
                            .get(&e.workflow_id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        let actor = actors
                            .get(&e.actor)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        SaturatedTimelineEvent::WorkflowTriggered((workflow, actor))
                    }
                };
                // This will actually display that events from different ob configs at the same
                // tenant belong to a different tenant. Probably okay.
                let is_from_other_tenant = ut.scoped_vault_id != su.id;
                Ok(UserTimelineInfo(ut, is_from_other_tenant, saturated_event))
            })
            .collect::<DbResult<Vec<_>>>()?;

        Ok(results)
    }

    #[tracing::instrument("UserTimeline::get_by_event_data_id", skip_all)]
    pub fn get_by_event_data_id(conn: &mut PgConn, id: String) -> DbResult<Option<Self>> {
        let res = user_timeline::table
            .filter(
                user_timeline::event
                    .retrieve_by_path_as_text(vec!["data", "id"])
                    .eq(id),
            )
            .get_result(conn)
            .optional()?;

        Ok(res)
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
        let vault = fixtures::vault::create_person(conn, true).into_inner();
        let tenant = fixtures::tenant::create(conn);
        let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
        let scoped_vault = fixtures::scoped_vault::create(conn, &vault.id, &ob_config.id);
        let role = fixtures::tenant_role::create_admin(conn, &tenant.id);

        let tenant_user1 = test_tenant_user(conn, String::from("tu1@acme.com"), None, None);
        let tenant_user2 = test_tenant_user(conn, String::from("tu2@acme.com"), None, None);

        let annotation1 = test_annotation(
            conn,
            String::from("yo sup"),
            false,
            scoped_vault.id.clone(),
            vault.id.clone(),
            DbActor::TenantUser {
                id: tenant_user1.id.clone(),
            },
        )
        .0;

        let annotation2 = test_annotation(
            conn,
            String::from("yo sup"),
            false,
            scoped_vault.id.clone(),
            vault.id.clone(),
            DbActor::TenantUser {
                id: tenant_user2.id.clone(),
            },
        )
        .0;

        let tenant_api_key = test_tenant_api_key(
            conn,
            String::from("test key"),
            tenant.id.clone(),
            is_live,
            role.id,
        );

        let user_vault_id = vault.id;
        let annotation3 = test_annotation(
            conn,
            String::from("yo sup"),
            false,
            scoped_vault.id.clone(),
            user_vault_id,
            DbActor::TenantApiKey {
                id: tenant_api_key.id.clone(),
            },
        )
        .0;

        let user_timeline_infos =
            UserTimeline::list(conn, (&scoped_vault.fp_id, &tenant.id, is_live), true, vec![]).unwrap();

        assert_eq!(3, user_timeline_infos.len());

        let ut1 = match &user_timeline_infos[0].2 {
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

        let ut2 = match &user_timeline_infos[1].2 {
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

        let ut3 = match &user_timeline_infos[2].2 {
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
