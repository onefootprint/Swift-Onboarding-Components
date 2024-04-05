use std::collections::HashMap;

use chrono::{DateTime, Utc};
use db_schema::schema::{data_lifetime, fingerprint, scoped_vault, vault};
use diesel::{prelude::*, Queryable};
use itertools::Itertools;
use newtypes::{
    DataIdentifier, DataIdentifier as DI, DataLifetimeId, Fingerprint as FingerprintData, FingerprintId,
    FingerprintScopeKind, FingerprintVersion, IdentityDataKind as IDK, ScopedVaultId,
};

use crate::{DbResult, PgConn, TxnPgConn};

use super::{scoped_vault::ScopedVault, vault::Vault};

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

#[derive(Debug, Clone)]
pub struct FingerprintDupe {
    pub kind: DataIdentifier,
    pub scope: FingerprintScopeKind, // TODO: is this used?
    pub scoped_vault: ScopedVault,
    pub vault: Vault,
}

impl From<(DataIdentifier, FingerprintScopeKind, ScopedVault, Vault)> for FingerprintDupe {
    fn from(
        (kind, scope, scoped_vault, vault): (DataIdentifier, FingerprintScopeKind, ScopedVault, Vault),
    ) -> Self {
        Self {
            kind,
            scope,
            scoped_vault,
            vault,
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
        let (f1, dl1, sv1, f2, dl2, sv2, v2) = diesel::alias!(
            fingerprint as f1,
            data_lifetime as dl1,
            scoped_vault as sv1,
            fingerprint as f2,
            data_lifetime as dl2,
            scoped_vault as sv2,
            vault as v2
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
            .inner_join(
                v2.on(v2
                    .field(vault::id)
                    .eq(sv2.field(scoped_vault::vault_id))),
            )
            .filter(sv1.field(scoped_vault::id).eq(sv_id))
            .filter(sv1.field(scoped_vault::is_live).eq(sv2.field(scoped_vault::is_live)))
            .select((
                f1.field(fingerprint::kind),
                f1.field(fingerprint::scope),
                sv2.fields(scoped_vault::all_columns),
                v2.fields(vault::all_columns)
            ))
            // For now, order by SV timestamp so we return consistent results and prioritize newer dupes vs older dupes which feels reasonable
            // Note: other-tenant dupes here could "thrash" the same-tenant dupes (which are perhaps more important) so in addition to adding proper pagination or whatnot, it might be beneficial to separately query for same-tenant vs other-tenant dupes.
            // Furthermore, now that we can downscoped the other-tenant dupes to just be a few stats, we could instead make this whole thing a boxed query and then for the other-tenant dupes, we could just `count`/`distinct` to produce our stats and not need to retrieve individual rows. (although maybe we will revisit that design soon enough anyway and then need other-tenant rows again)
            .order_by(sv2.field(scoped_vault::start_timestamp).desc())
            .limit(30) // for safety
            .get_results::<(DataIdentifier, FingerprintScopeKind, ScopedVault, Vault)>(conn)?
            .into_iter()
            .map(FingerprintDupe::from)
            .collect();
        Ok(res)
    }
}
