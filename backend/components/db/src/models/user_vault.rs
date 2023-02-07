use crate::schema::user_vault::{self, BoxedQuery};
use crate::schema::{onboarding, scoped_user};
use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, QueryDsl, Queryable};
use itertools::Itertools;
use newtypes::{
    EncryptedVaultPrivateKey, Fingerprint, FootprintUserId, Locked, OnboardingId, ScopedUserId, TenantId,
    UserVaultId, VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;
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

    #[tracing::instrument(skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<Self>
    where
        T: Into<UserVaultIdentifier<'a>>,
    {
        let user = Self::query(id.into()).first(conn)?;
        Ok(user)
    }

    #[tracing::instrument(skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &UserVaultId) -> DbResult<Locked<Self>> {
        let user = user_vault::table
            .filter(user_vault::id.eq(id))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }

    #[tracing::instrument(skip_all)]
    pub fn lock_by_scoped_user(conn: &mut TxnPgConn, su_id: &ScopedUserId) -> DbResult<Locked<Self>> {
        let uv_ids = scoped_user::table
            .filter(scoped_user::id.eq(su_id))
            .select(scoped_user::user_vault_id);
        let user = user_vault::table
            .filter(user_vault::id.eq_any(uv_ids))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }

    #[tracing::instrument(skip_all)]
    pub fn multi_get(conn: &mut PgConn, ids: Vec<&ScopedUserId>) -> DbResult<Vec<Self>> {
        let uv_ids = scoped_user::table
            .filter(scoped_user::id.eq_any(ids))
            .select(scoped_user::user_vault_id);
        let users = user_vault::table
            .filter(user_vault::id.eq_any(uv_ids))
            .load::<Self>(conn)?;
        Ok(users)
    }

    #[tracing::instrument(skip_all)]
    pub fn create(conn: &mut PgConn, new_user: NewUserVaultArgs) -> DbResult<Locked<UserVault>> {
        let user_vault = diesel::insert_into(user_vault::table)
            .values(new_user)
            .get_result::<UserVault>(conn)?;
        Ok(Locked::new(user_vault))
    }

    /// Create a NON-portable, tenant-scoped vault + a scoped user for the tenant and the vault
    #[tracing::instrument(skip_all)]
    pub fn create_non_portable(
        conn: &mut TxnPgConn,
        req: NewNonPortableUserVaultReq,
    ) -> DbResult<ScopedUser> {
        let NewNonPortableUserVaultReq {
            e_private_key,
            public_key,
            is_live,
            tenant_id,
        } = req;

        let new_user_vault = NewUserVaultArgs {
            e_private_key,
            public_key,
            is_live,
            is_portable: false,
        };
        let user_vault = Self::create(conn, new_user_vault)?;
        let scoped_user = ScopedUser::create_non_portable(conn, user_vault, tenant_id)?;

        Ok(scoped_user)
    }

    #[tracing::instrument(skip_all)]
    /// Look for the portable user vault with a matching fingerprint
    #[tracing::instrument(skip_all)]
    pub fn find_portable(conn: &mut PgConn, sh_data: Fingerprint) -> DbResult<Option<UserVault>> {
        use crate::schema::{data_lifetime, fingerprint};

        let results = user_vault::table
            .inner_join(data_lifetime::table.inner_join(fingerprint::table))
            .filter(fingerprint::sh_data.eq(sh_data))
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Never allow finding a vault-only, non-portable user vault created via API
            .filter(user_vault::is_portable.eq(true))
            .select(user_vault::all_columns)
            .get_results::<UserVault>(conn)?;

        // we found more than 1 vault on this fingerprint
        if results.len() > 1 {
            // find the unique vaults for this fingerprint
            let unique: Vec<_> = results.into_iter().unique_by(|uv| uv.id.clone()).collect();
            if unique.len() == 1 {
                return Ok(unique.into_iter().next());
            }

            // in this case, more than 1 vault have non-verified claims for this email address
            // so we cannot be sure which user vault we are trying to identify
            tracing::info!("found more than one vault for fingerprint");
            return Ok(None);
        }

        Ok(results.into_iter().next())
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
