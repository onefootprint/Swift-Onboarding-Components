use super::tenants::Tenant;
use crate::schema::scoped_users;
use crate::{DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FootprintUserId, ScopedUserId, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = scoped_users)]
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
#[diesel(table_name = scoped_users)]
struct NewScopedUser {
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
}

impl ScopedUser {
    pub fn get_or_create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        is_live: bool,
    ) -> Result<ScopedUser, DbError> {
        let scoped_user = scoped_users::table
            .filter(scoped_users::user_vault_id.eq(&user_vault_id))
            .filter(scoped_users::tenant_id.eq(&tenant_id))
            .first(conn)
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
        let ob = diesel::insert_into(scoped_users::table)
            .values(new)
            .get_result::<ScopedUser>(conn)?;
        Ok(ob)
    }

    /// get scoped_users by a specific user vault
    pub fn list_for_user_vault(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<(ScopedUser, Tenant)>, DbError> {
        use crate::schema::tenants;
        let results = scoped_users::table
            .inner_join(tenants::table)
            .filter(scoped_users::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;
        Ok(results)
    }

    pub async fn get_for_tenant(
        pool: &DbPool,
        tenant_id: TenantId,
        user_vault_id: UserVaultId,
    ) -> Result<Option<ScopedUser>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<ScopedUser>, DbError> {
                let ob = scoped_users::table
                    .filter(scoped_users::tenant_id.eq(tenant_id))
                    .filter(scoped_users::user_vault_id.eq(user_vault_id))
                    .first(conn)
                    .optional()?;
                Ok(ob)
            })
            .await??;
        Ok(ob)
    }
}
