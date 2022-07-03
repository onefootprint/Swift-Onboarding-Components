use crate::diesel::BoolExpressionMethods;
use crate::diesel::ExpressionMethods;
use crate::{
    schema::{self, audit_trails},
    DbError,
};
use chrono::NaiveDateTime;
use diesel::{dsl::any, Insertable, PgConnection, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{AuditTrailEvent, AuditTrailId, FootprintUserId, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "audit_trails"]
pub struct AuditTrail {
    pub id: AuditTrailId,
    pub user_vault_id: UserVaultId,
    // Optional tenant_id if the event should only be visible by a specific tenant
    pub tenant_id: Option<TenantId>,
    pub event: AuditTrailEvent,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

impl AuditTrail {
    pub fn get_for_tenant(
        conn: &PgConnection,
        tenant_id: &TenantId,
        footprint_user_id: &FootprintUserId,
    ) -> Result<Vec<AuditTrail>, DbError> {
        let user_vault_ids = schema::onboardings::table
            .filter(schema::onboardings::tenant_id.eq(tenant_id))
            .filter(schema::onboardings::user_ob_id.eq(footprint_user_id))
            .select(schema::onboardings::user_vault_id);
        let audit_trails = schema::audit_trails::table
            // Get all access events for this user, but filter out access events from other tenants
            .filter(schema::audit_trails::user_vault_id.eq(any(user_vault_ids)))
            .filter(schema::audit_trails::tenant_id.is_null().or(
                schema::audit_trails::tenant_id.eq(tenant_id)))
            .order_by(schema::audit_trails::timestamp.asc())
            .get_results(conn)?;
        Ok(audit_trails)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "audit_trails"]
struct NewAuditTrail {
    pub user_vault_id: UserVaultId,
    pub tenant_id: Option<TenantId>,
    pub event: AuditTrailEvent,
    pub timestamp: NaiveDateTime,
}

impl AuditTrail {
    pub fn create(
        conn: &PgConnection,
        event: AuditTrailEvent,
        user_vault_id: UserVaultId,
        tenant_id: Option<TenantId>,
    ) -> Result<(), DbError> {
        let row = NewAuditTrail {
            user_vault_id,
            tenant_id,
            timestamp: chrono::Utc::now().naive_utc(),
            event,
        };
        diesel::insert_into(audit_trails::table)
            .values(row)
            .execute(conn)?;
        Ok(())
    }
}
