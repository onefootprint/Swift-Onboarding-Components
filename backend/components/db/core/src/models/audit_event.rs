use super::list::List;
use super::list_entry::ListEntry;
use super::list_entry_creation::ListEntryCreation;
use super::ob_configuration::ObConfiguration;
use super::scoped_vault::ScopedVault;
use crate::actor::saturate_actors_nullable;
use crate::actor::HasActor;
use crate::actor::SaturatedActor;
use crate::models::document_data::DocumentData;
use crate::models::insight_event::CreateInsightEvent;
use crate::models::insight_event::InsightEvent;
use crate::models::onboarding_decision::OnboardingDecision;
use crate::models::onboarding_decision::SaturatedOnboardingDecisionInfo;
use crate::models::tenant::Tenant;
use crate::models::tenant_api_key::TenantApiKey;
use crate::models::tenant_role::TenantRole;
use crate::models::tenant_user::TenantUser;
use crate::ComputeCursor;
use crate::CursorPaginatedResult;
use crate::CursorPagination;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use api_errors::ServerErr;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::audit_event;
use db_schema::schema::document_data;
use db_schema::schema::insight_event;
use db_schema::schema::list;
use db_schema::schema::list_entry;
use db_schema::schema::list_entry_creation;
use db_schema::schema::ob_configuration;
use db_schema::schema::scoped_vault;
use db_schema::schema::tenant;
use db_schema::schema::tenant_api_key;
use db_schema::schema::tenant_role;
use db_schema::schema::tenant_user;
use diesel::dsl::count_distinct;
use diesel::dsl::sql;
use diesel::prelude::*;
use diesel::sql_types::Array;
use diesel::sql_types::Bool;
use diesel::sql_types::Text;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::AuditEventMetadata;
use newtypes::AuditEventName;
use newtypes::CommonAuditEventDetail;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use newtypes::DocumentDataId;
use newtypes::InsightEventId;
use newtypes::ListEntryCreationId;
use newtypes::ListEntryId;
use newtypes::ListId;
use newtypes::ObConfigurationId;
use newtypes::OnboardingDecisionId;
use newtypes::ScopedVaultId;
use newtypes::TenantApiKeyId;
use newtypes::TenantId;
use newtypes::TenantRoleId;
use newtypes::TenantUserId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = audit_event)]
pub struct AuditEvent {
    pub id: AuditEventId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub name: AuditEventName,
    pub principal_actor: Option<DbActor>,
    pub insight_event_id: Option<InsightEventId>,

    pub metadata: AuditEventMetadata,

    pub scoped_vault_id: Option<ScopedVaultId>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub document_data_id: Option<DocumentDataId>,
    pub tenant_api_key_id: Option<TenantApiKeyId>,
    pub tenant_user_id: Option<TenantUserId>,
    pub tenant_role_id: Option<TenantRoleId>,
    /// whether to filter by live or sandbox - NULL means this isn't relevant / doesn't make sense
    /// (for example, we don't disambiguate live vs. sandbox org members)
    /// In GET requests, we'll return results for whichever is specified (live or sandbox)
    /// AND all results where is_live is NULL
    pub is_live: Option<bool>,
    pub list_entry_creation_id: Option<ListEntryCreationId>,
    pub list_entry_id: Option<ListEntryId>,
    pub list_id: Option<ListId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = audit_event)]
struct NewAuditEventRow {
    id: AuditEventId,
    timestamp: DateTime<Utc>,
    tenant_id: TenantId,
    name: AuditEventName,
    principal_actor: DbActor,
    insight_event_id: InsightEventId,

    metadata: AuditEventMetadata,

    scoped_vault_id: Option<ScopedVaultId>,
    ob_configuration_id: Option<ObConfigurationId>,
    document_data_id: Option<DocumentDataId>,
    tenant_api_key_id: Option<TenantApiKeyId>,
    tenant_user_id: Option<TenantUserId>,
    tenant_role_id: Option<TenantRoleId>,
    is_live: Option<bool>,
    list_entry_creation_id: Option<ListEntryCreationId>,
    list_entry_id: Option<ListEntryId>,
    list_id: Option<ListId>,
}

