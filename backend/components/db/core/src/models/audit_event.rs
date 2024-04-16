use super::{list_entry::ListEntry, list_entry_creation::ListEntryCreation};
use crate::{
    actor::{saturate_actors, HasActor, SaturatedActor},
    models::{
        document_data::DocumentData, insight_event::InsightEvent, ob_configuration::ObConfiguration,
        scoped_vault::*, tenant::Tenant, tenant_api_key::TenantApiKey, tenant_role::TenantRole,
        tenant_user::TenantUser,
    },
    DbResult, PgConn, TxnPgConn,
};
use chrono::{DateTime, Utc};
use db_schema::schema::{
    audit_event, document_data, insight_event, list_entry, list_entry_creation, ob_configuration,
    scoped_vault, tenant, tenant_api_key, tenant_role, tenant_user,
};
use diesel::{
    dsl::sql,
    prelude::*,
    sql_types::{Array, Bool, Text},
    Insertable, Queryable,
};
use itertools::Itertools;
use newtypes::{
    AuditEventDetail, AuditEventId, AuditEventMetadata, AuditEventName, CommonAuditEventDetail,
    DataIdentifier, DbActor, DocumentDataId, InsightEventId, ListEntryCreationId, ListEntryId, ListId,
    ObConfigurationId, ScopedVaultId, TenantApiKeyId, TenantId, TenantRoleId, TenantUserId,
};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = audit_event)]
pub struct AuditEvent {
    pub id: AuditEventId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub timestamp: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub name: AuditEventName,
    pub principal_actor: DbActor,
    pub insight_event_id: InsightEventId,

    pub metadata: AuditEventMetadata,

    pub scoped_vault_id: Option<ScopedVaultId>,
    pub ob_configuration_id: Option<ObConfigurationId>,
    pub document_data_id: Option<DocumentDataId>,
    pub tenant_api_key_id: Option<TenantApiKeyId>,
    pub tenant_user_id: Option<TenantUserId>,
    pub tenant_role_id: Option<TenantRoleId>,
    pub is_live: Option<bool>,
    pub list_entry_creation_id: Option<ListEntryCreationId>,
    pub list_entry_id: Option<ListEntryId>,
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
    pub id: AuditEventId,
    pub tenant_id: TenantId,
    pub principal_actor: DbActor,
    pub insight_event_id: InsightEventId,
    pub detail: AuditEventDetail,
}

impl NewAuditEvent {
    #[tracing::instrument("NewAuditEvent::create", skip_all)]
    pub fn create(self, conn: &mut TxnPgConn) -> DbResult<()> {
        AuditEvent::bulk_create(conn, vec![self])
    }
}

#[derive(Debug, Default)]
pub struct FilterQueryParams {
    pub cursor: Option<(DateTime<Utc>, AuditEventId)>,
    pub tenant_id: TenantId,
    pub search: Option<String>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub names: Vec<AuditEventName>,
    pub targets: Vec<DataIdentifier>,
    pub is_live: bool,
    pub list_id: Option<ListId>,
}

#[derive(Debug)]
pub struct JoinedAuditEvent {
    pub audit_event: AuditEvent,
    pub tenant: Tenant,
    pub saturated_actor: SaturatedActor,
    pub insight_event: InsightEvent,

    pub scoped_vault: Option<ScopedVault>,
    pub ob_configuration: Option<ObConfiguration>,
    pub document_data: Option<DocumentData>,
    pub tenant_api_key: Option<TenantApiKey>,
    pub tenant_user: Option<TenantUser>,
    pub tenant_role: Option<TenantRole>,
    pub list_entry_creation: Option<ListEntryCreation>,
    pub list_entry: Option<ListEntry>,
}

type DieselJoinedAuditEvent = (
    AuditEvent,
    Tenant,
    InsightEvent,
    Option<ScopedVault>,
    Option<ObConfiguration>,
    Option<DocumentData>,
    Option<TenantApiKey>,
    Option<TenantUser>,
    Option<TenantRole>,
    Option<ListEntryCreation>,
    Option<ListEntry>,
);

