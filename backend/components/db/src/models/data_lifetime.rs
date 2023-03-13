use std::collections::HashMap;

use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::sql_types::Int8;
use itertools::Itertools;
use newtypes::DataLifetimeKind;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::{DataLifetimeId, VaultId};
use serde::{Deserialize, Serialize};

use crate::nextval;
use crate::schema::data_lifetime;
use crate::PgConn;
use crate::TxnPgConn;
use crate::{DbError, DbResult};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = data_lifetime)]
/// DataLifetime is a generic model that allows us to represent the lifecycle of a piece of data
/// that belongs to a user. All pieces of data "belonging" to a user vault share some attributes,
/// and those attributes are all represented here. You will see many models throughout the codebase
/// contain a pointer to a DataLifetime row. Also notable, Fingerprints and the underlying data
/// storage rows point to the same DataLifetime row, which conveniently deactivates fingerprints as
/// soon as the underlying data is deactivated.
///
/// Ownership attributes:
/// - `user_vault_id`: The user to which this piece of data belongs
/// - `scoped_user_id`: The scoped_user that represents during onboarding to which tenant this data
///   was added
///
/// Lifecycle attributes:
/// - `created_at`/`created_seqno`: When the data was created
/// - `portablized_at`/`portablized_seqno`: When the data was committed and made portable. This is
///   usually after is has been verified with data vendors. BUT, it is not synonymous with verified -
///   we also make contact info like phone/email portable as soon as it is added
/// - `deactivated_at`/`deactivated_seqno`: When the data was archived and is no longer active. This
///   may happen if a piece of data is replaced with newer data.
///
/// Access:
/// In the case of portable data, DataLifetimes don't help in all cases with checking if the Tenant ever _requested_ access to that data
/// during an onboarding (via a OB configuration). Since DataLifetimes do not speak in terms of accessing specific data attributes (`kind`s) previously collected,
/// (which is a unique/distinct case from ownership) we associate each DataLifetime with a `kind`, which helps when retrieving data.
///
/// For example:
///   - Tenant A onboards User U, requesting data_lifetime_kind_1 and data_lifetime_kind_2 and both kinds become portable
///   - Tenant B onboards User U, requesting *just* data_lifetime_kind_1. data_lifetime_kind_2 is portable, but Tenant B should not know of it's existence (or read it's value).
///   As currently defined in the DataLifetime model, data_lifetime_kind_1 and data_lifetime_kind_2 are owned by U's user_vault, and Tenant A's scoped user for User U.
///   There is no way in the DataLifetime model to keep an "ACL" with respect to Tenant B visibility of User U's portable data.
///   Hence, we control this at the UVW level, where we can materialize individual data kinds based on lifetimes and check ACL based on ob configs
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
    pub user_vault_id: VaultId,
    pub scoped_user_id: Option<ScopedVaultId>,
    // Lifecycle attributes
    pub created_at: DateTime<Utc>,
    pub portablized_at: Option<DateTime<Utc>>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_seqno: DataLifetimeSeqno,
    pub portablized_seqno: Option<DataLifetimeSeqno>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub kind: DataLifetimeKind,
}

#[derive(Clone, Insertable)]
#[diesel(table_name = data_lifetime)]
struct NewDataLifetime {
    // This is just denormalized for fast querying.
    user_vault_id: VaultId,
    // We might want to not support creating data not linked to a tenant. Right now this is only
    // used for the my1fp login flow
    scoped_user_id: Option<ScopedVaultId>,
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    kind: DataLifetimeKind,
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
    #[tracing::instrument(skip_all)]
    pub fn get_next_seqno(conn: &mut PgConn) -> DbResult<DataLifetimeSeqno> {
        let result = diesel::select(nextval("data_lifetime_seqno")).get_result(conn)?;
        Ok(result)
    }

    /// Gets the current sequence number for the lifetime table without incrementing. Should be used
    /// when taking a snapshot
    #[tracing::instrument(skip_all)]
    pub fn get_current_seqno(conn: &mut PgConn) -> DbResult<DataLifetimeSeqno> {
        let result = diesel::sql_query("SELECT last_value FROM data_lifetime_seqno".to_owned())
            .get_result::<PgSequence>(conn)?;
        Ok(result.last_value)
    }

