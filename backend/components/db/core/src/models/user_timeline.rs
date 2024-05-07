use std::collections::HashMap;

use crate::{
    actor::{saturate_actors, SaturatedActor},
    models::{annotation::Annotation, liveness_event::LivenessEvent, scoped_vault::ScopedVault},
    DbError, DbResult, PgConn, TxnPgConn,
};
use chrono::{DateTime, Utc};
use db_schema::schema::user_timeline;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{
    AuthMethodUpdatedInfo, CollectedDataOption, DataIdentifier, DataLifetimeSeqno, DbUserTimelineEvent,
    DbUserTimelineEventKind, ExternalIntegrationInfo, ScopedVaultId, UserTimelineId, VaultId,
};

use super::{
    annotation::AnnotationInfo,
    auth_event::AuthEvent,
    data_lifetime::DataLifetime,
    document::Document,
    document_request::DocumentRequest,
    insight_event::InsightEvent,
    ob_configuration::ObConfiguration,
    onboarding_decision::{OnboardingDecision, SaturatedOnboardingDecisionInfo},
    scoped_vault::ScopedVaultIdentifier,
    scoped_vault_label::ScopedVaultLabel,
    watchlist_check::WatchlistCheck,
    workflow::Workflow,
    workflow_request::WorkflowRequest,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = user_timeline)]
pub struct UserTimeline {
    pub id: UserTimelineId,
    pub scoped_vault_id: ScopedVaultId,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub vault_id: VaultId,
    pub event_kind: DbUserTimelineEventKind,
    /// True if the event was created manually via a backfill script. This is never set to true by
    /// application code
    pub is_backfilled: bool,
    /// The seqno at which this user timeline event was created
    pub seqno: DataLifetimeSeqno,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = user_timeline)]
pub struct NewUserTimeline {
    pub vault_id: VaultId,
    pub scoped_vault_id: ScopedVaultId,
    pub event: DbUserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub event_kind: DbUserTimelineEventKind,
    pub seqno: DataLifetimeSeqno,
}

pub struct SaturatedDataCollectedEvent {
    pub attributes: Vec<CollectedDataOption>,
    pub targets: Vec<DataIdentifier>,
    pub actor: Option<SaturatedActor>,
    pub is_prefill: bool,
}

#[allow(clippy::large_enum_variant)]
/// Mirrors structure of DbUserTimelineEvent but includes resources hydrated from the DB rather than identifiers
pub enum SaturatedTimelineEvent {
    DataCollected(SaturatedDataCollectedEvent),
    OnboardingDecision(SaturatedOnboardingDecisionInfo, Option<AnnotationInfo>),
    DocumentUploaded((Document, DocumentRequest)),
    Liveness(LivenessEvent, InsightEvent),
    Annotation(AnnotationInfo),
    WatchlistCheck(WatchlistCheck),
    VaultCreated(SaturatedActor),
    WorkflowTriggered((Option<Workflow>, SaturatedActor, Option<WorkflowRequest>)),
    WorkflowStarted((Workflow, ObConfiguration)),
    AuthMethodUpdated((AuthMethodUpdatedInfo, AuthEvent, InsightEvent)),
    LabelAdded(ScopedVaultLabel),
    ExternalIntegrationCalled(ExternalIntegrationInfo),
    StepUp(Vec<DocumentRequest>),
}

pub type IsFromOtherTenant = bool;
pub struct UserTimelineInfo(pub UserTimeline, pub SaturatedTimelineEvent);

impl UserTimeline {
    #[tracing::instrument("UserTimeline::create", skip_all)]
    pub fn create<T>(
        conn: &mut TxnPgConn,
        event: T,
        vault_id: VaultId,
        scoped_vault_id: ScopedVaultId,
    ) -> DbResult<()>
    where
        T: Into<DbUserTimelineEvent>,
    {
        let event = event.into();
        let event_kind = (&event).into();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new = NewUserTimeline {
            event,
            scoped_vault_id,
            vault_id,
            timestamp: chrono::Utc::now(),
            event_kind,
            seqno,
        };
        diesel::insert_into(user_timeline::table)
            .values(new)
            .execute(conn.conn())?;
        Ok(())
    }

