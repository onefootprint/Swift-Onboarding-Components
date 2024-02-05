use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::audit_event;
use diesel::{prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    AuditEventDetail, AuditEventId, AuditEventMetadata, AuditEventName, CommonAuditEventDetail, DbActor,
    DocumentDataId, InsightEventId, ObConfigurationId, ScopedVaultId, TenantApiKeyId, TenantId, TenantRoleId,
    TenantUserId,
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
    pub principal_actor: Option<DbActor>,
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
    principal_actor: Option<DbActor>,
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
    pub principal_actor: Option<DbActor>,
    pub insight_event_id: InsightEventId,
    pub detail: AuditEventDetail,
}

impl NewAuditEvent {
    #[tracing::instrument("NewAuditEvent::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<()> {
        AuditEvent::bulk_create(conn, vec![self])
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{fixtures::ob_configuration::ObConfigurationOpts, prelude::*};
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
            principal_actor: Some(DbActor::Footprint),
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
}
