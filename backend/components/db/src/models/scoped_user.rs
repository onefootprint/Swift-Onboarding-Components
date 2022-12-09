use crate::schema::scoped_user;
use crate::{DbError, DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FootprintUserId, ScopedUserId, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};

use super::tenant::Tenant;
use super::user_vault::UserVault;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = scoped_user)]
pub struct ScopedUser {
    pub id: ScopedUserId,
    pub fp_user_id: FootprintUserId,
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ordering_id: i64,
    pub start_timestamp: DateTime<Utc>,
    pub is_live: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = scoped_user)]
struct NewScopedUser {
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
}

impl ScopedUser {
    pub fn get_or_create(
        conn: &mut TxnPgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        is_live: bool,
    ) -> DbResult<ScopedUser> {
        // TODO maybe pass in locked user vault instead of re-locking here
        let uv = UserVault::lock(conn, &user_vault_id)?;
        if uv.is_live != is_live {
            return Err(DbError::SandboxMismatch);
        }
        // Has to be inside locked txn, otherwise this could be a stale read.
        // Still protected by uniqueness constraints, but those are clunkier
        let scoped_user = scoped_user::table
            .filter(scoped_user::user_vault_id.eq(&user_vault_id))
            .filter(scoped_user::tenant_id.eq(&tenant_id))
            .first(conn.conn())
            .optional()?;
        if let Some(scoped_user) = scoped_user {
            return Ok(scoped_user);
        }
        // Row doesn't exist for user_vault_id, tenant_id - create a new one
        let new = NewScopedUser {
            user_vault_id,
            tenant_id,
            start_timestamp: Utc::now(),
            is_live,
        };
        let ob = diesel::insert_into(scoped_user::table)
            .values(new)
            .get_result::<ScopedUser>(conn.conn())?;
        Ok(ob)
    }

    /// get scoped_users by a specific user vault
    pub fn list_for_user_vault(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Vec<(ScopedUser, Tenant)>> {
        use crate::schema::tenant;
        let results = scoped_user::table
            .inner_join(tenant::table)
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;
        Ok(results)
    }

    pub fn get(
        conn: &mut PgConnection,
        footprint_user_id: &FootprintUserId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<ScopedUser> {
        let result = scoped_user::table
            .filter(scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .first(conn)?;

        Ok(result)
    }
}
