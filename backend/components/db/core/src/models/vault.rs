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
    DataIdentifier, EncryptedVaultPrivateKey, Fingerprint, FpId, IdempotencyId, Locked, SandboxId,
    ScopedVaultId, TenantId, VaultId, VaultKind, VaultPublicKey,
};

use super::ob_configuration::IsLive;
pub type IsFixture = bool;
pub type IsNew = bool;

#[derive(Debug, Clone, Queryable, Insertable, Identifiable, PartialEq)]
#[diesel(table_name = vault)]
pub struct Vault {
    pub id: VaultId,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive, // true IFF sandbox_id is null
    /// TODO In the process of migrating this
    /// True if the user is considered a PID.
    /// This is used in airplane metrics to report how many PIDs we have. Be very careful when
    /// changing the meaning of this.
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
    /// True if the user was created via tenant-facing API rather than via bifrost
    pub is_created_via_api: bool,
    /// True if the vault has been OTP verified through the identify flow
    pub is_verified: bool,
    pub created_at: DateTime<Utc>,
    /// True if the user can be found in /identify
    pub is_identifiable: bool,
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

    #[tracing::instrument("Vault::mark_verified", skip_all)]
    pub fn mark_verified(conn: &mut TxnPgConn, id: &VaultId) -> DbResult<()> {
        diesel::update(vault::table)
            .filter(vault::id.eq(id))
            .set(vault::is_verified.eq(true))
            .execute(conn.conn())?;
        Ok(())
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
            kind,
            is_fixture,
            sandbox_id,
            is_created_via_api,
        } = new_user;
        let new_user = NewVaultRow {
            id: VaultId::generate(kind),
            e_private_key,
            public_key,
            is_live,
            kind,
            is_fixture,
            idempotency_id: idempotency_id.clone(),
            sandbox_id,
            is_created_via_api,
            // Vault isn't portable if it starts out created via API
            is_portable: !is_created_via_api,
            // All vaults start as is_verified = false, marked as verified after succesful identify
            // flow
            is_verified: false,
            // Only identifiable if created via bifrost
            is_identifiable: !is_created_via_api,
            created_at: Utc::now(),
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

    #[tracing::instrument("Vault::mark_portable", skip_all)]
    /// Mark the provided vault as portable
    pub fn mark_portable(conn: &mut TxnPgConn, id: &VaultId) -> DbResult<()> {
        diesel::update(vault::table)
            .filter(vault::id.eq(id))
            .set((
                vault::is_portable.eq(true),
                // When a vault becomes portable, it also becomes identifiable.
                // This has the effect of allowing vaults initially created via API to now be
                // identifiable when they become a PID
                vault::is_identifiable.eq(true),
            ))
            .execute(conn.conn())?;
        Ok(())
    }
}

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Clone, Copy)]
/// When selecting which vault to log into of many vaults matching a Fingerprint, this struct
/// represents the order-able Priority of each.
pub(crate) struct Priority {
    //
    // These are the two most important ordering criteria.
    //
    /// Prefer logging into a vault that already has an fp_id at this tenant rather than making a
    /// new fp_id for another vault.
    /// For ex, tenant A has a vault made via API. Tenant B has a vault made via bifrost.
    /// Tenant A should log into its vault, tenant B should log into its vault
    /// DO NOT CHANGE THIS
    pub(crate) has_sv_at_tenant: Option<bool>,
    /// Prefer vaults that have been onboarded to more tenants. If there are duplicate vaults, this
    /// ensures that one vault will become the winner as soon as a one-click occurs - future
    /// onboardings will then continue to choose the same vault
    /// DO NOT CHANGE THIS
    pub(crate) num_svs: usize,

    //
    // The below are more heuristics to choose the best result amongst many. There's more
    // flexibility in changing these
    //
    /// Prefer vaults that have more portable data.
    /// For example, one vault maybe verified an OTP and has a portable phone, while another vault
    /// finished onboarding and has a fully portable set of data
    pub(crate) num_portable_dis: usize,
    /// Prefer vaults created via Footprint's UI vs via tenant-facing API
    pub(crate) is_created_via_bifrost: bool,
    /// All else equal, just get the oldest vault
    pub(crate) neg_created_at: i64,
}

