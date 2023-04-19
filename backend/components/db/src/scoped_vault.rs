use crate::models::scoped_vault::ScopedVault;
use crate::models::vault::Vault;
use crate::schema;
use crate::schema::scoped_vault::BoxedQuery;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::OnboardingStatus;
use newtypes::OnboardingStatusFilter;
use newtypes::PiiString;
use newtypes::VaultId;
use newtypes::VaultKind;
use newtypes::WatchlistCheckStatusKind;
use newtypes::{Fingerprint, FpId, TenantId};

#[derive(Debug, Clone, Default)]
pub struct ScopedVaultListQueryParams {
    pub tenant_id: TenantId,
    pub is_live: bool,
    /// When true, only returns the scoped users that are either (1) authorized or (2) non-portable
    pub only_billable: bool,
    pub statuses: Vec<OnboardingStatusFilter>,
    pub search: Option<(PiiString, Vec<Fingerprint>)>,
    pub fp_id: Option<FpId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub requires_manual_review: Option<bool>,
    pub watchlist_hit: Option<bool>,
    pub kind: Option<VaultKind>,
}

/// Composes the query to fetch authorized users matching the provided filter params.
/// Requires the `conn` only to execute one subquery because diesel doesn't like it. Returns a box
/// query that must still be executed
pub fn list_authorized_for_tenant_query<'a>(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
) -> DbResult<BoxedQuery<'a, Pg>> {
    // Filter out onboardings that haven't been explicitly authorized by the user - these should
    // not be visible in the dashboard since the tenant doesn't have permissions to view anything
    // about the user
    use crate::schema::{
        data_lifetime, fingerprint, manual_review, onboarding, scoped_vault, vault, vault_data,
        watchlist_check,
    };
    let mut query = scoped_vault::table
        .filter(scoped_vault::tenant_id.eq(params.tenant_id.clone()))
        .filter(scoped_vault::is_live.eq(params.is_live))
        .into_boxed();

    if params.only_billable {
        // Only allow seeing any authorized scoped users for portable vaults OR non-portable vaults
        // owned by the tenant
        let authorized_ids = onboarding::table
            .filter(not(onboarding::authorized_at.is_null()))
            .select(onboarding::scoped_vault_id)
            .distinct();
        let non_portable_vault_ids = vault::table
            .filter(vault::is_portable.eq(false))
            .select(vault::id);
        // Don't bill for business vaults
        let uv_ids = vault::table
            .filter(vault::kind.eq(VaultKind::Person))
            .select(vault::id);
        query = query
            .filter(
                scoped_vault::id
                    .eq_any(authorized_ids)
                    .or(scoped_vault::vault_id.eq_any(non_portable_vault_ids)),
            )
            .filter(scoped_vault::vault_id.eq_any(uv_ids));
    }

    // Filter on whether user is in manual review
    if let Some(requires_manual_review) = params.requires_manual_review {
        let matching_ids = manual_review::table
            .inner_join(onboarding::table)
            .filter(manual_review::completed_at.is_null())
            .select(onboarding::scoped_vault_id)
            .distinct();
        if requires_manual_review {
            query = query.filter(scoped_vault::id.eq_any(matching_ids))
        } else {
            query = query.filter(diesel::dsl::not(scoped_vault::id.eq_any(matching_ids)))
        }
    }

    // Filter on whether user has a watchlist hit
    if let Some(watchlist_hit) = params.watchlist_hit {
        let matching_ids = watchlist_check::table
            .filter(watchlist_check::status.eq(WatchlistCheckStatusKind::Fail))
            .filter(watchlist_check::deactivated_at.is_null())
            .filter(not(watchlist_check::completed_at.is_null()))
            .select(watchlist_check::scoped_vault_id)
            .distinct();
        if watchlist_hit {
            query = query.filter(scoped_vault::id.eq_any(matching_ids))
        } else {
            query = query.filter(diesel::dsl::not(scoped_vault::id.eq_any(matching_ids)))
        }
    }

    // Filter on onboarding status: pass/fail/incomplete/vault only
    if !params.statuses.is_empty() {
        // Filter on non-portable users
        let q_vault_only = if params.statuses.contains(&OnboardingStatusFilter::VaultOnly) {
            let uv_ids = vault::table
                .filter(vault::is_portable.eq(false))
                .select(vault::id);
            Some(scoped_vault::vault_id.eq_any(uv_ids))
        } else {
            None
        };

        let onboarding_status: Vec<_> = params
            .statuses
            .iter()
            .flat_map(OnboardingStatus::try_from)
            .collect();

        let q_onboarding_status = if !onboarding_status.is_empty() {
            let su_ids = onboarding::table
                .filter(onboarding::status.eq_any(onboarding_status))
                .select(onboarding::scoped_vault_id);
            Some(scoped_vault::id.eq_any(su_ids))
        } else {
            None
        };

        // This is tricky... If any filtering status is provided, we only want to return results
        // that match the filters. But, the filters are determined through a handful of different
        // queries.
        match (q_vault_only, q_onboarding_status) {
            (Some(q1), Some(q2)) => query = query.filter(q1.or(q2)),
            (Some(q1), None) => query = query.filter(q1),
            (None, Some(q1)) => query = query.filter(q1),
            (None, None) => {}
        }
    }

    if let Some(fp_id) = params.fp_id {
        query = query.filter(scoped_vault::fp_id.eq(fp_id))
    }

    if let Some(timestamp_lte) = params.timestamp_lte {
        query = query.filter(scoped_vault::start_timestamp.le(timestamp_lte))
    }

    if let Some(timestamp_gte) = params.timestamp_gte {
        query = query.filter(scoped_vault::start_timestamp.ge(timestamp_gte))
    }

    if let Some(kind) = params.kind {
        let uv_ids = vault::table.filter(vault::kind.eq(kind)).select(vault::id);
        query = query.filter(scoped_vault::vault_id.eq_any(uv_ids))
    }

    if let Some((search, fingerprints)) = params.search {
        // We have to basically replicate the DataLifetime::get_active inside a SQL query -
        // fingerprints for a piece of data for a given tenant A should be visible if either:
        // - the data is not portablized but was added by tenant A
        // - the data is portablized (could be added by any tenant)
        // These two subqueries handle each case respectively

        let owned_scoped_vault_ids = scoped_vault::table
            .filter(scoped_vault::tenant_id.eq(params.tenant_id))
            .select(scoped_vault::id);
        let matching_speculative_v_ids: Vec<VaultId> = data_lifetime::table
            .left_join(fingerprint::table)
            .left_join(vault_data::table)
            // Active, non-portablized lifetimes that were added by this tenant
            .filter(data_lifetime::deactivated_seqno.is_null())
            .filter(data_lifetime::portablized_seqno.is_null())
            .filter(data_lifetime::scoped_vault_id.eq_any(owned_scoped_vault_ids))
            // Matching data or fingerprint
            .filter(
                vault_data::p_data.ilike(format!("%{}%", search.leak()))
                    .or(fingerprint::sh_data.eq_any(&fingerprints))
            )
            // Specifically get the matching vault_id (the scoped_vault_id might belong to another tenant)
            .select(data_lifetime::vault_id)
            // Sadly, diesel doesn't let you join on scoped_vault and use it in a subquery on the
            // scoped_vault table... So, we have to actually execute the subquery
            .get_results(conn)?;

        let matching_portable_v_ids = data_lifetime::table
            .left_join(fingerprint::table)
            .left_join(vault_data::table)
            // Active, PORTABLE lifetimes
            .filter(data_lifetime::deactivated_seqno.is_null())
            .filter(not(data_lifetime::portablized_seqno.is_null()))
            // Matching data or fingerprint
            .filter(
                vault_data::p_data.ilike(format!("%{}%", search.leak()))
                    .or(fingerprint::sh_data.eq_any(fingerprints))
            )
            // Specifically get the matching vault_id (the scoped_vault_id might belong to another tenant)
            .select(data_lifetime::vault_id);
        query = query.filter(
            scoped_vault::vault_id
                .eq_any(matching_portable_v_ids)
                .or(scoped_vault::vault_id.eq_any(matching_speculative_v_ids)),
        )
    }

    Ok(query)
}

pub fn count_authorized_for_tenant(conn: &mut PgConn, params: ScopedVaultListQueryParams) -> DbResult<i64> {
    let count = list_authorized_for_tenant_query(conn, params)?
        .count()
        .get_result(conn)?;
    Ok(count)
}

/// lists all scoped_vaults across all configurations
pub fn list_authorized_for_tenant(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let mut scoped_vaults = list_authorized_for_tenant_query(conn, params)?
        .order_by(schema::scoped_vault::ordering_id.desc())
        .limit(page_size);

    if let Some(cursor) = cursor {
        scoped_vaults = scoped_vaults.filter(schema::scoped_vault::ordering_id.le(cursor));
    }

    let results = scoped_vaults
        .inner_join(schema::vault::table)
        .select((schema::scoped_vault::all_columns, schema::vault::all_columns))
        .get_results(conn)?;
    Ok(results)
}