impl HasActor for DieselJoinedAuditEvent {
    fn actor(&self) -> Option<DbActor> {
        Some(self.0.principal_actor.clone())
    }
}

impl AuditEvent {
    #[tracing::instrument("AuditEvent::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, events: Vec<NewAuditEvent>) -> DbResult<()> {
        let rows = events
            .into_iter()
            .map(|event| {
                let NewAuditEvent {
                    id,
                    tenant_id,
                    principal_actor,
                    insight_event_id,
                    detail,
                } = event;
                let CommonAuditEventDetail {
                    metadata,
                    scoped_vault_id,
                    ob_configuration_id,
                    document_data_id,
                    tenant_api_key_id,
                    tenant_user_id,
                    tenant_role_id,
                    is_live,
                    list_entry_creation_id,
                    list_entry_id,
                } = detail.into();
                NewAuditEventRow {
                    id,
                    timestamp: Utc::now(),
                    tenant_id,
                    name: AuditEventName::from(&metadata),
                    principal_actor,
                    insight_event_id,
                    metadata,
                    scoped_vault_id,
                    ob_configuration_id,
                    document_data_id,
                    tenant_api_key_id,
                    tenant_user_id,
                    tenant_role_id,
                    is_live,
                    list_entry_creation_id,
                    list_entry_id,
                }
            })
            .collect_vec();

        diesel::insert_into(audit_event::table)
            .values(rows)
            .execute(conn.conn())?;

