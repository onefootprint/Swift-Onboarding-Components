use crate::schema::scoped_user;
use crate::{DbError, DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FootprintUserId, ObConfigurationId, ScopedUserId, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;
use super::tenant::Tenant;
use super::user_vault::UserVault;

/// Creates a unique identifier specific to each onboarding configuration.
/// This allows one user to onboard onto multiple onboarding configurations at the same tenant
/// while keeping information for each onboarding separate.
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
    // Only null when the vault is non-portable
    pub ob_configuration_id: Option<ObConfigurationId>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = scoped_user)]
struct NewScopedUser {
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
    ob_configuration_id: Option<ObConfigurationId>,
}

pub enum ScopedUserIdentifier<'a> {
    Id {
        id: &'a ScopedUserId,
        uv_id: &'a UserVaultId,
    },
    FpUserId {
        fp_user_id: &'a FootprintUserId,
        t_id: &'a TenantId,
        is_live: IsLive,
    },
}

impl<'a> From<(&'a ScopedUserId, &'a UserVaultId)> for ScopedUserIdentifier<'a> {
    fn from((id, uv_id): (&'a ScopedUserId, &'a UserVaultId)) -> Self {
        Self::Id { id, uv_id }
    }
}

impl<'a> From<(&'a FootprintUserId, &'a TenantId, IsLive)> for ScopedUserIdentifier<'a> {
    fn from((fp_user_id, t_id, is_live): (&'a FootprintUserId, &'a TenantId, IsLive)) -> Self {
        Self::FpUserId {
            fp_user_id,
            t_id,
            is_live,
        }
    }
}

impl ScopedUser {
    pub fn get_or_create(
        conn: &mut TxnPgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        is_live: bool,
        // TODO should i just take in the ob_config ID and infer is_live and tenant_id from it?
        ob_configuration_id: Option<ObConfigurationId>,
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
            .filter(scoped_user::ob_configuration_id.eq(ob_configuration_id.as_ref()))
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
            ob_configuration_id,
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

    pub fn get<'a, T: Into<ScopedUserIdentifier<'a>>>(
        conn: &mut PgConnection,
        id: T,
    ) -> DbResult<ScopedUser> {
        let mut query = scoped_user::table.into_boxed();

        match id.into() {
            ScopedUserIdentifier::Id { id, uv_id } => {
                query = query
                    .filter(scoped_user::id.eq(id))
                    .filter(scoped_user::user_vault_id.eq(uv_id))
            }
            ScopedUserIdentifier::FpUserId {
                fp_user_id,
                t_id,
                is_live,
            } => {
                query = query
                    .filter(scoped_user::fp_user_id.eq(fp_user_id))
                    .filter(scoped_user::tenant_id.eq(t_id))
                    .filter(scoped_user::is_live.eq(is_live));
            }
        }
        let result = query.first(conn)?;
        Ok(result)
    }
}