    #[tracing::instrument("UserTimeline::list", skip_all)]
    pub fn list<'a, T>(
        conn: &mut PgConn,
        scoped_vault_id: T,
        kinds: Vec<DbUserTimelineEventKind>,
    ) -> DbResult<Vec<UserTimelineInfo>>
    where
        T: Into<ScopedVaultIdentifier<'a>>,
    {
        let su = ScopedVault::get(conn, scoped_vault_id)?;
        // Fetch all events for user vault to which this footprint_user_id belongs, and events
        // that belong to an onboarding for this tenant
        let mut query = user_timeline::table
            .filter(user_timeline::scoped_vault_id.eq(&su.id))
            .into_boxed();

        if !kinds.is_empty() {
            query = query.filter(user_timeline::event_kind.eq_any(kinds));
        }

        let results: Vec<Self> = query
            .order_by(user_timeline::timestamp.desc())
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
            DbUserTimelineEvent::DataCollected(ref e) => e.actor.clone(),
            _ => None,
        });
        let ob_config_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::WorkflowStarted(ref e) => Some(e.pb_id.clone()),
            _ => None,
        });
        let workflow_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::WorkflowTriggered(ref e) => e.workflow_id.clone(),
            DbUserTimelineEvent::WorkflowStarted(ref e) => Some(e.workflow_id.clone()),
            _ => None,
        });
        let auth_event_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::AuthMethodUpdated(ref e) => Some(e.auth_event_id.clone()),
            _ => None,
        });
        let wfr_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::WorkflowTriggered(ref e) => e.workflow_request_id.clone(),
            _ => None,
        });
        let label_ids = results.iter().flat_map(|ut| match ut.event {
            DbUserTimelineEvent::LabelAdded(ref e) => Some(e.id.clone()),
            _ => None,
        });
        let doc_req_ids = results
            .iter()
            .flat_map(|ut| match ut.event {
                DbUserTimelineEvent::StepUp(ref e) => Some(e.document_request_ids.clone()),
                _ => None,
            })
            .flatten();

        let decisions = OnboardingDecision::get_bulk(conn, decision_ids.collect())?;
        let annotations = Annotation::get_bulk(conn, annotation_ids.collect())?;
        let liveness_events = LivenessEvent::get_bulk(conn, liveness_event_ids.collect())?;
        let document_ids_and_requests = Document::get_bulk_with_requests(conn, document_ids.collect())?;
        let actors: HashMap<_, _> = saturate_actors(conn, db_actors.collect())?.into_iter().collect();
        let watchlist_checks = WatchlistCheck::get_bulk(conn, watchlist_check_ids.collect())?;
        let ob_configs = ObConfiguration::get_bulk(conn, ob_config_ids.collect())?;
        let workflows = Workflow::get_bulk(conn, workflow_ids.collect())?;
        let wfrs = WorkflowRequest::get_bulk(conn, wfr_ids.collect())?;
        let auth_events = AuthEvent::get_bulk_for_timeline(conn, auth_event_ids.collect())?;
        let labels = ScopedVaultLabel::get_bulk(conn, label_ids.collect())?;
        let doc_reqs = DocumentRequest::get_bulk(conn, doc_req_ids.collect())?;

        // Join the UserTimeline events with the saturated info we fetched from different tables
        let results = results
            .into_iter()
            .map(|ut| {
                let saturated_event = match ut.event {
                    DbUserTimelineEvent::DataCollected(ref e) => {
                        let actor = e
                            .actor
                            .as_ref()
                            .map(|a| actors.get(a).cloned().ok_or(DbError::RelatedObjectNotFound))
                            .transpose()?;
                        let event = SaturatedDataCollectedEvent {
                            attributes: e.attributes.clone(),
                            targets: e.targets.clone(),
                            actor,
                            is_prefill: e.is_prefill,
                        };
                        SaturatedTimelineEvent::DataCollected(event)
                    }
                    DbUserTimelineEvent::OnboardingDecision(ref e) => {
                        let (obd, ob_config, actor, mr) = decisions
                            .get(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();

                        let decision: SaturatedOnboardingDecisionInfo = (obd, ob_config, actor, mr);

                        SaturatedTimelineEvent::OnboardingDecision(
                            decision,
                            e.annotation_id
                                .as_ref()
                                .map(|a_id| annotations.get(a_id).ok_or(DbError::RelatedObjectNotFound))
                                .transpose()?
                                .cloned(),
                        )
                    }
                    DbUserTimelineEvent::DocumentUploaded(ref e) => SaturatedTimelineEvent::DocumentUploaded(
                        document_ids_and_requests
                            .get(&e.id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone(),
                    ),
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
                        let workflow = e
                            .workflow_id
                            .as_ref()
                            .and_then(|wf_id| workflows.get(wf_id).cloned());
                        let actor = actors
                            .get(&e.actor)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        let wfr = e
                            .workflow_request_id
                            .as_ref()
                            .and_then(|id| wfrs.get(id).cloned());
                        SaturatedTimelineEvent::WorkflowTriggered((workflow, actor, wfr))
                    }
                    DbUserTimelineEvent::WorkflowStarted(ref e) => {
                        let workflow = workflows
                            .get(&e.workflow_id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        let ob_config = ob_configs
                            .get(&e.pb_id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        SaturatedTimelineEvent::WorkflowStarted((workflow, ob_config))
                    }
                    DbUserTimelineEvent::AuthMethodUpdated(ref e) => {
                        let (auth_event, insight_event) = auth_events
                            .get(&e.auth_event_id)
                            .ok_or(DbError::RelatedObjectNotFound)?
                            .clone();
                        SaturatedTimelineEvent::AuthMethodUpdated((e.clone(), auth_event, insight_event))
                    }
                    DbUserTimelineEvent::LabelAdded(ref e) => {
                        let label = labels.get(&e.id).ok_or(DbError::RelatedObjectNotFound)?.clone();
                        SaturatedTimelineEvent::LabelAdded(label)
                    }
                    DbUserTimelineEvent::ExternalIntegrationCalled(ref e) => {
                        SaturatedTimelineEvent::ExternalIntegrationCalled(e.clone())
                    }
                    DbUserTimelineEvent::StepUp(ref e) => {
                        let drs = e
                            .document_request_ids
                            .iter()
                            .map(|dr_id| doc_reqs.get(dr_id).ok_or(DbError::RelatedObjectNotFound))
                            .collect::<Result<Vec<_>, _>>()?
                            .into_iter()
                            .cloned()
                            .collect();
                        SaturatedTimelineEvent::StepUp(drs)
                    }
                };
                Ok(UserTimelineInfo(ut, saturated_event))
            })
            .collect::<DbResult<Vec<_>>>()?;

        Ok(results)
    }

    #[tracing::instrument("UserTimeline::get_by_event_data_id", skip_all)]
    pub fn get_by_event_data_id(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        id: String,
    ) -> DbResult<Option<Self>> {
        let res = user_timeline::table
            .filter(user_timeline::scoped_vault_id.eq(sv_id))
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
    use crate::{actor::SaturatedActor, tests::prelude::*};
    // TODO modernize utils
    use crate::{
        models::tenant_role::{ImmutableRoleKind, TenantRole},
        test::{test_annotation, test_tenant_api_key, test_tenant_user},
        tests::{fixtures, prelude::TestPgConn},
    };
    use macros::db_test;
    use newtypes::TenantRoleKind;

    #[db_test]
    fn test_list(conn: &mut TestPgConn) {
        let is_live = true;
        let vault = fixtures::vault::create_person(conn, true).into_inner();
        let tenant = fixtures::tenant::create(conn);
        let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
        let scoped_vault = fixtures::scoped_vault::create(conn, &vault.id, &ob_config.id);
        let role_kind = TenantRoleKind::ApiKey { is_live };
        let role =
            TenantRole::get_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly, role_kind).unwrap();

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
            UserTimeline::list(conn, (&scoped_vault.fp_id, &tenant.id, is_live), vec![]).unwrap();

        assert_eq!(3, user_timeline_infos.len());

        let ut1 = match &user_timeline_infos[0].1 {
            SaturatedTimelineEvent::Annotation(a) => a,
            _ => unreachable!(),
        };
        assert_eq!(ut1.0.id, annotation3.id);
        match ut1.1 {
            SaturatedActor::TenantApiKey(ref tenant_api_key2) => {
                assert_eq!(tenant_api_key.id, tenant_api_key2.id)
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
        assert_eq!(ut3.0.id, annotation1.id);
        match ut3.1 {
            SaturatedActor::TenantUser(ref tenant_user) => {
                assert_eq!(tenant_user.id, tenant_user1.id)
            }
            _ => unreachable!(),
        };
    }
}