#[derive(Debug, Clone)]
pub struct AuditEventRowDetailFields {
    pub metadata: AuditEventMetadata,

    pub scoped_vault_id: Option<ScopedVaultId>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub document_data_id: Option<DocumentDataId>,
    pub tenant_api_key_id: Option<TenantApiKeyId>,
    pub tenant_user_id: Option<TenantUserId>,
    pub tenant_role_id: Option<TenantRoleId>,
}

#[derive(Debug, Clone)]
pub struct NewAuditEvent {
    pub tenant_id: TenantId,
    pub principal_actor: DbActor,
    pub insight_event_id: InsightEventId,
    pub detail: AuditEventDetail,
}

#[derive(Debug, Default)]
pub struct FilterQueryParams {
    pub tenant_id: TenantId,
    pub search: Option<String>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub names: Vec<AuditEventName>,
    pub targets: Vec<DataIdentifier>,
    pub list_id: Option<ListId>,
    pub is_live: Option<bool>,
}

#[derive(Debug)]
pub struct JoinedAuditEvent {
    pub audit_event: AuditEvent,
    pub tenant: Tenant,
    pub saturated_actor: Option<SaturatedActor>,
    pub insight_event: Option<InsightEvent>,

    pub scoped_vault: Option<ScopedVault>,
    pub ob_configuration: Option<ObConfiguration>,
    pub document_data: Option<DocumentData>,
    pub tenant_api_key: Option<TenantApiKey>,
    pub tenant_user: Option<TenantUser>,
    pub tenant_role: Option<TenantRole>,
    pub list_entry_creation: Option<ListEntryCreation>,
    pub list_entry: Option<ListEntry>,
    pub list: Option<List>,
}

type DieselJoinedAuditEvent = (
    AuditEvent,
    Tenant,
    Option<InsightEvent>,
    Option<ScopedVault>,
    Option<ObConfiguration>,
    Option<DocumentData>,
    Option<TenantApiKey>,
    Option<TenantUser>,
    Option<TenantRole>,
    Option<ListEntryCreation>,
    Option<ListEntry>,
    Option<List>,
);

impl HasActor for DieselJoinedAuditEvent {
    fn actor(&self) -> Option<DbActor> {
        self.0.principal_actor.clone()
    }
}

