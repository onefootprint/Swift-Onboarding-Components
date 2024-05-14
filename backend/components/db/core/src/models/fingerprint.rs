use chrono::{DateTime, Utc};
use db_schema::schema::{fingerprint, fingerprint_junction, scoped_vault};
use diesel::{
    dsl::{count_distinct, not},
    prelude::*,
    Queryable,
};
use itertools::Itertools;
use newtypes::{
    DataIdentifier as DI, DataLifetimeId, Fingerprint as FingerprintData, FingerprintId,
    FingerprintScopeKind, FingerprintVersion, IdentityDataKind as IDK, PiiString, ScopedVaultId, TenantId,
    VaultId,
};

use crate::{DbError, DbResult, PgConn, TxnPgConn};

use super::scoped_vault::ScopedVault;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = fingerprint)]
pub struct Fingerprint {
    pub id: FingerprintId,
    /// Secure hash of data if this DI is stored encrypted. Cannot be set if p_data is set
    pub sh_data: Option<FingerprintData>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// Denormalized from the DataLifetime table in order to add uniqueness constraints on fingerprints
    pub kind: DI,
    /// Version of the fingerprint schema
    pub version: FingerprintVersion,
    /// scope to which fingerprint was created for
    pub scope: FingerprintScopeKind,
    /// True if we want to hide this fingerprint from search results.
    /// This is only set manually through a dbshell
    pub is_hidden: bool,

    /// Denormalized from scoped_vault
    pub scoped_vault_id: ScopedVaultId,
    /// Denormalized from scoped_vault
    pub vault_id: VaultId,
    /// Denormalized from scoped_vault
    pub tenant_id: TenantId,
    /// Denormalized from scoped_vault
    pub is_live: bool,
    /// ~Denormalized from data_lifetime. Won't be the exact timestamp from the data_lifetime, but
    /// this is set at the same time the DataLifetimes are deactivated
    pub deactivated_at: Option<DateTime<Utc>>,
    /// Plaintext data if this DI is stored in plaintext. Cannot be set if sh_data is set
    pub p_data: Option<PiiString>,
}

#[derive(Debug, Clone, derive_more::From)]
/// A fingerprint may have either a hashed value or a plaintext value
pub enum FingerprintDataValue {
    Hash(FingerprintData),
    Plaintext(PiiString),
}

#[derive(Debug, Clone)]
pub struct NewFingerprintArgs<'a> {
    pub data: FingerprintDataValue,
    pub kind: DI,
    pub lifetime_id: &'a DataLifetimeId,
    pub version: FingerprintVersion,
    pub scope: FingerprintScopeKind,
    pub scoped_vault_id: &'a ScopedVaultId,
    pub vault_id: &'a VaultId,
    pub tenant_id: &'a TenantId,
    pub is_live: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = fingerprint)]
struct NewFingerprintRow<'a> {
    id: FingerprintId,
    sh_data: Option<FingerprintData>,
    p_data: Option<PiiString>,
    kind: DI,
    version: FingerprintVersion,
    scope: FingerprintScopeKind,
    is_hidden: bool,
    scoped_vault_id: &'a ScopedVaultId,
    vault_id: &'a VaultId,
    tenant_id: &'a TenantId,
    is_live: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = fingerprint_junction)]
struct NewFingerprintJunction<'a> {
    fingerprint_id: FingerprintId,
    lifetime_id: &'a DataLifetimeId,
}


impl Fingerprint {
    #[tracing::instrument("Fingerprint::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, fingerprints: Vec<NewFingerprintArgs>) -> DbResult<()> {
        for fp in fingerprints.iter() {
            if !fp.kind.is_fingerprintable() {
                return Err(DbError::ValidationError(format!(
                    "Fingerprinting DI that is not fingerprintable {}",
                    fp.kind
                )));
            }
            if matches!(fp.data, FingerprintDataValue::Plaintext(_)) && !fp.kind.store_plaintext() {
                return Err(DbError::ValidationError(format!(
                    "Cannot save plaintext fingerprint with kind {}",
                    fp.kind
                )));
            }
            if fp.scope == FingerprintScopeKind::Global && !fp.kind.is_globally_fingerprintable() {
                return Err(DbError::ValidationError(format!(
                    "Fingerprinting DI that is not globally fingerprintable {}",
                    fp.kind
                )));
            }
        }
        let (fingerprints, fp_junctions): (Vec<_>, Vec<_>) = fingerprints
            .into_iter()
            .map(|args| {
                let NewFingerprintArgs {
                    data,
                    kind,
                    lifetime_id,
                    version,
                    scope,
                    scoped_vault_id,
                    vault_id,
                    tenant_id,
                    is_live,
                } = args;
                let (sh_data, p_data) = match data {
                    FingerprintDataValue::Hash(data) => (Some(data), None),
                    FingerprintDataValue::Plaintext(data) => (None, Some(data)),
                };
                // I don't trust postgres to always return fingerprints in the order we insert them,
                // so let's make the ID in RAM so we have a stable identifier
                let id = FingerprintId::generate();
                let new_fp = NewFingerprintRow {
                    id: id.clone(),
                    sh_data,
                    p_data,
                    kind,
                    version,
                    scope,
                    is_hidden: false,
                    scoped_vault_id,
                    vault_id,
                    tenant_id,
                    is_live,
                };
                let fp_junctions = vec![NewFingerprintJunction {
                    fingerprint_id: id,
                    lifetime_id,
                }];
                (new_fp, fp_junctions)
            })
            .unzip();
        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;

