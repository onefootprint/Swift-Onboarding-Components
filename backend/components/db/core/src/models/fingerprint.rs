use std::collections::HashMap;

use chrono::{DateTime, Utc};
use db_schema::schema::{data_lifetime, fingerprint, scoped_vault};
use diesel::{prelude::*, Queryable};
use itertools::Itertools;
use newtypes::{
    DataIdentifier, DataIdentifier as DI, DataLifetimeId, Fingerprint as FingerprintData, FingerprintId,
    FingerprintScopeKind, FingerprintVersion, FpId, IdentityDataKind as IDK, ScopedVaultId, TenantId,
    VaultId,
};

use crate::{DbResult, PgConn, TxnPgConn};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = fingerprint)]
pub struct Fingerprint {
    pub id: FingerprintId,
    pub sh_data: FingerprintData,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// Denormalized from the DataLifetime table in order to add uniqueness constraints on fingerprints
    pub kind: DataIdentifier,
    pub lifetime_id: DataLifetimeId,
    /// Version of the fingerprint schema
    pub version: FingerprintVersion,
    /// scope to which fingerprint was created for
    pub scope: FingerprintScopeKind,
    /// True if we want to hide this fingerprint from search results.
    /// This is only set manually through a dbshell
    pub is_hidden: bool,
}

#[derive(Debug, Clone)]
pub struct NewFingerprintArgs {
    pub sh_data: FingerprintData,
    pub kind: DataIdentifier,
    pub lifetime_id: DataLifetimeId,
    pub version: FingerprintVersion,
    pub scope: FingerprintScopeKind,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = fingerprint)]
struct NewFingerprintRow {
    sh_data: FingerprintData,
    kind: DataIdentifier,
    lifetime_id: DataLifetimeId,
    version: FingerprintVersion,
    scope: FingerprintScopeKind,
    is_hidden: bool,
}

pub type IsUnique = bool;
pub type DuplicateExistingFingerprintsByDLK = HashMap<DataIdentifier, i64>;

const DUPLICATE_FINGERPRINT_KINDS: [DI; 3] =
    [DI::Id(IDK::PhoneNumber), DI::Id(IDK::Email), DI::Id(IDK::Ssn9)];

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct FingerprintDupe {
    pub fp_id: FpId,
    pub tenant_id: TenantId,
    pub vault_id: VaultId,
    pub kind: DataIdentifier,
    pub scope: FingerprintScopeKind,
}

impl From<(FpId, TenantId, VaultId, DataIdentifier, FingerprintScopeKind)> for FingerprintDupe {
    fn from(
        (fp_id, tenant_id, vault_id, kind, scope): (
            FpId,
            TenantId,
            VaultId,
            DataIdentifier,
            FingerprintScopeKind,
        ),
    ) -> Self {
        Self {
            fp_id,
            tenant_id,
            vault_id,
            kind,
            scope,
        }
    }
}

impl Fingerprint {
    #[tracing::instrument("Fingerprint::create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, fingerprints: Vec<NewFingerprintArgs>) -> DbResult<()> {
        for fp in fingerprints.iter() {
            if !fp.kind.is_fingerprintable() {
                tracing::error!(di=%fp.kind, "Fingerprinting DI that is not fingerprintable");
            }
            if fp.scope == FingerprintScopeKind::Global && !fp.kind.is_globally_fingerprintable() {
                tracing::error!(di=%fp.kind, "Fingerprinting DI that is not globally fingerprintable");
            }
        }
        let fingerprints = fingerprints
            .into_iter()
            .map(
                |NewFingerprintArgs {
                     sh_data,
                     kind,
                     lifetime_id,
                     version,
                     scope,
                 }| NewFingerprintRow {
                    sh_data,
                    kind,
                    lifetime_id,
                    version,
                    scope,
                    is_hidden: false,
                },
            )
            .collect_vec();
        diesel::insert_into(fingerprint::table)
            .values(fingerprints)
            .execute(conn.conn())?;
        Ok(())
    }

    #[tracing::instrument("Fingerprint::get_dupes", skip_all)]
    pub fn get_dupes(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Vec<FingerprintDupe>> {
        let (f1, dl1, sv1, f2, dl2, sv2) = diesel::alias!(
            fingerprint as f1,
            data_lifetime as dl1,
            scoped_vault as sv1,
            fingerprint as f2,
            data_lifetime as dl2,
            scoped_vault as sv2
        );

        let res = f1
            .filter(f1.field(fingerprint::kind).eq_any(DUPLICATE_FINGERPRINT_KINDS))
            .inner_join(
                dl1.on(dl1
                    .field(data_lifetime::id)
                    .eq(f1.field(fingerprint::lifetime_id))
                    .and(dl1.field(data_lifetime::deactivated_seqno).is_null())), //only query on latest/active data
            )
            .inner_join(
                sv1.on(sv1
                    .field(scoped_vault::id)
                    .eq(dl1.field(data_lifetime::scoped_vault_id))),
            )
            .inner_join(
                f2.on(f1
                    .field(fingerprint::id)
                    .ne(f2.field(fingerprint::id))
                    .and(f1.field(fingerprint::sh_data).eq(f2.field(fingerprint::sh_data)))
                    .and(f1.field(fingerprint::scope).eq(f2.field(fingerprint::scope)))
                    .and(f1.field(fingerprint::kind).eq(f2.field(fingerprint::kind)))),
            )
            .inner_join(
                dl2.on(dl2
                    .field(data_lifetime::id)
                    .eq(f2.field(fingerprint::lifetime_id))
                    .and(
                        dl2.field(data_lifetime::vault_id)
                            .ne(dl1.field(data_lifetime::vault_id)),
                    )
                    .and(dl2.field(data_lifetime::deactivated_seqno).is_null())), //only query on latest/active data
            )
            .inner_join(
                sv2.on(sv2
                    .field(scoped_vault::id)
                    .eq(dl2.field(data_lifetime::scoped_vault_id))),
            )
            .filter(sv1.field(scoped_vault::id).eq(sv_id))
            .select((
                sv2.field(scoped_vault::fp_id),
                sv2.field(scoped_vault::tenant_id),
                sv2.field(scoped_vault::vault_id),
                f1.field(fingerprint::kind),
                f1.field(fingerprint::scope),
            ))
            .get_results::<(FpId, TenantId, VaultId, DataIdentifier, FingerprintScopeKind)>(conn)?
            .into_iter()
            .map(FingerprintDupe::from)
            .collect();
        Ok(res)
    }
}
