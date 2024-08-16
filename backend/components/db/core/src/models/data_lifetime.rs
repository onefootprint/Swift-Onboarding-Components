use super::fingerprint::Fingerprint;
use super::scoped_vault_version::ScopedVaultVersion;
use crate::nextval;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::data_lifetime::{
    self,
};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::sql_types::Int8;
use diesel::sql_types::{
    self,
};
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DbActor;
use newtypes::ScopedVaultId;
use newtypes::VaultId;

#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = data_lifetime)]
/// DataLifetime is a generic model that allows us to represent the lifecycle of a piece of data
/// that belongs to a user. All pieces of data "belonging" to a user vault share some attributes,
/// and those attributes are all represented here. You will see many models throughout the codebase
/// contain a pointer to a DataLifetime row. Also notable, Fingerprints and the underlying data
/// storage rows point to the same DataLifetime row, which conveniently deactivates fingerprints as
/// soon as the underlying data is deactivated.
///
/// Ownership attributes:
/// - `vault_id`: The user to which this piece of data belongs
/// - `scoped_vault_id`: The scoped_vault that represents during onboarding to which tenant this
///   data was added
///
/// Lifecycle attributes:
/// - `created_at`/`created_seqno`: When the data was created
/// - `portablized_at`/`portablized_seqno`: When the data was committed and made portable. This is
///   usually after is has been verified with data vendors. BUT, it is not synonymous with verified
///   - we also make contact info like phone/email portable as soon as it is added
/// - `deactivated_at`/`deactivated_seqno`: When the data was archived and is no longer active. This
///   may happen if a piece of data is replaced with newer data.
///
/// Access:
/// In the case of portable data, DataLifetimes don't help in all cases with checking if the Tenant
/// ever _requested_ access to that data during an onboarding (via a OB configuration). Since
/// DataLifetimes do not speak in terms of accessing specific data attributes (`kind`s) previously
/// collected, (which is a unique/distinct case from ownership) we associate each DataLifetime with
/// a `kind`, which helps when retrieving data.
///
/// For example:
///   - Tenant A onboards User U, requesting data_lifetime_kind_1 and data_lifetime_kind_2 and both
///     kinds become portable
///   - Tenant B onboards User U, requesting *just* data_lifetime_kind_1. data_lifetime_kind_2 is
///     portable, but Tenant B should not know of it's existence (or read it's value).
///   As currently defined in the DataLifetime model, data_lifetime_kind_1 and data_lifetime_kind_2
/// are owned by U's user_vault, and Tenant A's scoped user for User U.   There is no way in the
/// DataLifetime model to keep an "ACL" with respect to Tenant B visibility of User U's portable
/// data.   Hence, we control this at the UVW level, where we can materialize individual data kinds
/// based on lifetimes and check ACL based on ob configs
///
/// Notably:
/// Each lifecycle attribute is represented both with a human-readable timestamp AND with
/// a machine-readable seqno. The seqno is controlled by a postgres sequence that is incremented
/// when new rows are added/portablized/deactivated. It provides a _total_ ordering of events that
/// occur during the data lifecycle (which cannot always be provided by a timestamp).
///
/// More info here: https://www.notion.so/Data-model-v4-724c993c985748fc85a77f80e9a46f72
pub struct DataLifetime {
    pub id: DataLifetimeId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    // Ownership attributes
    pub vault_id: VaultId,
    pub scoped_vault_id: ScopedVaultId,
    // Lifecycle attributes
    pub created_at: DateTime<Utc>,
    pub portablized_at: Option<DateTime<Utc>>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_seqno: DataLifetimeSeqno,
    pub portablized_seqno: Option<DataLifetimeSeqno>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub kind: DataIdentifier,
    /// Information on how the piece of data was added to the vault
    pub source: DataLifetimeSource,
    /// The actor that added this piece of data to the vault, if not performed by the user
    pub actor: Option<DbActor>,
    /// If this DL was prefilled, the DataLifetime from which it was prefilled
    pub origin_id: Option<DataLifetimeId>,
}

#[derive(Clone, Insertable)]
#[diesel(table_name = data_lifetime)]
struct NewDataLifetime {
    // This is just denormalized for fast querying.
    vault_id: VaultId,
    // We might want to not support creating data not linked to a tenant. Right now this is only
    // used for the my1fp login flow
    scoped_vault_id: ScopedVaultId,
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    kind: DataIdentifier,
    source: DataLifetimeSource,
    actor: Option<DbActor>,
    origin_id: Option<DataLifetimeId>,
}

pub struct NewDataLifetimeArgs {
    pub kind: DataIdentifier,
    pub origin_id: Option<DataLifetimeId>,
    pub source: DataLifetimeSource,
}

#[derive(Default, AsChangeset)]
#[diesel(table_name = data_lifetime)]
struct DataLifetimeUpdate {
    portablized_at: Option<Option<DateTime<Utc>>>,
    deactivated_at: Option<Option<DateTime<Utc>>>,
    portablized_seqno: Option<Option<DataLifetimeSeqno>>,
    deactivated_seqno: Option<Option<DataLifetimeSeqno>>,
}

