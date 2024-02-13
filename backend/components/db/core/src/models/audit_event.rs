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
    audit_event, document_data, insight_event, ob_configuration, scoped_vault, tenant, tenant_api_key,
    tenant_role, tenant_user,
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
    DataIdentifier, DbActor, DocumentDataId, InsightEventId, ObConfigurationId, ScopedVaultId,
    TenantApiKeyId, TenantId, TenantRoleId, TenantUserId,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_frequent_note)]
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
    pub fn create(self, conn: &mut PgConn) -> DbResult<()> {
        AuditEvent::bulk_create(conn, vec![self])
    }
}

#[derive(Debug)]
pub struct FilterQueryParams {
    pub id_lt: Option<AuditEventId>,
    pub tenant_id: TenantId,
    pub search: Option<String>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub name: Option<AuditEventName>,
    pub targets: Vec<DataIdentifier>,
    pub is_live: bool,
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
);

impl HasActor for DieselJoinedAuditEvent {
    fn actor(&self) -> Option<DbActor> {
        Some(self.0.principal_actor.clone())
    }
}

impl AuditEvent {
    #[tracing::instrument("AuditEvent::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, events: Vec<NewAuditEvent>) -> DbResult<()> {
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
                }
            })
            .collect_vec();

        diesel::insert_into(audit_event::table)
            .values(rows)
            .execute(conn)?;

        Ok(())
    }

    #[tracing::instrument("AuditEvent::filter", skip_all)]
    pub fn filter(
        conn: &mut TxnPgConn<'_>,
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
                    .order_by(audit_event::timestamp.desc())
                    // Secondary sort by ID to supp.
                    .then_order_by(audit_event::id.asc())
                    .filter(audit_event::tenant_id.eq(params.tenant_id))
                    .filter(audit_event::is_live.eq(params.is_live))
                    .limit(page_size)
                    .into_boxed();

        if let Some(id_lt) = params.id_lt {
            results = results.filter(audit_event::id.lt(id_lt))
        }

        if let Some(timestamp_lte) = params.timestamp_lte {
            results = results.filter(audit_event::timestamp.le(timestamp_lte))
        }

        if let Some(timestamp_gte) = params.timestamp_gte {
            results = results.filter(audit_event::timestamp.ge(timestamp_gte))
        }

        if let Some(name) = params.name {
            results = results.filter(audit_event::name.eq(name))
        }

        if !params.targets.is_empty() {
            // Filter where params.targets overlaps with the event's fields.
            results = results.filter(
                sql::<Bool>("metadata -> 'data' -> 'fields' ?| ").bind::<Array<Text>, _>(params.targets),
            )
        }

        if let Some(search) = params.search {
            let exact_match_fp_id = scoped_vault::fp_id.eq(search.clone());
            let substr_match_tenant_name = tenant::name.ilike(format!("%{}%", search));
            let substr_match_decrypt_reason = audit_event::name.eq(AuditEventName::DecryptUserData).and(
                sql::<Bool>("metadata -> 'data' ->> 'reason' ILIKE ")
                    .bind::<Text, _>(format!("%{}%", search)),
            );
            let exact_match_field = sql::<Bool>("metadata -> 'data' -> 'fields' ? ").bind::<Text, _>(search);

            results = results.filter(
                exact_match_fp_id
                    .or(substr_match_tenant_name)
                    .or(substr_match_decrypt_reason)
                    .or(exact_match_field),
            );
        }


        let results: Vec<DieselJoinedAuditEvent> = results.load(conn.conn())?;
        let saturated_results = saturate_actors(conn, results)?;

        let events = saturated_results
            .into_iter()
            .map(
                |(
                    (
                        audit_event,
                        tenant,
                        insight_event,
                        scoped_vault,
                        ob_configuration,
                        document_data,
                        tenant_api_key,
                        tenant_user,
                        tenant_role,
                    ),
                    saturated_actor,
                )| {
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
                    }
                },
            )
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
                id_lt: None,
                tenant_id: tenant.id.clone(),
                search: None,
                timestamp_lte: None,
                timestamp_gte: None,
                name: None,
                targets: vec![],
                is_live: true,
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

        let tests = vec![
            (
                "filter by id cursor bound",
                FilterQueryParams {
                    id_lt: Some((&id1).max(&id2).clone()),
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![(&id1).min(&id2).clone()],
            ),
            (
                "filter by id cursor bound, no results",
                FilterQueryParams {
                    id_lt: Some((&id1).min(&id2).clone()),
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![],
            ),
            (
                "search by fp_id",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: Some(scoped_vault_1.fp_id.to_string()),
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id1.clone()],
            ),
            (
                "search by partial tenant name",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: Some(tenant.name[..tenant.name.len() - 3].to_owned()),
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "search by decryption reason",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: Some("investigating".to_owned()),
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id2.clone()],
            ),
            (
                "search by fields",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: Some("id.zip".to_owned()),
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id2.clone()],
            ),
            (
                "timestamp <= 0",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: Some(DateTime::<Utc>::from_timestamp(0, 0).unwrap()),
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![],
            ),
            (
                "timestamp <= far future",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: Some(DateTime::<Utc>::from_timestamp(9000000000, 0).unwrap()),
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "timestamp >= 0",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: Some(DateTime::<Utc>::from_timestamp(0, 0).unwrap()),
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "timestamp >= far future",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: Some(DateTime::<Utc>::from_timestamp(9000000000, 0).unwrap()),
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![],
            ),
            (
                "name = CreateUser",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: Some(AuditEventName::CreateUser),
                    targets: vec![],
                    is_live: true,
                },
                vec![id1.clone()],
            ),
            (
                "target fields overlap",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![
                        DataIdentifier::Id(newtypes::IdentityDataKind::Ssn9),
                        DataIdentifier::Id(newtypes::IdentityDataKind::Email),
                    ],
                    is_live: false,
                },
                vec![id3.clone()],
            ),
            (
                "target fields don't overlap",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![DataIdentifier::Id(newtypes::IdentityDataKind::Email)],
                    is_live: false,
                },
                vec![],
            ),
            (
                "live = true",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![id1.clone(), id2.clone()],
            ),
            (
                "live = true, tenant with no events",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: other_tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: true,
                },
                vec![],
            ),
            (
                "live = false",
                FilterQueryParams {
                    id_lt: None,
                    tenant_id: tenant.id.clone(),
                    search: None,
                    timestamp_lte: None,
                    timestamp_gte: None,
                    name: None,
                    targets: vec![],
                    is_live: false,
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
                id_lt: None,
                tenant_id: other_tenant.id,
                search: None,
                timestamp_lte: None,
                timestamp_gte: None,
                name: None,
                targets: vec![],
                is_live: true,
            },
            100,
        )
        .unwrap();
        assert_eq!(events.len(), 0);
    }
}
