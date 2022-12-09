use crate::schema::scoped_user;
use crate::schema::user_vault::{self, BoxedQuery};
use crate::{DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, QueryDsl, Queryable};
use newtypes::{
    DataPriority, EncryptedVaultPrivateKey, Fingerprint, FootprintUserId, ScopedUserId, SealedVaultBytes,
    TenantId, UserVaultId, VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;
use super::phone_number::PhoneNumber;
use super::scoped_user::ScopedUser;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = user_vault)]
pub struct UserVault {
    pub id: UserVaultId,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive,
    pub is_portable: bool,
}

pub enum UserVaultIdentifier<'a> {
    Id(&'a UserVaultId),
    ScopedUserId(&'a ScopedUserId),
    FpUserId {
        fp_user_id: &'a FootprintUserId,
        tenant_id: &'a TenantId,
        is_live: IsLive,
    },
}

impl<'a> From<&'a UserVaultId> for UserVaultIdentifier<'a> {
    fn from(id: &'a UserVaultId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ScopedUserId> for UserVaultIdentifier<'a> {
    fn from(id: &'a ScopedUserId) -> Self {
        Self::ScopedUserId(id)
    }
}

impl<'a> From<(&'a FootprintUserId, &'a TenantId, IsLive)> for UserVaultIdentifier<'a> {
    fn from((fp_user_id, tenant_id, is_live): (&'a FootprintUserId, &'a TenantId, IsLive)) -> Self {
        Self::FpUserId {
            fp_user_id,
            tenant_id,
            is_live,
        }
    }
}

impl UserVault {
    fn query(id: UserVaultIdentifier) -> BoxedQuery<Pg> {
        match id {
            UserVaultIdentifier::Id(id) => user_vault::table.filter(user_vault::id.eq(id)).into_boxed(),
            UserVaultIdentifier::ScopedUserId(scoped_user_id) => {
                let uv_ids = scoped_user::table
                    .filter(scoped_user::id.eq(scoped_user_id))
                    .select(scoped_user::user_vault_id);
                user_vault::table
                    .filter(user_vault::id.eq_any(uv_ids))
                    .into_boxed()
            }
            UserVaultIdentifier::FpUserId {
                fp_user_id,
                tenant_id,
                is_live,
            } => {
                let uv_ids = scoped_user::table
                    .filter(scoped_user::fp_user_id.eq(fp_user_id))
                    .filter(scoped_user::tenant_id.eq(tenant_id))
                    .filter(scoped_user::is_live.eq(is_live))
                    .select(scoped_user::user_vault_id);
                user_vault::table
                    .filter(user_vault::id.eq_any(uv_ids))
                    .into_boxed()
            }
        }
    }

    pub fn get<'a, T>(conn: &mut PgConnection, id: T) -> DbResult<Self>
    where
        T: Into<UserVaultIdentifier<'a>>,
    {
        let user = Self::query(id.into()).first(conn)?;
        Ok(user)
    }

    pub fn lock<'a, T>(conn: &mut TxnPgConnection, id: T) -> DbResult<Self>
    where
        T: Into<UserVaultIdentifier<'a>>,
    {
        // Sadly have to duplicate this logic since you can't add `for_no_key_update()` to a boxed query
        let user = match id.into() {
            UserVaultIdentifier::Id(id) => user_vault::table
                .filter(user_vault::id.eq(id))
                .for_no_key_update()
                .first(conn.conn())?,
            UserVaultIdentifier::ScopedUserId(scoped_user_id) => {
                let uv_ids = scoped_user::table
                    .filter(scoped_user::id.eq(scoped_user_id))
                    .select(scoped_user::user_vault_id);
                user_vault::table
                    .filter(user_vault::id.eq_any(uv_ids))
                    .for_no_key_update()
                    .first(conn.conn())?
            }
            UserVaultIdentifier::FpUserId {
                fp_user_id,
                tenant_id,
                is_live,
            } => {
                let uv_ids = scoped_user::table
                    .filter(scoped_user::fp_user_id.eq(fp_user_id))
                    .filter(scoped_user::tenant_id.eq(tenant_id))
                    .filter(scoped_user::is_live.eq(is_live))
                    .select(scoped_user::user_vault_id);
                user_vault::table
                    .filter(user_vault::id.eq_any(uv_ids))
                    .for_no_key_update()
                    .first(conn.conn())?
            }
        };
        Ok(user)
    }

    pub fn multi_get(conn: &mut PgConnection, ids: Vec<&ScopedUserId>) -> DbResult<Vec<Self>> {
        let uv_ids = scoped_user::table
            .filter(scoped_user::id.eq_any(ids))
            .select(scoped_user::user_vault_id);
        let users = user_vault::table
            .filter(user_vault::id.eq_any(uv_ids))
            .load::<Self>(conn)?;
        Ok(users)
    }

    /// creates a portable user vault
    pub fn create(
        conn: &mut TxnPgConnection,
        new_user: NewUserVaultArgs,
    ) -> DbResult<(UserVault, Option<ScopedUser>, PhoneNumber)> {
        let new_user_vault = NewUserVault {
            e_private_key: new_user.e_private_key,
            public_key: new_user.public_key,
            is_live: new_user.is_live,
            is_portable: true,
        };
        let user_vault = diesel::insert_into(user_vault::table)
            .values(new_user_vault)
            .get_result::<UserVault>(conn.conn())?;
        let su = if let Some(tenant_id) = new_user.tenant_id {
            let su = ScopedUser::get_or_create(conn, user_vault.id.clone(), tenant_id, new_user.is_live)?;
            Some(su)
        } else {
            None
        };
        let phone_number = PhoneNumber::create_verified(
            conn,
            user_vault.id.clone(),
            new_user.e_phone_number,
            new_user.sh_phone_number,
            new_user.e_phone_country,
            DataPriority::Primary,
            su.as_ref().map(|su| su.id.clone()),
        )?;
        Ok((user_vault, su, phone_number))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vault)]
pub struct NewUserVault {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub is_portable: bool,
}

pub struct NewUserVaultArgs {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    // Note: these aren't actual columns on the table -
    pub e_phone_number: SealedVaultBytes,
    pub sh_phone_number: Fingerprint,
    pub e_phone_country: SealedVaultBytes,
    /// When provided, creates the ScopedUser at the same time as created the user vault
    pub tenant_id: Option<TenantId>,
}

pub struct NewNonPortableUserVaultReq {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub tenant_id: TenantId,
}