        // Insert records in the junction table to show which lifetimes owns which fingerprints
        let junctions = fp_junctions.into_iter().flatten().collect_vec();
        diesel::insert_into(fingerprint_junction::table)
            .values(junctions)
            .execute(conn.conn())?;
        Ok(())
    }

    #[tracing::instrument("Fingerprint::bulk_deactivate", skip_all)]
    pub fn bulk_deactivate(
        conn: &mut TxnPgConn,
        lifetime_ids: Vec<&DataLifetimeId>,
        time: DateTime<Utc>,
    ) -> DbResult<()> {
        let fp_ids = fingerprint_junction::table
            .filter(fingerprint_junction::lifetime_id.eq_any(lifetime_ids))
            .select(fingerprint_junction::fingerprint_id);
        diesel::update(fingerprint::table)
            .filter(fingerprint::id.eq_any(fp_ids))
            .set(fingerprint::deactivated_at.eq(time))
            .execute(conn.conn())?;
        Ok(())
    }
}

pub struct FingerprintDupesResult {
    /// The fingerprint rows belonging to other users in the same tenant that have matching duplicate data
    pub internal: Vec<Fingerprint>,
    pub external: Option<ExternalDupes>,
}

pub struct ExternalDupes {
    /// The total number of vaults at other tenants that have matching duplicate data
    pub num_users: i64,
    /// The total number of other tenants that have
    pub num_tenants: i64,
}

impl Fingerprint {
    const DUPLICATE_FINGERPRINT_KINDS: [DI; 3] =
        [DI::Id(IDK::PhoneNumber), DI::Id(IDK::Email), DI::Id(IDK::Ssn9)];

    #[tracing::instrument("Fingerprint::get_dupes", skip_all)]
    pub fn get_dupes(conn: &mut PgConn, sv: &ScopedVault) -> DbResult<FingerprintDupesResult> {
        let sh_datas = fingerprint::table
            .filter(fingerprint::scoped_vault_id.eq(&sv.id))
            .filter(fingerprint::deactivated_at.is_null())
            .filter(fingerprint::kind.eq_any(Self::DUPLICATE_FINGERPRINT_KINDS))
            .filter(fingerprint::sh_data.is_not_null())
            .select(fingerprint::sh_data.assume_not_null())
            .get_results::<FingerprintData>(conn)?;

        let q_dupes = fingerprint::table
            .filter(fingerprint::sh_data.is_not_null())
            .filter(fingerprint::sh_data.eq_any(&sh_datas))
            .filter(fingerprint::deactivated_at.is_null())
            .filter(fingerprint::is_live.eq(sv.is_live))
            .filter(fingerprint::vault_id.ne(&sv.vault_id))
            // TODO when we stop making unverified vaults after each signup challenge, remove this
            // logic. It will be horribly slow
            .inner_join(scoped_vault::table)
            .filter(scoped_vault::show_in_search.eq(true))
            .select(fingerprint::all_columns);

        // TODO hide dupes at other tenants in sandbox in next PR
        let internal_matches = q_dupes
            .clone()
            .filter(fingerprint::tenant_id.eq(&sv.tenant_id))
            // TODO weird things will happen when there are more than 100 dupes
            .limit(100)
            .order_by(fingerprint::vault_id)
            .get_results::<Self>(conn)?;

        let external = if sv.is_live {
            let v_ids_with_dupes_at_tenant = internal_matches.iter().map(|f| &f.vault_id).collect_vec();
            let (num_users, num_tenants) = q_dupes
                .filter(fingerprint::tenant_id.ne(&sv.tenant_id))
                .filter(not(fingerprint::vault_id.eq_any(v_ids_with_dupes_at_tenant)))
                .select((
                    count_distinct(fingerprint::vault_id),
                    count_distinct(fingerprint::tenant_id),
                ))
                .get_result(conn)?;

            Some(ExternalDupes {
                num_users,
                num_tenants,
            })
        } else {
            // No need to look for external matches in sandbox - lots of false positives with
            // sandbox phone number
            None
        };

        let res = FingerprintDupesResult {
            internal: internal_matches,
            external,
        };
        Ok(res)
    }
}