#[derive(QueryableByName)]
struct PgSequence {
    #[diesel(sql_type = Int8)]
    last_value: DataLifetimeSeqno,
}

impl DataLifetime {
    /// Gets the next sequence number for the lifetime table. Should be used when creating new data.
    ///
    /// This uses a postgres sequence under the hood. Postgres sequences are most known for their
    /// role in keeping track of the current/next value for an auto-incrementing primary key column.
    /// We use them here to keep track of our seqno timeline of data operations that can happen on
    /// a user vault.
    ///
    /// Uniquely, writes made to a sequence are never undone, even if the transaction that made the
    /// write ends up rolling back. Because of this, multiple concurrently running transactions can
    /// fetch the next value from a sequence without creating an observable throughput bottleneck.
    #[tracing::instrument("DataLifetime::get_next_seqno", skip_all)]
    pub fn get_next_seqno(conn: &mut PgConn) -> DbResult<DataLifetimeSeqno> {
        let result = diesel::select(nextval("data_lifetime_seqno")).get_result(conn)?;
        Ok(result)
    }

    /// Gets the current sequence number for the lifetime table without incrementing. Should be used
    /// when taking a snapshot
    /// This DOES NOT give you the latest sequence number used in the current transaction.
    #[tracing::instrument("DataLifetime::get_current_seqno", skip_all)]
    pub fn get_current_seqno(conn: &mut PgConn) -> DbResult<DataLifetimeSeqno> {
        let result = diesel::sql_query("SELECT last_value FROM data_lifetime_seqno".to_owned())
            .get_result::<PgSequence>(conn)?;
        Ok(result.last_value)
    }

    /// Creates a new DataLifetime rows with the same created_seqno and created_at for each kind in
    /// `kinds`
    #[tracing::instrument("DataLifetime::bulk_create", skip_all)]
    pub(crate) fn bulk_create(
        conn: &mut TxnPgConn,
        vault_id: &VaultId,
        scoped_vault_id: &ScopedVaultId,
        rows: Vec<NewDataLifetimeArgs>,
        seqno: DataLifetimeSeqno,
        actor: Option<DbActor>,
    ) -> DbResult<Vec<Self>> {
        let new_rows: Vec<NewDataLifetime> = rows
            .into_iter()
            .map(|r| NewDataLifetime {
                vault_id: vault_id.clone(),
                scoped_vault_id: scoped_vault_id.clone(),
                created_at: Utc::now(),
                created_seqno: seqno,
                kind: r.kind,
                source: r.source,
                actor: actor.clone(),
                origin_id: r.origin_id,
            })
            .collect();

        ScopedVaultVersion::get_or_create(conn, scoped_vault_id, seqno)?;

        let result = diesel::insert_into(data_lifetime::table)
            .values(new_rows)
            .get_results::<Self>(conn.conn())?;
        Ok(result)
    }

    /// Creates a single new DataLifetime row
    #[tracing::instrument("DataLifetime::create", skip_all)]
    pub(crate) fn create(
        conn: &mut TxnPgConn,
        vault_id: &VaultId,
        scoped_vault_id: &ScopedVaultId,
        kind: DataIdentifier,
        seqno: DataLifetimeSeqno,
        source: DataLifetimeSource,
        actor: Option<DbActor>,
    ) -> DbResult<Self> {
        let args = NewDataLifetimeArgs {
            kind,
            origin_id: None,
            source,
        };
        let lifetime = Self::bulk_create(conn, vault_id, scoped_vault_id, vec![args], seqno, actor)?
            .into_iter()
            .next()
            .ok_or(DbError::ObjectNotFound)?;
        Ok(lifetime)
    }

    #[tracing::instrument("DataLifetime::portablize", skip_all)]
    pub fn portablize(conn: &mut TxnPgConn, id: &DataLifetimeId, seqno: DataLifetimeSeqno) -> DbResult<Self> {
        let dl = data_lifetime::table
            .filter(data_lifetime::id.eq(id))
            .get_result::<Self>(conn.conn())?;
        if dl.portablized_seqno.is_some() {
            // No-op if already portablized
            return Ok(dl);
        }
        let update = DataLifetimeUpdate {
            portablized_at: Some(Some(Utc::now())),
            portablized_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };
        let result = diesel::update(data_lifetime::table)
            .filter(data_lifetime::id.eq(id))
            .filter(data_lifetime::portablized_seqno.is_null())
            .set(update)
            .get_result(conn.conn())?;
        Ok(result)
    }

    /// Marks a list of DataLifetimes as portable for a specific (user, tenant). Used to commit
    /// speculative data and make it portable after it is verified by an approved onboarding
    #[tracing::instrument("DataLifetime::bulk_portablize_for_tenant", skip_all)]
    pub fn bulk_portablize_for_tenant(
        conn: &mut PgConn,
        ids: Vec<DataLifetimeId>,
        scoped_vault_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let update = DataLifetimeUpdate {
            portablized_at: Some(Some(Utc::now())),
            portablized_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };
        let results = diesel::update(data_lifetime::table)
            .filter(data_lifetime::id.eq_any(ids))
            .filter(data_lifetime::scoped_vault_id.eq(scoped_vault_id))
            .filter(data_lifetime::portablized_seqno.is_null())
            .set(update)
            .get_results(conn)?;
        Ok(results)
    }