impl Vault {
    /// Given a fingerprint search parameter, find the Vault that we should log into.
    /// When there are multiple vaults matching the search, we choose somewhat arbitrarily
    /// (but consistenly) which vault to log into.
    #[tracing::instrument("Vault::find_portable", skip_all)]
    pub fn find_portable(
        conn: &mut PgConn,
        sh_data: &[Fingerprint],
        sandbox_id: Option<SandboxId>,
        tenant_id: Option<&TenantId>,
    ) -> DbResult<Option<Vault>> {
        use crate::models::scoped_vault::ScopedVault;
        use db_schema::schema::{data_lifetime, fingerprint};

        // Look for verified vaults marked `is_portable` and `is_verified`
        // that also have portable, active data matching the fingerprint
        // and a matching sandbox_id, if provided
        let mut query = vault::table
            .inner_join(data_lifetime::table.inner_join(fingerprint::table))
            .filter(fingerprint::sh_data.eq_any(sh_data))
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            // When we allow replacing contact info, we might want to support finding the vault on
            // deactivated fingerprints in case the portable data is replaced by tenant-specific data
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Don't identify users that haven't completed an OTP challenge
            .filter(vault::is_verified.eq(true))
            // Never allow identifying a user that is not marked as identifiable.
            // API-only vaults start as non-identifiable until they become PIDs
            .filter(vault::is_identifiable.eq(true))
            .select(vault::all_columns)
            .into_boxed();

        query = if let Some(sandbox_id) = sandbox_id.as_ref() {
            query.filter(vault::sandbox_id.eq(sandbox_id))
        } else {
            query.filter(vault::sandbox_id.is_null())
        };
        let mut vaults: Vec<_> = query.get_results::<Self>(conn)?;

        // And, add in all of the unverified vaults owned by this tenant. This allows portablizing
        // non-portable vaults
        if let Some(tenant_id) = tenant_id {
            let mut query = scoped_vault::table
                .inner_join(data_lifetime::table.inner_join(fingerprint::table))
                .inner_join(vault::table)
                .filter(fingerprint::sh_data.eq_any(sh_data))
                .filter(data_lifetime::portablized_seqno.is_null())
                .filter(data_lifetime::deactivated_seqno.is_null())
                // Un-verified vaults owned by this tenant
                .filter(scoped_vault::tenant_id.eq(tenant_id))
                .filter(vault::is_verified.eq(false))
                .filter(vault::is_identifiable.eq(false))
                .select(vault::all_columns)
                .into_boxed();
            query = if let Some(sandbox_id) = sandbox_id.as_ref() {
                query.filter(vault::sandbox_id.eq(sandbox_id))
            } else {
                query.filter(vault::sandbox_id.is_null())
            };
            let unverified_vaults: Vec<_> = query.get_results::<Self>(conn)?;
            vaults.extend(unverified_vaults)
        }

        // All of the vaults here presumably are the same user (or same contact info) that has,
        // for one reason or another, been duplicated around the Footprint ecosystem.
        // Perhaps the user onboarded onto tenant A and then tenant B created an identical user via API.
        // Now, we have to figure out which of the duplicate vaults we want to log into.
        let vaults = vaults.into_iter().unique_by(|v| v.id.clone()).collect_vec();
        let v_ids = vaults.iter().map(|v| &v.id).collect_vec();

        // Get the scoped vaults for each vault
        let v_id_to_svs = scoped_vault::table
            .filter(scoped_vault::vault_id.eq_any(v_ids.clone()))
            .get_results::<ScopedVault>(conn)?
            .into_iter()
            .into_group_map_by(|sv| sv.vault_id.clone());

        // Get a mapping of vault_id -> Vec<DI> of all DIs that have been portablized at this vault
        let v_id_to_portable_dis = data_lifetime::table
            .filter(data_lifetime::vault_id.eq_any(v_ids))
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            .select((data_lifetime::vault_id, data_lifetime::kind))
            .get_results::<(VaultId, DataIdentifier)>(conn)?
            .into_iter()
            .unique()
            .into_group_map();

        // Find the vault with the highest priority. Some of these criteria are required for
        // correctness, and others are heuristics to select the best of many duplicate vaults
        let highest_priority = vaults
            .into_iter()
            .map(|vault| {
                // True if the vault already has a scoped vault at the tenatn
                let empty = vec![];
                let svs = v_id_to_svs.get(&vault.id).unwrap_or(&empty);
                let has_sv_at_tenant = tenant_id.map(|t_id| svs.iter().any(|sv| &sv.tenant_id == t_id));
                // The number of DIs that have been marked as portable on this vault
                let num_portable_dis = v_id_to_portable_dis
                    .get(&vault.id)
                    .map(|dis| dis.len())
                    .unwrap_or_default();
                let priority = Priority {
                    has_sv_at_tenant,
                    num_svs: svs.len(),
                    num_portable_dis,
                    is_created_via_bifrost: !vault.is_created_via_api,
                    neg_created_at: -vault.created_at.timestamp_micros(),
                };
                (priority, vault)
            })
            .max_by_key(|(p, _)| *p)
            .map(|(_, v)| v);

        Ok(highest_priority)
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
    is_created_via_api: bool,
    is_verified: bool,
    created_at: DateTime<Utc>,
    is_identifiable: bool,
}

pub struct NewVaultArgs {
    pub e_private_key: EncryptedVaultPrivateKey,
    pub public_key: VaultPublicKey,
    pub is_live: IsLive,
    pub kind: VaultKind,
    pub is_fixture: IsFixture,
    pub sandbox_id: Option<SandboxId>,
    pub is_created_via_api: bool,
}
