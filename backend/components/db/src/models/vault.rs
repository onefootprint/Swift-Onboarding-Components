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
    VaultId, VaultKind, VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = user_vault)]
pub struct Vault {
    pub id: VaultId,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive,
    pub is_portable: bool,
    pub kind: VaultKind,
}

pub enum VaultIdentifier<'a> {
    Id(&'a VaultId),
    ScopedUserId(&'a ScopedUserId),
    FpUserId {
        fp_user_id: &'a FootprintUserId,
        tenant_id: &'a TenantId,
        is_live: IsLive,
    },
    OnboardingId(&'a OnboardingId),
}

impl<'a> From<&'a VaultId> for VaultIdentifier<'a> {
    fn from(id: &'a VaultId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ScopedUserId> for VaultIdentifier<'a> {
    fn from(id: &'a ScopedUserId) -> Self {
        Self::ScopedUserId(id)
    }
}

impl<'a> From<(&'a FootprintUserId, &'a TenantId, IsLive)> for VaultIdentifier<'a> {
    fn from((fp_user_id, tenant_id, is_live): (&'a FootprintUserId, &'a TenantId, IsLive)) -> Self {
        Self::FpUserId {
            fp_user_id,
            tenant_id,
            is_live,
        }
    }
}

impl<'a> From<&'a OnboardingId> for VaultIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::OnboardingId(id)
    }
}

impl Vault {
    fn query(id: VaultIdentifier) -> BoxedQuery<Pg> {
        match id {
            VaultIdentifier::Id(id) => user_vault::table.filter(user_vault::id.eq(id)).into_boxed(),
            VaultIdentifier::ScopedUserId(scoped_user_id) => {
                let uv_ids = scoped_user::table
                    .filter(scoped_user::id.eq(scoped_user_id))
                    .select(scoped_user::user_vault_id);
                user_vault::table
                    .filter(user_vault::id.eq_any(uv_ids))
                    .into_boxed()
            }
            VaultIdentifier::FpUserId {
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
            VaultIdentifier::OnboardingId(onboarding_id) => {
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
        T: Into<VaultIdentifier<'a>>,
    {
        let user = Self::query(id.into()).first(conn)?;
        Ok(user)
    }

    #[tracing::instrument(skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &VaultId) -> DbResult<Locked<Self>> {
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
    pub fn create(conn: &mut PgConn, new_user: NewVaultArgs) -> DbResult<Locked<Vault>> {
        let user_vault = diesel::insert_into(user_vault::table)
            .values(new_user)
            .get_result::<Vault>(conn)?;
        Ok(Locked::new(user_vault))
    }

    /// Look for the portable user vault with a matching fingerprint
    #[tracing::instrument(skip_all)]
    pub fn find_portable(conn: &mut PgConn, sh_data: Fingerprint) -> DbResult<Option<Vault>> {
        use crate::schema::{data_lifetime, fingerprint};

        let results = user_vault::table
            .inner_join(data_lifetime::table.inner_join(fingerprint::table))
            .filter(fingerprint::sh_data.eq(sh_data))
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Never allow finding a vault-only, non-portable user vault created via API
            .filter(user_vault::is_portable.eq(true))
            .select(user_vault::all_columns)
            .get_results::<Vault>(conn)?;

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
pub struct NewVaultArgs {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub is_portable: bool,
    pub kind: VaultKind,
}

pub struct NewVaultInfo {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
}