impl AuditEvent {
    #[tracing::instrument("AuditEvent::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, new: NewAuditEvent) -> FpResult<AuditEventId> {
        let ids = AuditEvent::bulk_create(conn, vec![new])?;
        (ids.into_iter().next()).ok_or(ServerErr("expected one AuditEventId"))
    }

    #[tracing::instrument("AuditEvent::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, events: Vec<NewAuditEvent>) -> FpResult<Vec<AuditEventId>> {
        let ids = events.iter().map(|_| AuditEventId::generate()).collect_vec();
        let rows = events
            .into_iter()
            .zip_eq(ids.clone().into_iter())
            .map(|(event, id)| {
                let NewAuditEvent {
                    tenant_id,
                    principal_actor,
                    insight_event_id,
                    detail,
                } = event;
                let CommonAuditEventDetail { metadata, args } = detail.into();
                NewAuditEventRow {
                    id,
                    timestamp: Utc::now(),
                    tenant_id,
                    name: AuditEventName::from(&metadata),
                    principal_actor,
                    insight_event_id,
                    metadata,
                    scoped_vault_id: args.scoped_vault_id,
                    ob_configuration_id: args.ob_configuration_id,
                    document_data_id: args.document_data_id,
                    tenant_api_key_id: args.tenant_api_key_id,
                    tenant_user_id: args.tenant_user_id,
                    tenant_role_id: args.tenant_role_id,
                    is_live: args.is_live,
                    list_entry_creation_id: args.list_entry_creation_id,
                    list_entry_id: args.list_entry_id,
                    list_id: args.list_id,
                }
            })
            .collect_vec();

        diesel::insert_into(audit_event::table)
            .values(rows)
            .execute(conn.conn())?;

        Ok(ids)
    }

    #[tracing::instrument("AuditEvent::filter", skip_all)]
    pub fn filter(
        conn: &mut PgConn,
        params: FilterQueryParams,
        pagination: CursorPagination<AuditEventCursor>,
    ) -> FpResult<(
        CursorPaginatedResult<JoinedAuditEvent, AuditEventCursor>,
        AuditEventBulkSecondaryData,
    )> {
        let mut results = audit_event::table
            .inner_join(tenant::table)
            .inner_join(insight_event::table)
            .left_join(scoped_vault::table)
            .left_join(ob_configuration::table)
            .left_join(document_data::table)
            .left_join(tenant_api_key::table)
            .left_join(tenant_user::table)
            .left_join(tenant_role::table)
            .left_join(list_entry_creation::table)
            .left_join(list_entry::table)
            .left_join(list::table)
            .order_by(audit_event::timestamp.desc())
            .then_order_by(audit_event::id.desc())
            .filter(audit_event::tenant_id.eq(params.tenant_id))
            .filter(
                audit_event::is_live
                    .eq(params.is_live)
                    .or(audit_event::is_live.is_null()),
            )
            .limit(pagination.limit())
            .into_boxed();

        if let Some((cursor_ts, cursor_id)) = &pagination.cursor {
            // Filter on (row_ts, row_id) <= (cursor_ts, cursor_id)
            results = results.filter(
                audit_event::timestamp.le(cursor_ts).or(audit_event::timestamp
                    .eq(cursor_ts)
                    .and(audit_event::id.le(cursor_id))),
            );
        }

        if let Some(timestamp_lte) = params.timestamp_lte {
            results = results.filter(audit_event::timestamp.le(timestamp_lte))
        }

        if let Some(timestamp_gte) = params.timestamp_gte {
            results = results.filter(audit_event::timestamp.ge(timestamp_gte))
        }

        if !params.names.is_empty() {
            results = results.filter(audit_event::name.eq_any(params.names))
        }

        if !params.targets.is_empty() {
            // Filter where params.targets overlaps with the event's fields.
            results = results.filter(
                sql::<Bool>("metadata -> 'data' -> 'fields' ?| ").bind::<Array<Text>, _>(params.targets),
            )
        }

        if let Some(list_id) = params.list_id {
            results = results.filter(list::id.eq(list_id))
        }

        if let Some(search) = params.search.as_ref() {
            results = results.filter(scoped_vault::fp_id.eq(search));
        }

        let results = results
            .select((
                AuditEvent::as_select(),
                Tenant::as_select(),
                insight_event::all_columns.nullable(),
                scoped_vault::all_columns.nullable(),
                ob_configuration::all_columns.nullable(),
                document_data::all_columns.nullable(),
                tenant_api_key::all_columns.nullable(),
                tenant_user::all_columns.nullable(),
                tenant_role::all_columns.nullable(),
                list_entry_creation::all_columns.nullable(),
                list_entry::all_columns.nullable(),
                list::all_columns.nullable(),
            ))
            .load(conn)?;
        let saturated_results = saturate_actors_nullable(conn, results)?;

        let events = saturated_results
            .into_iter()
            .map(|(result, saturated_actor)| {
                let (
                    audit_event,
                    tenant,
                    insight_event,
                    scoped_vault,
                    ob_configuration,
                    document_data,
                    tenant_api_key,
                    tenant_user,
                    tenant_role,
                    list_entry_creation,
                    list_entry,
                    list,
                ) = result;
                JoinedAuditEvent {
                    audit_event,
                    tenant,
                    saturated_actor,
                    insight_event,
                    scoped_vault,
                    ob_configuration,
                    document_data,
                    tenant_api_key,
                    tenant_user,
                    tenant_role,
                    list_entry_creation,
                    list_entry,
                    list,
                }
            })
            .collect_vec();

        let secondary_data = AuditEventBulkSecondaryData::load(conn, &events)?;
        let events = pagination.results(events);
        Ok((events, secondary_data))
    }

    #[tracing::instrument("AuditEvent::count_hot_vaults", skip_all)]
    pub fn count_hot_vaults(
        conn: &mut PgConn,
        t_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        purposes: Vec<DecryptionContext>,
    ) -> FpResult<i64> {
        let count = audit_event::table
            .filter(audit_event::name.eq_any(vec![
                AuditEventName::DecryptUserData,
                AuditEventName::UpdateUserData,
                AuditEventName::DeleteUserData,
            ]))
            // Cookie-cutter filters for all billable events
            .filter(audit_event::is_live.eq(true))
            .filter(audit_event::tenant_id.eq(t_id))
            // Filter for audit events made during this billing period
            .filter(audit_event::timestamp.ge(start_date))
            .filter(audit_event::timestamp.lt(end_date))
            .filter(
                sql::<Text>("metadata -> 'data' ->> 'context'").eq_any(purposes)
            )
            .filter(diesel::dsl::exists(
                scoped_vault::table
                    .filter(scoped_vault::id.nullable().eq(audit_event::scoped_vault_id))
                    .filter(scoped_vault::is_billable_for_vault_storage.eq(true))
            ))
            .select(count_distinct(audit_event::scoped_vault_id))
            .get_result(conn)?;
        Ok(count)
    }

    pub fn create_with_insight<T, A>(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        principal_actor: A,
        insight: T,
        detail: AuditEventDetail,
    ) -> FpResult<AuditEventId>
    where
        T: Into<CreateInsightEvent>,
        A: Into<DbActor>,
    {
        let insight_event_id = insight.into().insert_with_conn(conn)?.id;
        let audit_event = NewAuditEvent {
            tenant_id: tenant_id.clone(),
            principal_actor: principal_actor.into(),
            insight_event_id,
            detail,
        };
        let id = Self::create(conn, audit_event)?;
        Ok(id)
    }
}