    /// Creates a new DataLifetime rows with the same created_seqno and created_at for each kind in `kinds`
    #[tracing::instrument(skip_all)]
    pub(crate) fn bulk_create(
        conn: &mut TxnPgConn,
        user_vault_id: &VaultId,
        scoped_user_id: Option<&ScopedVaultId>,
        kinds: Vec<DataLifetimeKind>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let new_rows: Vec<NewDataLifetime> = kinds
            .into_iter()
            .map(|k| NewDataLifetime {
                user_vault_id: user_vault_id.clone(),
                scoped_user_id: scoped_user_id.cloned(),
                created_at: Utc::now(),
                created_seqno: seqno,
                kind: k,
            })
            .collect();
        let result = diesel::insert_into(data_lifetime::table)
            .values(new_rows)
            .get_results::<Self>(conn.conn())?;
        Ok(result)
    }

    /// Creates a single new DataLifetime row
    #[tracing::instrument(skip_all)]
    pub(crate) fn create(
        conn: &mut TxnPgConn,
        user_vault_id: &VaultId,
        scoped_user_id: Option<&ScopedVaultId>,
        kind: DataLifetimeKind,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Self> {
        let lifetime = Self::bulk_create(conn, user_vault_id, scoped_user_id, vec![kind], seqno)?
            .into_iter()
            .next()
            .ok_or(DbError::ObjectNotFound)?;
        Ok(lifetime)
    }

    // TODO rename to portablize
    #[tracing::instrument(skip_all)]
    pub fn commit(conn: &mut PgConn, id: &DataLifetimeId, seqno: DataLifetimeSeqno) -> DbResult<Self> {
        let update = DataLifetimeUpdate {
            portablized_at: Some(Some(Utc::now())),
            portablized_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };
        let result = diesel::update(data_lifetime::table)
            .filter(data_lifetime::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }

    /// Marks a list of DataLifetimes as portable for a specific (user, tenant). Used to commit
    /// speculative data and make it portable after it is verified by an approved onboarding
    #[tracing::instrument(skip_all)]
    pub fn bulk_commit_for_tenant(
        conn: &mut PgConn,
        ids: Vec<DataLifetimeId>,
        scoped_user_id: &ScopedVaultId,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let update = DataLifetimeUpdate {
            portablized_at: Some(Some(Utc::now())),
            portablized_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };
        let results = diesel::update(data_lifetime::table)
            .filter(data_lifetime::id.eq_any(ids))
            .filter(data_lifetime::scoped_user_id.eq(scoped_user_id))
            .filter(data_lifetime::portablized_seqno.is_null())
            .set(update)
            .get_results(conn)?;
        Ok(results)
    }

    /// Given a list of DataLifetimeIds, marks the active DataLifetime rows as deactivated.
    #[tracing::instrument(skip_all)]
    pub fn bulk_deactivate(
        conn: &mut PgConn,
        ids: Vec<DataLifetimeId>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let update = DataLifetimeUpdate {
            deactivated_at: Some(Some(Utc::now())),
            deactivated_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };
        let results = diesel::update(data_lifetime::table)
            .filter(data_lifetime::id.eq_any(ids))
            .filter(data_lifetime::deactivated_seqno.is_null())
            .set(update)
            .get_results(conn)?;
        Ok(results)
    }

    /// Deactivates the speculative DataLifetimes with the provided kinds associated with this (user, tenant).
    /// This should only be used when replacing speculative, un-committed user data with new speculative user data
    #[tracing::instrument(skip_all)]
    pub fn bulk_deactivate_speculative(
        conn: &mut PgConn,
        scoped_user_id: &ScopedVaultId,
        kinds: Vec<DataLifetimeKind>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        let update = DataLifetimeUpdate {
            deactivated_at: Some(Some(Utc::now())),
            deactivated_seqno: Some(Some(seqno)),
            ..DataLifetimeUpdate::default()
        };
        let results = diesel::update(data_lifetime::table)
            .filter(data_lifetime::kind.eq_any(kinds))
            .filter(data_lifetime::scoped_user_id.eq(scoped_user_id))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Specifically don't allow deactivating portable data here since we are replacing it
            // with speculative data
            .filter(data_lifetime::portablized_seqno.is_null())
            .set(update)
            .get_results(conn)?;
        Ok(results)
    }

    /// Get the list of currently active DataLifetimeIds for the provided scoped_user_id.
    /// A piece of user data is visible if it is (1) portable and (2) not deactivated.
    /// A piece of user data is also visible _to a specific tenant_ if the tenant added the data,
    /// whether or not the data is portable.
    #[tracing::instrument(skip_all)]
    pub fn get_active(
        conn: &mut PgConn,
        user_vault_id: &VaultId,
        scoped_user_id: Option<&ScopedVaultId>,
    ) -> DbResult<Vec<Self>> {
        let mut query = data_lifetime::table
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(data_lifetime::deactivated_seqno.is_null())
            .into_boxed();

        let q_is_portable = not(data_lifetime::portablized_seqno.is_null());
        if let Some(scoped_user_id) = scoped_user_id {
            // Fetch portable data
            // And also fetch speculative, non-portable data that was active at the time
            // and belongs to the tenant
            let q_belongs_to_tenant = data_lifetime::scoped_user_id.eq(scoped_user_id);
            query = query.filter(q_is_portable.or(q_belongs_to_tenant));
        } else {
            // Only fetch committed, portable data
            query = query.filter(q_is_portable)
        }

        let results = query.get_results(conn)?;
        Ok(results)
    }

    /// Get the list of currently active DataLifetimeIds for the provided tenant_id and list
    /// of user_vault_ids.
    #[tracing::instrument(skip_all)]
    pub fn get_bulk_active_for_tenant(
        conn: &mut PgConn,
        user_vault_ids: Vec<&VaultId>,
        tenant_id: &TenantId,
    ) -> DbResult<HashMap<VaultId, Vec<Self>>> {
        use crate::schema::scoped_user;
        let q_is_portable = not(data_lifetime::portablized_seqno.is_null());
        let q_belongs_to_tenant = scoped_user::tenant_id.eq(tenant_id);
        let query = data_lifetime::table
            .left_join(scoped_user::table)
            // Get data belonging to these users that is not deactivated
            .filter(data_lifetime::user_vault_id.eq_any(user_vault_ids))
            .filter(data_lifetime::deactivated_seqno.is_null())
            // Fetch all rows that are either portable
            // OR belong to this tenant
            .filter(q_is_portable.or(q_belongs_to_tenant));

        let results: Vec<Self> = query.select(data_lifetime::all_columns).get_results(conn)?;
        let uv_id_to_lifetimes = results
            .into_iter()
            .map(|l| (l.user_vault_id.clone(), l))
            .sorted_by_key(|(uv_id, _)| uv_id.clone())
            .into_group_map();
        let results = uv_id_to_lifetimes
            .into_iter()
            .map(|(uv_id, lifetimes)| (uv_id, lifetimes))
            .collect();
        Ok(results)
    }

    /// Get the list of currently active DataLifetimeIds for the provided (user_vault_id, scoped_user_id)
    /// at a given seqno. This allows reconstructing a snapshot of what a user vault looked like at a time.
    #[tracing::instrument(skip_all)]
    pub fn get_active_at(
        conn: &mut PgConn,
        user_vault_id: &VaultId,
        scoped_user_id: Option<&ScopedVaultId>,
        seqno: DataLifetimeSeqno,
    ) -> DbResult<Vec<Self>> {
        // This is kind of unnecessarily similar to `get_active`, but it's hard to combine
        // this logic in diesel
        let mut query = data_lifetime::table
            .filter(data_lifetime::user_vault_id.eq(user_vault_id))
            .filter(
                data_lifetime::deactivated_seqno
                    .gt(seqno)
                    .or(data_lifetime::deactivated_seqno.is_null()),
            )
            .into_boxed();

        let q_is_portable = data_lifetime::portablized_seqno.le(seqno);
        if let Some(scoped_user_id) = scoped_user_id {
            // Fetch portable data
            // AND also fetch speculative, non-portable data that was active at the time
            // and belongs to the tenant
            let q_belongs_to_tenant = data_lifetime::scoped_user_id
                .eq(scoped_user_id)
                .and(data_lifetime::created_seqno.le(seqno));
            query = query.filter(q_is_portable.or(q_belongs_to_tenant));
        } else {
            // Only fetch portable, portable data
            query = query.filter(q_is_portable)
        }

        let results = query.get_results(conn)?;
        Ok(results)
    }
}