    /// Given a list of DataLifetimeIds, marks the active DataLifetime rows as deactivated.
    #[tracing::instrument("DataLifetime::bulk_deactivate", skip_all)]
    pub fn bulk_deactivate(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        ids: Vec<DataLifetimeId>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let filter = Box::new(
            data_lifetime::id
                .eq_any(ids)
                .and(data_lifetime::scoped_vault_id.eq(scoped_vault_id.clone())),
        );
        Self::_bulk_deactivate(conn, scoped_vault_id, filter, seqno)
    }

    /// Deactivates the old DataLifetimes with the provided kinds associated with this (user,
    /// tenant). This should only be used when replacing old data with new
    #[tracing::instrument("DataLifetime::bulk_deactivate_kinds", skip_all)]
    pub fn bulk_deactivate_kinds(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        kinds: Vec<DataIdentifier>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let filter = Box::new(
            data_lifetime::kind
                .eq_any(kinds)
                .and(data_lifetime::scoped_vault_id.eq(scoped_vault_id.clone())),
        );
        Self::_bulk_deactivate(conn, scoped_vault_id, filter, seqno)
    }

    /// Deactivates the DLs with the provided filter, and any fingerprints for these DLs
    fn _bulk_deactivate(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        filter: Box<dyn BoxableExpression<data_lifetime::table, Pg, SqlType = sql_types::Bool>>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let deactivated_at = Utc::now();
        let update = DataLifetimeUpdate {
            deactivated_at: Some(Some(deactivated_at)),
            deactivated_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };

        let updated = diesel::update(data_lifetime::table)
            .filter(filter)
            .filter(data_lifetime::deactivated_seqno.is_null())
            .set(update)
            .get_results::<Self>(conn.conn())?;

        if !updated.is_empty() {
            // Only update the SV version if the seqno was actually added to DLs.
            ScopedVaultVersion::get_or_create(conn, scoped_vault_id, seqno)?;
        }

        let lifetime_ids = updated.iter().map(|dl| &dl.id).collect_vec();
        Fingerprint::bulk_deactivate(conn, lifetime_ids, deactivated_at)?;
        Ok(updated)
    }

    /// Get the list of currently active DataLifetimeIds for the provided scoped_vault_id at a
    /// given seqno. This allows reconstructing a snapshot of what a user vault looked like at a
    /// time.
    #[tracing::instrument("DataLifetime::bulk_get_active_at", skip_all)]
    pub fn bulk_get_active_at(
        conn: &mut PgConn,
        sv_id: Vec<&ScopedVaultId>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let results = data_lifetime::table
            .filter(data_lifetime::scoped_vault_id.eq_any(sv_id))
            // Data must be added at or before the seqno
            .filter(data_lifetime::created_seqno.le(seqno))
            // And either not deactivated or deactivated after the seqno
            .filter(
                data_lifetime::deactivated_seqno
                    .gt(seqno)
                    .or(data_lifetime::deactivated_seqno.is_null()),
            )
            .get_results(conn)?;

        Ok(results)
    }

    /// Get the list of portable DataLifetimes for the provided vault_id at the provided seqno.
    /// This gets the view used in my1fp and used to prefill portable data during one-click
    /// onboardings
    #[tracing::instrument("DataLifetime::get_portable_at", skip_all)]
    pub fn get_portable_at(
        conn: &mut PgConn,
        v_id: &VaultId,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let results = data_lifetime::table
            .filter(data_lifetime::vault_id.eq(v_id))
            // Data must be portablized at or before the seqno
            .filter(data_lifetime::portablized_seqno.le(seqno))
            .get_results(conn)?;

        Ok(results)
    }

    /// Computes the active seqno at the provided timestamp.
    pub fn get_seqno_at(conn: &mut PgConn, timestamp: DateTime<Utc>) -> DbResult<DataLifetimeSeqno> {
        // Grab the DataLifetime that was created most recently before the provided timestamp and return its
        // seqno. This was the currently active seqno at the time of the provided timestamp.

        // Seqno should only be advanced when a new DataLifetime is created, so the DataLifetime table can
        // be used to reconstruct the timeline of seqnos.
        // A given seqno is active from DL that creates it to the DL that next increments seqno.

        // A timestamp will correspond to either exactly one unique DataLifetime seqno, or it will most
        // likely be sandwiched between two DataLifetime seqnos (which may not be contiguous
        // integers). If it's sandwiched between two seqnos, we'll take the lower seqno.
        let seqno = data_lifetime::table
            .filter(data_lifetime::created_at.le(timestamp))
            .order_by(data_lifetime::created_at.desc())
            .limit(1)
            .select(data_lifetime::created_seqno)
            .get_result(conn)
            .optional()?;
        let seqno = seqno.unwrap_or_default();
        Ok(seqno)
    }
}