/// Some audit events have additional foreign keys provided in the metadata.
/// This data is bulk loaded in separate queries for all events in a batch of audit events.
pub struct AuditEventBulkSecondaryData {
    pub tenant_roles: HashMap<TenantRoleId, TenantRole>,
    pub onboarding_decisions: HashMap<OnboardingDecisionId, SaturatedOnboardingDecisionInfo>,
    pub tenants: HashMap<TenantId, Tenant>,
}

impl AuditEventBulkSecondaryData {
    pub fn load(conn: &mut PgConn, joined_events: &[JoinedAuditEvent]) -> FpResult<Self> {
        // Return a vector because sometimes we will need to fetch multiple roles for one event
        let tr_ids = joined_events
            .iter()
            .flat_map(|je| match &je.audit_event.metadata {
                AuditEventMetadata::UpdateOrgMember { old_tenant_role_id } => vec![old_tenant_role_id],
                AuditEventMetadata::DecryptOrgApiKey => je
                    .tenant_api_key
                    .as_ref()
                    .map(|k| vec![&k.role_id])
                    .unwrap_or_default(),
                AuditEventMetadata::UpdateOrgApiKeyRole { old_tenant_role_id } => {
                    let mut ids = vec![old_tenant_role_id];
                    if let Some(api_key) = &je.tenant_api_key {
                        ids.push(&api_key.role_id);
                    }
                    ids
                }
                AuditEventMetadata::CreateOrgApiKey => je
                    .tenant_api_key
                    .as_ref()
                    .map(|k| vec![&k.role_id])
                    .unwrap_or_default(),
                AuditEventMetadata::UpdateOrgApiKeyStatus { .. } => je
                    .tenant_api_key
                    .as_ref()
                    .map(|k| vec![&k.role_id])
                    .unwrap_or_default(),
                _ => vec![],
            });

        let tenant_ids = joined_events
            .iter()
            .flat_map(|je| match &je.audit_event.metadata {
                AuditEventMetadata::CopyPlaybook { target_tenant_id } => vec![target_tenant_id],
                _ => vec![],
            })
            .collect_vec();

        let onboarding_decision_ids = joined_events
            .iter()
            .filter_map(|je| match &je.audit_event.metadata {
                AuditEventMetadata::ManuallyReviewEntity {
                    onboarding_decision_id,
                } => Some(onboarding_decision_id),
                _ => None,
            })
            .collect();


        let tenant_roles = TenantRole::get_bulk(conn, tr_ids.collect())?;
        let tenants = Tenant::get_bulk(conn, tenant_ids)?;
        let onboarding_decisions = OnboardingDecision::get_bulk(conn, onboarding_decision_ids)?;

        Ok(Self {
            tenant_roles,
            tenants,
            onboarding_decisions,
        })
    }
}

