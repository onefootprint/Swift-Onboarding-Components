use crate::{DbError, PgConn};
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::scoped_vault;
use db_schema::schema::vault::{self, BoxedQuery};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::upsert::on_constraint;
use diesel::{Insertable, QueryDsl, Queryable};
use itertools::Itertools;
use newtypes::{
    EncryptedVaultPrivateKey, Fingerprint, FpId, IdempotencyId, Locked, SandboxId, ScopedVaultId, TenantId,
    VaultId, VaultKind, VaultPublicKey,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::IsLive;
pub type IsFixture = bool;
pub type IsNew = bool;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable, PartialEq)]
#[diesel(table_name = vault)]
pub struct Vault {
    pub id: VaultId,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive, // true IFF sandbox_id is null
    /// True if the user was created via bifrost. False if the user was made via API and won't be portablized
    pub is_portable: bool,
    pub kind: VaultKind,
    /// A subset of the sandbox, non-is-live users are "fixture" users created specifically with
    /// the fixture phone number. They have a few special properties, like they should never make
    /// global fingerprints so they can not be identified outside of the tenant that created them
    pub is_fixture: IsFixture,
    pub idempotency_id: Option<IdempotencyId>,
    /// The sandbox identifier for this vault. Must be provided for vaults where is_live = false.
    /// The sandbox identifier helps to differentiate multiple sandbox vaults made with the same
    /// phone number / email.
    pub sandbox_id: Option<SandboxId>, // is_none() IFF is_live
}

pub enum VaultIdentifier<'a> {
    Id(&'a VaultId),
    ScopedVaultId(&'a ScopedVaultId),
    FpId {
        fp_id: &'a FpId,
        tenant_id: &'a TenantId,
        is_live: IsLive,
    },
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
        }
    }

    #[tracing::instrument("Vault::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<Self>
    where
        T: Into<VaultIdentifier<'a>>,
    {
        let user = Self::query(id.into()).first(conn)?;
        Ok(user)
    }

    #[tracing::instrument("Vault::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &VaultId) -> DbResult<Locked<Self>> {
        let user = vault::table
            .filter(vault::id.eq(id))
            .for_no_key_update()
            .first(conn.conn())?;
        Ok(Locked::new(user))
    }

    #[tracing::instrument("Vault::lock_by_scoped_user", skip_all)]
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

    #[tracing::instrument("Vault::multi_get", skip_all)]
    pub fn multi_get(conn: &mut PgConn, ids: Vec<&ScopedVaultId>) -> DbResult<Vec<Self>> {
        let uv_ids = scoped_vault::table
            .filter(scoped_vault::id.eq_any(ids))
            .select(scoped_vault::vault_id);
        let users = vault::table.filter(vault::id.eq_any(uv_ids)).load::<Self>(conn)?;
        Ok(users)
    }

    #[tracing::instrument("Vault::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, new_user: NewVaultArgs) -> DbResult<Locked<Vault>> {
        let (uv, _) = Self::insert(conn, new_user, None)?;
        Ok(uv)
    }

    #[tracing::instrument("Vault::lock_by_idempotency_id", skip_all)]
    fn lock_by_idempotency_id(conn: &mut TxnPgConn, i_id: &IdempotencyId) -> DbResult<Option<Locked<Vault>>> {
        let vault = vault::table
            .filter(vault::idempotency_id.eq(i_id))
            .for_no_key_update()
            .first(conn.conn())
            .optional()?;
        Ok(vault.map(Locked::new))
    }

    #[tracing::instrument("Vault::insert", skip_all)]
    pub(super) fn insert(
        conn: &mut TxnPgConn,
        new_user: NewVaultArgs,
        idempotency_id: Option<IdempotencyId>,
    ) -> DbResult<(Locked<Vault>, IsNew)> {
        let existing_vault = idempotency_id
            .as_ref()
            .map(|i_id| Self::lock_by_idempotency_id(conn, i_id))
            .transpose()?
            .flatten();
        if let Some(existing_vault) = existing_vault {
            return Ok((existing_vault, false));
        }
        let NewVaultArgs {
            e_private_key,
            public_key,
            is_live,
            is_portable,
            kind,
            is_fixture,
            sandbox_id,
        } = new_user;
        let new_user = NewVaultRow {
            id: VaultId::generate(kind),
            e_private_key,
            public_key,
            is_live,
            is_portable,
            kind,
            is_fixture,
            idempotency_id: idempotency_id.clone(),
            sandbox_id,
        };

        let vault = diesel::insert_into(vault::table)
            .values(new_user)
            .on_conflict(on_constraint("vault_idempotency_id_key"))
            .do_nothing()
            .get_result::<Vault>(conn.conn())
            .optional()?;

        // Since two requests in very rapid succession with the same idempotency ID can both
        // reach the INSERT statement above, catch constraint violation by checking if there's
        // a vault with this idempotency ID
        match vault {
            Some(vault) => Ok((Locked::new(vault), true)),
            None => {
                let vault = idempotency_id
                    .map(|i_id| Self::lock_by_idempotency_id(conn, &i_id))
                    .transpose()?
                    .flatten()
                    .ok_or(DbError::ObjectNotFound)?;
                Ok((vault, false))
            }
        }
    }

    /// Look for the portable user vault with a matching fingerprint
    #[tracing::instrument("Vault::find_portable", skip_all)]
    pub fn find_portable(
        conn: &mut PgConn,
        sh_data: &[Fingerprint],
        sandbox_id: Option<SandboxId>,
    ) -> DbResult<Option<Vault>> {
        use db_schema::schema::{data_lifetime, fingerprint};

        let mut query = vault::table
            .inner_join(data_lifetime::table.inner_join(fingerprint::table))
            .filter(fingerprint::sh_data.eq_any(sh_data))
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Never allow finding a vault-only, non-portable user vault created via API
            .filter(vault::is_portable.eq(true))
            .into_boxed();

        query = if let Some(sandbox_id) = sandbox_id {
            query.filter(vault::sandbox_id.eq(sandbox_id))
        } else {
            query.filter(vault::sandbox_id.is_null())
        };

        let results = query.select(vault::all_columns).get_results::<Vault>(conn)?;

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
    is_fixture: IsFixture,
    idempotency_id: Option<IdempotencyId>,
    sandbox_id: Option<SandboxId>,
}

pub struct NewVaultArgs {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub is_portable: bool,
    pub kind: VaultKind,
    pub is_fixture: IsFixture,
    pub sandbox_id: Option<SandboxId>,
}
