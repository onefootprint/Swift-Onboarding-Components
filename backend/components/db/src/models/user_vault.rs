use crate::schema::user_vault::{self, BoxedQuery};
use crate::schema::{onboarding, scoped_user};
use crate::{DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, QueryDsl, Queryable};
use newtypes::{
    EncryptedVaultPrivateKey, FootprintUserId, Locked, OnboardingId, ScopedUserId, TenantId, UserVaultId,
    VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;

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
    OnboardingId(&'a OnboardingId),
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

impl<'a> From<&'a OnboardingId> for UserVaultIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::OnboardingId(id)
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
            UserVaultIdentifier::OnboardingId(onboarding_id) => {
                let uv_ids = onboarding::table
                    .filter(onboarding::id.eq(onboarding_id))
                    .inner_join(scoped_user::table)
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

    pub fn lock(conn: &mut TxnPgConnection, id: &UserVaultId) -> DbResult<Locked<Self>> {
        let user = user_vault::table
            .filter(user_vault::id.eq(id))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }

    pub fn lock_by_scoped_user(conn: &mut TxnPgConnection, su_id: &ScopedUserId) -> DbResult<Locked<Self>> {
        let uv_ids = scoped_user::table
            .filter(scoped_user::id.eq(su_id))
            .select(scoped_user::user_vault_id);
        let user = user_vault::table
            .filter(user_vault::id.eq_any(uv_ids))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
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

    pub fn create(conn: &mut PgConnection, new_user: NewUserVaultArgs) -> DbResult<Locked<UserVault>> {
        let user_vault = diesel::insert_into(user_vault::table)
            .values(new_user)
            .get_result::<UserVault>(conn)?;
        Ok(Locked::new(user_vault))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_vault)]
pub struct NewUserVaultArgs {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub is_portable: bool,
}

pub struct NewUserInfo {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
}

pub struct NewNonPortableUserVaultReq {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub tenant_id: TenantId,
}