pub type AuditEventCursor = (DateTime<Utc>, AuditEventId);

impl ComputeCursor<AuditEventCursor> for JoinedAuditEvent {
    fn compute_cursor(&self) -> AuditEventCursor {
        (self.audit_event.timestamp, self.audit_event.id.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::tenant_role::ImmutableRoleKind;
    use crate::tests::prelude::*;
    use itertools::sorted;
    use itertools::Itertools;
    use macros::db_test;
    use newtypes::DataIdentifier;
    use newtypes::DecryptionContext;
    use newtypes::TenantRoleKind;

    #[db_test]
    fn test_create_audit_event(conn: &mut TestPgConn) {
        let tenant = tests::fixtures::tenant::create(conn);
        let vault = tests::fixtures::vault::create_person(conn, false);
        let scoped_vault = tests::fixtures::scoped_vault::create(conn, &vault.id, &tenant.id);
        let insight_event = tests::fixtures::insight_event::create(conn);

        let event = NewAuditEvent {
            tenant_id: tenant.id.clone(),
            principal_actor: DbActor::Footprint,
            insight_event_id: insight_event.id,
            detail: AuditEventDetail::CreateUser {
                is_live: true,
                scoped_vault_id: scoped_vault.id.clone(),
                created_fields: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Dob)],
            },
        };
        AuditEvent::create(conn, event).unwrap();

        let events: Vec<AuditEvent> = audit_event::table
            .filter(audit_event::tenant_id.eq(&tenant.id))
            .filter(audit_event::name.eq(AuditEventName::CreateUser))
            .get_results(conn.conn())
            .unwrap();
        assert_eq!(1, events.len());

        let event = events.into_iter().next().unwrap();
        if let AuditEventMetadata::CreateUser { fields } = event.metadata {
            assert_eq!(event.is_live, Some(true));
            assert_eq!(event.scoped_vault_id, Some(scoped_vault.id.clone()));
            assert_eq!(fields, vec![DataIdentifier::Id(newtypes::IdentityDataKind::Dob)],);
        } else {
            panic!("incorrect metadata type");
        }
    }

