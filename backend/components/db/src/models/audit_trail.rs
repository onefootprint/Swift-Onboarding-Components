use crate::diesel::BoolExpressionMethods;
use crate::diesel::ExpressionMethods;
use crate::{
    schema::{self, audit_trail},
    DbError,
};
use chrono::{DateTime, Utc};
use diesel::{Insertable, PgConnection, QueryDsl, Queryable, RunQueryDsl};
use newtypes::{AuditTrailEvent, AuditTrailId, FootprintUserId, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = audit_trail)]
pub struct AuditTrail {
    pub id: AuditTrailId,
    pub user_vault_id: UserVaultId,
    // Optional tenant_id if the event should only be visible by a specific tenant
    pub tenant_id: Option<TenantId>,
    pub event: AuditTrailEvent,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

impl AuditTrail {
    pub fn get_for_tenant(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        footprint_user_id: &FootprintUserId,
        is_live: bool,
    ) -> Result<Vec<AuditTrail>, DbError> {
        let user_vault_ids = schema::scoped_user::table
            .filter(schema::scoped_user::tenant_id.eq(tenant_id))
            .filter(schema::scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(schema::scoped_user::is_live.eq(is_live))
            .select(schema::scoped_user::user_vault_id);
        let audit_trails = schema::audit_trail::table
            // Get all access events for this user, but filter out access events from other tenants
            .filter(schema::audit_trail::user_vault_id.eq_any(user_vault_ids))
            .filter(schema::audit_trail::tenant_id.is_null().or(
                schema::audit_trail::tenant_id.eq(tenant_id)))
            .order_by(schema::audit_trail::timestamp.asc())
            .get_results(conn)?;
        Ok(audit_trails)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = audit_trail)]
struct NewAuditTrail {
    pub user_vault_id: UserVaultId,
    pub tenant_id: Option<TenantId>,
    pub event: AuditTrailEvent,
    pub timestamp: DateTime<Utc>,
}

impl AuditTrail {
    pub fn create(
        conn: &mut PgConnection,
        event: AuditTrailEvent,
        user_vault_id: UserVaultId,
        tenant_id: Option<TenantId>,
    ) -> Result<(), DbError> {
        let row = NewAuditTrail {
            user_vault_id,
            tenant_id,
            timestamp: chrono::Utc::now(),
            event,
        };
        diesel::insert_into(audit_trail::table)
            .values(row)
            .execute(conn)?;
        Ok(())
    }
}
