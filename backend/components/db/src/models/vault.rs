use crate::schema::vault::{self, BoxedQuery};
use crate::schema::{onboarding, scoped_vault};
use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, QueryDsl, Queryable};
use itertools::Itertools;
use newtypes::{
    EncryptedVaultPrivateKey, Fingerprint, FpId, Locked, OnboardingId, ScopedVaultId, TenantId, VaultId,
    VaultKind, VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable, PartialEq)]
#[diesel(table_name = vault)]
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
    ScopedVaultId(&'a ScopedVaultId),
    FpId {
        fp_id: &'a FpId,
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

impl<'a> From<&'a ScopedVaultId> for VaultIdentifier<'a> {
    fn from(id: &'a ScopedVaultId) -> Self {
        Self::ScopedVaultId(id)
    }
}

impl<'a> From<(&'a FpId, &'a TenantId, IsLive)> for VaultIdentifier<'a> {
    fn from((fp_id, tenant_id, is_live): (&'a FpId, &'a TenantId, IsLive)) -> Self {
        Self::FpId {
            fp_id,
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
            VaultIdentifier::Id(id) => vault::table.filter(vault::id.eq(id)).into_boxed(),
            VaultIdentifier::ScopedVaultId(scoped_user_id) => {
                let uv_ids = scoped_vault::table
                    .filter(scoped_vault::id.eq(scoped_user_id))
                    .select(scoped_vault::vault_id);
                vault::table.filter(vault::id.eq_any(uv_ids)).into_boxed()
            }
            VaultIdentifier::FpId {
                fp_id,
                tenant_id,
                is_live,
            } => {
                let uv_ids = scoped_vault::table
                    .filter(scoped_vault::fp_id.eq(fp_id))
                    .filter(scoped_vault::tenant_id.eq(tenant_id))
                    .filter(scoped_vault::is_live.eq(is_live))
                    .select(scoped_vault::vault_id);
                vault::table.filter(vault::id.eq_any(uv_ids)).into_boxed()
            }
            VaultIdentifier::OnboardingId(onboarding_id) => {
                let uv_ids = onboarding::table
                    .filter(onboarding::id.eq(onboarding_id))
                    .inner_join(scoped_vault::table)
                    .select(scoped_vault::vault_id);

                vault::table.filter(vault::id.eq_any(uv_ids)).into_boxed()
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
        let user = vault::table
            .filter(vault::id.eq(id))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }

    #[tracing::instrument(skip_all)]
    pub fn lock_by_scoped_user(conn: &mut TxnPgConn, su_id: &ScopedVaultId) -> DbResult<Locked<Self>> {
        let uv_ids = scoped_vault::table
            .filter(scoped_vault::id.eq(su_id))
            .select(scoped_vault::vault_id);
        let user = vault::table
            .filter(vault::id.eq_any(uv_ids))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }

    #[tracing::instrument(skip_all)]
    pub fn multi_get(conn: &mut PgConn, ids: Vec<&ScopedVaultId>) -> DbResult<Vec<Self>> {
        let uv_ids = scoped_vault::table
            .filter(scoped_vault::id.eq_any(ids))
            .select(scoped_vault::vault_id);
        let users = vault::table.filter(vault::id.eq_any(uv_ids)).load::<Self>(conn)?;
        Ok(users)
    }

    #[tracing::instrument(skip_all)]
    pub fn create(conn: &mut PgConn, new_user: NewVaultArgs) -> DbResult<Locked<Vault>> {
        let NewVaultArgs {
            e_private_key,
            public_key,
            is_live,
            is_portable,
            kind,
        } = new_user;
        let new_user = NewVaultRow {
            id: VaultId::generate(kind),
            e_private_key,
            public_key,
            is_live,
            is_portable,
            kind,
        };
        let vault = diesel::insert_into(vault::table)
            .values(new_user)
            .get_result::<Vault>(conn)?;
        Ok(Locked::new(vault))
    }

    /// Look for the portable user vault with a matching fingerprint
    #[tracing::instrument(skip(conn))]
    pub fn find_portable(conn: &mut PgConn, sh_data: &[Fingerprint]) -> DbResult<Option<Vault>> {
        use crate::schema::{data_lifetime, fingerprint};

        let results = vault::table
            .inner_join(data_lifetime::table.inner_join(fingerprint::table))
            .filter(fingerprint::sh_data.eq_any(sh_data))
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Never allow finding a vault-only, non-portable user vault created via API
            .filter(vault::is_portable.eq(true))
            .select(vault::all_columns)
            .get_results::<Vault>(conn)?;

        tracing::info!("searched portable vaults, found: {}", results.len());

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

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault)]
struct NewVaultRow {
    id: VaultId,
    e_private_key: EncryptedVaultPrivateKey,
    public_key: VaultPublicKey,
    is_live: IsLive,
    is_portable: bool,
    kind: VaultKind,
}

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