    #[db_test]
    fn test_filter_audit_event(conn: &mut TestPgConn) {
        let tenant = tests::fixtures::tenant::create(conn);
        let other_tenant = tests::fixtures::tenant::create(conn);

        let vault_1 = tests::fixtures::vault::create_person(conn, true);
        let scoped_vault_1 = tests::fixtures::scoped_vault::create(conn, &vault_1.id, &tenant.id);
        let vault_2 = tests::fixtures::vault::create_person(conn, true);
        let scoped_vault_2 = tests::fixtures::scoped_vault::create(conn, &vault_2.id, &tenant.id);

        let vault_sandbox = tests::fixtures::vault::create_person(conn, false);
        let scoped_vault_sandbox = tests::fixtures::scoped_vault::create(conn, &vault_sandbox.id, &tenant.id);

        let insight_event = tests::fixtures::insight_event::create(conn);

        let pagination = CursorPagination::page(100);
        let filters = FilterQueryParams {
            tenant_id: tenant.id.clone(),
            search: None,
            timestamp_lte: None,
            timestamp_gte: None,
            names: vec![],
            targets: vec![],
            is_live: Some(true),
            list_id: None,
        };
        let ((events, _), _) = AuditEvent::filter(conn, filters, pagination).unwrap();
        assert_eq!(events.len(), 0);

        let event1 = NewAuditEvent {
            tenant_id: tenant.id.clone(),
            principal_actor: DbActor::Footprint,
            insight_event_id: insight_event.id.clone(),
            detail: AuditEventDetail::CreateUser {
                is_live: true,
                scoped_vault_id: scoped_vault_1.id.clone(),
                created_fields: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Dob)],
            },
        };
        let id1 = AuditEvent::create(conn, event1).unwrap();

        let event2 = NewAuditEvent {
            tenant_id: tenant.id.clone(),
            principal_actor: DbActor::Footprint,
            insight_event_id: insight_event.id.clone(),
            detail: AuditEventDetail::DecryptUserData {
                is_live: true,
                scoped_vault_id: scoped_vault_2.id.clone(),
                reason: "investigating something".to_owned(),
                context: DecryptionContext::Api,
                decrypted_fields: vec![
                    DataIdentifier::Id(newtypes::IdentityDataKind::Zip),
                    DataIdentifier::Id(newtypes::IdentityDataKind::Email),
                ],
            },
        };
        let id2 = AuditEvent::create(conn, event2).unwrap();

        let tenant_role = TenantRole::get_immutable(
            conn,
            &tenant.id,
            ImmutableRoleKind::Admin,
            TenantRoleKind::DashboardUser,
        )
        .unwrap();
        let event3 = NewAuditEvent {
            tenant_id: tenant.id.clone(),
            principal_actor: DbActor::Footprint,
            insight_event_id: insight_event.id.clone(),
            detail: AuditEventDetail::DeleteUserData {
                is_live: false,
                scoped_vault_id: scoped_vault_sandbox.id.clone(),
                deleted_fields: vec![
                    DataIdentifier::Id(newtypes::IdentityDataKind::Ssn4),
                    DataIdentifier::Id(newtypes::IdentityDataKind::Ssn9),
                ],
            },
        };
        let id3 = AuditEvent::create(conn, event3).unwrap();

        let tenant_user = tests::fixtures::tenant_user::create(conn);

        let event4 = NewAuditEvent {
            tenant_id: tenant.id.clone(),
            principal_actor: DbActor::Footprint,
            insight_event_id: insight_event.id.clone(),
            detail: AuditEventDetail::InviteOrgMember {
                tenant_user_id: tenant_user.id,
                tenant_role_id: tenant_role.id,
            },
        };
        let id4 = AuditEvent::create(conn, event4).unwrap();

        let filters = FilterQueryParams {
            tenant_id: tenant.id.clone(),
            search: None,
            timestamp_lte: None,
            timestamp_gte: None,
            names: vec![],
            targets: vec![],
            is_live: Some(true),
            list_id: None,
        };
        let ((events, _), _) = AuditEvent::filter(conn, filters, CursorPagination::page(100)).unwrap();
        assert_eq!(events.len(), 3);

        for page_size in 0..=events.len() {
            let filters = FilterQueryParams {
                tenant_id: tenant.id.clone(),
                search: None,
                timestamp_lte: None,
                timestamp_gte: None,
                names: vec![],
                targets: vec![],
                is_live: Some(true),
                list_id: None,
            };
            let pagination = CursorPagination::page(page_size);
            let ((partial_events, _), _) = AuditEvent::filter(conn, filters, pagination).unwrap();
            assert_eq!(partial_events.len(), page_size);
        }

        let mut cursor = events
            .into_iter()
            .map(|event| (event.audit_event.timestamp, event.audit_event.id.clone()));
        let first_cursor = cursor.next().unwrap();
        let first_id = first_cursor.1.clone();
        let second_cursor = cursor.next().unwrap();
        let second_id = second_cursor.1.clone();
        let third_cursor = cursor.next().unwrap();
        let third_id = third_cursor.1.clone();

        let tests = vec![
            (
                "filter by cursor bound, three results",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                Some(first_cursor.clone()),
                vec![first_id.clone(), second_id.clone(), third_id.clone()],
            ),
            (
                "filter by id cursor bound, two result",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                Some(second_cursor.clone()),
                vec![second_id.clone(), third_id.clone()],
            ),
            (
                "filter by id cursor bound, no results",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                Some((
                    DateTime::<Utc>::from_timestamp(0, 0).unwrap(),
                    AuditEventId::from("ae_00000".to_owned()),
                )),
                vec![],
            ),
            (
                "search by fp_id",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: Some(scoped_vault_1.fp_id.to_string()),
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![id1.clone()],
            ),
            (
                "timestamp <= 0",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: Some(DateTime::<Utc>::from_timestamp(0, 0).unwrap()),
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![],
            ),
            (
                "timestamp <= far future",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: Some(DateTime::<Utc>::from_timestamp(9000000000, 0).unwrap()),
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![id1.clone(), id2.clone(), id4.clone()],
            ),
            (
                "timestamp >= 0",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: Some(DateTime::<Utc>::from_timestamp(0, 0).unwrap()),
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![id1.clone(), id2.clone(), id4.clone()],
            ),
            (
                "timestamp >= far future",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: Some(DateTime::<Utc>::from_timestamp(9000000000, 0).unwrap()),
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![],
            ),
            (
                "name = CreateUser",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![AuditEventName::CreateUser],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![id1.clone()],
            ),
            (
                "name = CreateUser or DecryptUserData",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![AuditEventName::CreateUser, AuditEventName::DecryptUserData],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![id1.clone(), id2.clone()],
            ),
            (
                "target fields overlap",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![
                        DataIdentifier::Id(newtypes::IdentityDataKind::Ssn9),
                        DataIdentifier::Id(newtypes::IdentityDataKind::Email),
                    ],
                    is_live: Some(false),
                    list_id: None,
                },
                None,
                vec![id3.clone()],
            ),
            (
                "target fields don't overlap",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Email)],
                    is_live: Some(false),
                    list_id: None,
                },
                None,
                vec![],
            ),
            (
                "live = true",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![id1.clone(), id2.clone(), id4.clone()],
            ),
            (
                "live = true, tenant with no events",
                FilterQueryParams {
                    tenant_id: other_tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(true),
                    list_id: None,
                },
                None,
                vec![],
            ),
            (
                "live = false",
                FilterQueryParams {
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: Some(false),
                    list_id: None,
                },
                None,
                vec![id3.clone(), id4.clone()],
            ),
        ];

        for (test_case, params, cursor, expect_ids) in tests {
            let pagination = CursorPagination::new(cursor, 100);
            let ((events, _), _) = AuditEvent::filter(conn, params, pagination).unwrap();
            assert_eq!(
                sorted(events.into_iter().map(|j| j.audit_event.id)).collect_vec(),
                sorted(expect_ids).collect_vec(),
                "test case: {}",
                test_case,
            );
        }

        let filters = FilterQueryParams {
            tenant_id: other_tenant.id,
            search: None,
            timestamp_lte: None,
            timestamp_gte: None,
            names: vec![],
            targets: vec![],
            is_live: Some(true),
            list_id: None,
        };
        let ((events, _), _) = AuditEvent::filter(conn, filters, CursorPagination::page(100)).unwrap();
        assert_eq!(events.len(), 0);
    }
}
