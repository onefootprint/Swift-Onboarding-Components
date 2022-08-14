use crate::errors::DbError;
use crate::schema::user_vaults;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, QueryDsl, Queryable};
use newtypes::{
    EncryptedVaultPrivateKey, Fingerprint, FootprintUserId, SealedVaultBytes, TenantId, UserVaultId,
    VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::scoped_users::ScopedUser;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = user_vaults)]
pub struct UserVault {
    pub id: UserVaultId,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
    pub is_portable: bool,
}

impl UserVault {
    pub fn get(conn: &mut PgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user = user_vaults::table.filter(user_vaults::id.eq(id)).first(conn)?;
        Ok(user)
    }

    pub fn lock(conn: &mut PgConnection, id: UserVaultId) -> Result<Self, DbError> {
        let user = user_vaults::table
            .for_no_key_update()
            .filter(user_vaults::id.eq(id))
            .first(conn)?;
        Ok(user)
    }

    pub async fn get_portable_for_tenant(
        pool: &crate::DbPool,
        tenant_id: TenantId,
        footprint_user_id: FootprintUserId,
        is_live: bool,
    ) -> Result<Option<(UserVault, ScopedUser)>, DbError> {
        Self::get_for_tenant(pool, tenant_id, footprint_user_id, is_live, Some(true)).await
    }

    pub async fn get_non_portable_for_tenant(
        pool: &crate::DbPool,
        tenant_id: TenantId,
        footprint_user_id: FootprintUserId,
        is_live: bool,
    ) -> Result<Option<(UserVault, ScopedUser)>, DbError> {
        Self::get_for_tenant(pool, tenant_id, footprint_user_id, is_live, Some(false)).await
    }

    pub async fn get_all_for_tenant(
        pool: &crate::DbPool,
        tenant_id: TenantId,
        footprint_user_id: FootprintUserId,
        is_live: bool,
    ) -> Result<Option<(UserVault, ScopedUser)>, DbError> {
        Self::get_for_tenant(pool, tenant_id, footprint_user_id, is_live, None).await
    }

    async fn get_for_tenant(
        pool: &crate::DbPool,
        tenant_id: TenantId,
        footprint_user_id: FootprintUserId,
        is_live: bool,
        is_portable: Option<bool>,
    ) -> Result<Option<(UserVault, ScopedUser)>, DbError> {
        use crate::schema::scoped_users;
        let result = pool
            .db_query(move |conn| -> Result<Option<(UserVault, ScopedUser)>, DbError> {
                let mut query = user_vaults::table
                    .inner_join(scoped_users::table)
                    .filter(scoped_users::tenant_id.eq(tenant_id))
                    .filter(scoped_users::fp_user_id.eq(footprint_user_id))
                    .filter(scoped_users::is_live.eq(is_live))
                    .into_boxed();

                if let Some(portable_filter) = is_portable {
                    query = query.filter(user_vaults::is_portable.eq(portable_filter));
                }

                let result = query.first(conn).optional()?;
                Ok(result)
            })
            .await??;

        Ok(result)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vaults)]
pub struct NewUserVault {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: bool,
    pub is_portable: bool,
}

pub struct NewPortableUserVaultReq {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: bool,
    // Note: these aren't actual columns on the table -
    pub e_phone_number: SealedVaultBytes,
    pub sh_phone_number: Fingerprint,
    pub e_phone_country: SealedVaultBytes,
    pub sh_phone_country: Fingerprint,
}

pub struct NewNonPortableUserVaultReq {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: bool,
    pub tenant_id: TenantId,
}