        Ok(())
    }

    #[tracing::instrument("AuditEvent::filter", skip_all)]
    pub fn filter(
        conn: &mut PgConn,
        params: FilterQueryParams,
        page_size: i64,
    ) -> DbResult<Vec<JoinedAuditEvent>> {
        let mut results = audit_event::table
                    // Required fields
                    .inner_join(tenant::table)
                    .inner_join(insight_event::table)
                    // Nullable fields
                    .left_join(scoped_vault::table)
                    .left_join(ob_configuration::table)
                    .left_join(document_data::table)
                    .left_join(tenant_api_key::table)
                    .left_join(tenant_user::table)
                    .left_join(tenant_role::table)
                    .left_join(list_entry_creation::table)
                    .left_join(list_entry::table)
                    .order_by(audit_event::timestamp.desc())
                    // Secondary sort by ID to support (timestamp, id) cursor.
                    .then_order_by(audit_event::id.desc())
                    // Include deactivated scoped vaults so deleting doesn't break old audit logs.
                    .filter(audit_event::tenant_id.eq(params.tenant_id))
                    .filter(audit_event::is_live.eq(params.is_live))
                    .limit(page_size)
                    .into_boxed();

        if let Some((cursor_ts, cursor_id)) = params.cursor {
            // Filter on (row_ts, row_id) <= (cursor_ts, cursor_id)
            results = results.filter(
                audit_event::timestamp.lt(cursor_ts).or(audit_event::timestamp
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
            results = results.filter(
                list_entry_creation::list_id
                    .eq(list_id.clone())
                    .or(list_entry::list_id.eq(list_id)),
            )
        }

        if let Some(search) = params.search.as_ref() {
            results = results.filter(scoped_vault::fp_id.eq(search));
        }


        let results: Vec<DieselJoinedAuditEvent> = results
            .select((
                AuditEvent::as_select(),
                Tenant::as_select(),
                InsightEvent::as_select(),
                scoped_vault::all_columns.nullable(),
                ob_configuration::all_columns.nullable(),
                document_data::all_columns.nullable(),
                tenant_api_key::all_columns.nullable(),
                tenant_user::all_columns.nullable(),
                tenant_role::all_columns.nullable(),
                list_entry_creation::all_columns.nullable(),
                list_entry::all_columns.nullable(),
            ))
            .load(conn)?;
        let saturated_results = saturate_actors(conn, results)?;

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
                }
            })
            .collect();

        Ok(events)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{fixtures::ob_configuration::ObConfigurationOpts, prelude::*};
    use itertools::{sorted, Itertools};
    use macros::db_test;
    use newtypes::DataIdentifier;

    #[db_test]
    fn test_create_audit_event(conn: &mut TestPgConn) {
        let tenant = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &tenant.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let vault = tests::fixtures::vault::create_person(conn, false);
        let scoped_vault = tests::fixtures::scoped_vault::create(conn, &vault.id, &obc.id);
        let insight_event = tests::fixtures::insight_event::create(conn);

        NewAuditEvent {
            id: AuditEventId::generate(),
            tenant_id: tenant.id.clone(),
            principal_actor: DbActor::Footprint,
            insight_event_id: insight_event.id,
            detail: AuditEventDetail::CreateUser {
                is_live: true,
                scoped_vault_id: scoped_vault.id.clone(),
                created_fields: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Dob)],
            },
        }
        .create(conn)
        .unwrap();

        let events: Vec<AuditEvent> = audit_event::table
            .filter(audit_event::tenant_id.eq(&tenant.id))
            .filter(audit_event::name.eq(AuditEventName::CreateUser))
            .get_results(conn.conn())
            .unwrap();
        assert_eq!(1, events.len());

        let event = events.into_iter().next().unwrap();
        if let AuditEventMetadata::CreateUser { fields } = event.metadata {
            assert_eq!(event.is_live, Some(true));
            assert_eq!(event.scoped_vault_id, Some(scoped_vault.id));
            assert_eq!(fields, vec![DataIdentifier::Id(newtypes::IdentityDataKind::Dob)],);
        } else {
            panic!("incorrect metadata type");
        }
    }

    #[db_test]
    fn test_filter_audit_event(conn: &mut TestPgConn) {
        let tenant = tests::fixtures::tenant::create(conn);
        let other_tenant = tests::fixtures::tenant::create(conn);

        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &tenant.id,
            ObConfigurationOpts {
                is_live: true,
                ..Default::default()
            },
        );
        let vault_1 = tests::fixtures::vault::create_person(conn, true);
        let scoped_vault_1 = tests::fixtures::scoped_vault::create(conn, &vault_1.id, &obc.id);
        let vault_2 = tests::fixtures::vault::create_person(conn, true);
        let scoped_vault_2 = tests::fixtures::scoped_vault::create(conn, &vault_2.id, &obc.id);

        let obc_sandbox = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &tenant.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let vault_sandbox = tests::fixtures::vault::create_person(conn, false);
        let scoped_vault_sandbox =
            tests::fixtures::scoped_vault::create(conn, &vault_sandbox.id, &obc_sandbox.id);

        let insight_event = tests::fixtures::insight_event::create(conn);

        let events = AuditEvent::filter(
            conn,
            FilterQueryParams {
                cursor: None,
                tenant_id: tenant.id.clone(),
                search: None,
                timestamp_lte: None,
                timestamp_gte: None,
                names: vec![],
                targets: vec![],
                is_live: true,
                list_id: None,
            },
            100,
        )
        .unwrap();
        assert_eq!(events.len(), 0);

        let id1 = AuditEventId::generate();
        let id2 = AuditEventId::generate();
        let id3 = AuditEventId::generate();
        AuditEvent::bulk_create(
            conn,
            vec![
                NewAuditEvent {
                    id: id1.clone(),
                    tenant_id: tenant.id.clone(),
                    principal_actor: DbActor::Footprint,
                    insight_event_id: insight_event.id.clone(),
                    detail: AuditEventDetail::CreateUser {
                        is_live: true,
                        scoped_vault_id: scoped_vault_1.id.clone(),
                        created_fields: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Dob)],
                    },
                },
                NewAuditEvent {
                    id: id2.clone(),
                    tenant_id: tenant.id.clone(),
                    principal_actor: DbActor::Footprint,
                    insight_event_id: insight_event.id.clone(),
                    detail: AuditEventDetail::DecryptUserData {
                        is_live: true,
                        scoped_vault_id: scoped_vault_2.id.clone(),
                        reason: "investigating something".to_owned(),
                        decrypted_fields: vec![
                            DataIdentifier::Id(newtypes::IdentityDataKind::Zip),
                            DataIdentifier::Id(newtypes::IdentityDataKind::Email),
                        ],
                    },
                },
                NewAuditEvent {
                    id: id3.clone(),
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
                },
            ],
        )
        .unwrap();

        let events = AuditEvent::filter(
            conn,
            FilterQueryParams {
                cursor: None,
                tenant_id: tenant.id.clone(),
                search: None,
                timestamp_lte: None,
                timestamp_gte: None,
                names: vec![],
                targets: vec![],
                is_live: true,
                list_id: None,
            },
            100,
        )
        .unwrap();
        assert_eq!(events.len(), 2);

        let first_cursor = events
            .first()
            .map(|event| (event.audit_event.timestamp, event.audit_event.id.clone()))
            .unwrap();
        let first_id = first_cursor.1.clone();
        let second_cursor = events
            .get(1)
            .map(|event| (event.audit_event.timestamp, event.audit_event.id.clone()))
            .unwrap();
        let second_id = second_cursor.1.clone();

        let tests = vec![
            (
                "filter by cursor bound, two results",
                FilterQueryParams {
                    cursor: Some(first_cursor.clone()),
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![first_id.clone(), second_id.clone()],
            ),
            (
                "filter by id cursor bound, one result",
                FilterQueryParams {
                    cursor: Some(second_cursor.clone()),
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![second_id.clone()],
            ),
            (
                "filter by id cursor bound, no results",
                FilterQueryParams {
                    cursor: Some((
                        DateTime::<Utc>::from_timestamp(0, 0).unwrap(),
                        AuditEventId::from("ae_00000".to_owned()),
                    )),
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![],
            ),
            (
                "search by fp_id",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: Some(scoped_vault_1.fp_id.to_string()),
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![id1.clone()],
            ),
            (
                "timestamp <= 0",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: Some(DateTime::<Utc>::from_timestamp(0, 0).unwrap()),
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![],
            ),
            (
                "timestamp <= far future",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: Some(DateTime::<Utc>::from_timestamp(9000000000, 0).unwrap()),
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "timestamp >= 0",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: Some(DateTime::<Utc>::from_timestamp(0, 0).unwrap()),
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "timestamp >= far future",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: Some(DateTime::<Utc>::from_timestamp(9000000000, 0).unwrap()),
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![],
            ),
            (
                "name = CreateUser",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![AuditEventName::CreateUser],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![id1.clone()],
            ),
            (
                "name = CreateUser or DecryptUserData",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![AuditEventName::CreateUser, AuditEventName::DecryptUserData],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "target fields overlap",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![
                        DataIdentifier::Id(newtypes::IdentityDataKind::Ssn9),
                        DataIdentifier::Id(newtypes::IdentityDataKind::Email),
                    ],
                    is_live: false,
                    list_id: None,
                },
                vec![id3.clone()],
            ),
            (
                "target fields don't overlap",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Email)],
                    is_live: false,
                    list_id: None,
                },
                vec![],
            ),
            (
                "live = true",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "live = true, tenant with no events",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: other_tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: true,
                    list_id: None,
                },
                vec![],
            ),
            (
                "live = false",
                FilterQueryParams {
                    cursor: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    names: vec![],
                    targets: vec![],
                    is_live: false,
                    list_id: None,
                },
                vec![id3.clone()],
            ),
        ];

        for (test_case, params, expect_ids) in tests {
            let events = AuditEvent::filter(conn, params, 100).unwrap();
            assert_eq!(
                sorted(events.into_iter().map(|j| j.audit_event.id)).collect_vec(),
                sorted(expect_ids).collect_vec(),
                "test case: {}",
                test_case,
            );
        }


        let events = AuditEvent::filter(
            conn,
            FilterQueryParams {
                cursor: None,
                tenant_id: other_tenant.id,
                search: None,
                timestamp_lte: None,
                timestamp_gte: None,
                names: vec![],
                targets: vec![],
                is_live: true,
                list_id: None,
            },
            100,
        )
        .unwrap();
        assert_eq!(events.len(), 0);
    }
}
