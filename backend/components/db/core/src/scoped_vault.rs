use crate::errors::FpOptionalExtension;
use crate::models::scoped_vault::ScopedVault;
use crate::models::scoped_vault::ScopedVaultIdentifier;
use crate::models::vault::Vault;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::vault;
use db_schema::schema::{
    self,
};
use diesel::dsl::exists;
use diesel::dsl::not;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::ExternalId;
use newtypes::Fingerprint;
use newtypes::FpId;
use newtypes::LabelKind;
use newtypes::ObConfigurationId;
use newtypes::OnboardingStatus;
use newtypes::PiiString;
use newtypes::ScopedVaultCursor;
use newtypes::ScopedVaultCursorKind;
use newtypes::ScopedVaultId;
use newtypes::TagKind;
use newtypes::TenantId;
use newtypes::VaultKind;
use newtypes::WatchlistCheckStatusKind;
use newtypes::WorkflowKind;
use std::str::FromStr;
use tracing::instrument;

#[derive(Debug, Clone, Default)]
pub struct ScopedVaultListQueryParams<TSearch = SearchQuery> {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub statuses: Vec<OnboardingStatus>,
    pub search: Option<TSearch>,
    pub fp_id: Option<FpId>,
    pub timestamp_lte: Option<DateTime<Utc>>,
    pub timestamp_gte: Option<DateTime<Utc>>,
    pub requires_manual_review: Option<bool>,
    pub watchlist_hit: Option<bool>,
    pub kind: Option<VaultKind>,
    /// Temporary - only show vaults that are visible to be shown in search
    pub only_active: bool,
    pub playbook_ids: Option<Vec<ObConfigurationId>>,
    pub has_outstanding_workflow_request: Option<bool>,
    pub has_workflow: Option<bool>,
    pub external_id: Option<ExternalId>,
    pub labels: Vec<LabelKind>,
    pub tags: Vec<TagKind>,
}

#[derive(Debug, Clone, Default)]
pub struct SearchQuery {
    /// Plaintext search query. Will perform an ilike on plaintext fingerprints, and also an exact
    /// match on external ID.
    pub search: PiiString,
    /// Fingerprint search queries. Results will match ANY of the FingerprintQueries
    pub fingerprint_queries: Vec<Fingerprint>,
}

impl ScopedVaultListQueryParams {
    fn map_search(self, conn: &mut PgConn) -> DbResult<ScopedVaultListQueryParams<Vec<ScopedVaultId>>> {
        let Self {
            tenant_id,
            is_live,
            statuses,
            search,
            fp_id,
            timestamp_lte,
            timestamp_gte,
            requires_manual_review,
            watchlist_hit,
            kind,
            only_active,
            playbook_ids,
            has_outstanding_workflow_request,
            has_workflow,
            external_id,
            labels,
            tags,
        } = self;

        let matching_vaults = if let Some(search) = search {
            let vault_ids = vaults_matching_search(conn, search, &tenant_id, is_live)?;
            Some(vault_ids)
        } else {
            None
        };

        let result = ScopedVaultListQueryParams {
            tenant_id,
            is_live,
            statuses,
            search: matching_vaults,
            fp_id,
            timestamp_lte,
            timestamp_gte,
            requires_manual_review,
            watchlist_hit,
            kind,
            only_active,
            playbook_ids,
            has_outstanding_workflow_request,
            has_workflow,
            external_id,
            labels,
            tags,
        };
        Ok(result)
    }
}

/// Composes the query to fetch authorized users matching the provided filter params.
/// Requires the `conn` only to execute one subquery because diesel doesn't like it. Returns a box
/// query that must still be executed
macro_rules! list_query {
    ($params: ident) => {{
        // Filter out onboardings that haven't been explicitly authorized by the user - these should
        // not be visible in the dashboard since the tenant doesn't have permissions to view anything
        // about the user
        use db_schema::schema::manual_review;
        use db_schema::schema::scoped_vault;
        use db_schema::schema::scoped_vault_label;
        use db_schema::schema::scoped_vault_tag;
        use db_schema::schema::watchlist_check;
        use db_schema::schema::workflow;
        use db_schema::schema::workflow_request;
        let mut query = scoped_vault::table
            .filter(scoped_vault::tenant_id.eq(&$params.tenant_id))
            .filter(scoped_vault::is_live.eq($params.is_live))
            .into_boxed();

        if $params.only_active {
            query = query.filter(scoped_vault::is_active.eq(true));
        }

        // Filter on whether user is in manual review
        if let Some(requires_manual_review) = $params.requires_manual_review {
            let q_has_manual_review = exists(
                manual_review::table
                    .filter(manual_review::completed_at.is_null())
                    .filter(manual_review::scoped_vault_id.eq(scoped_vault::id))
                    // Filter on denormalized columns for better performance
                    .filter(manual_review::tenant_id.eq(&$params.tenant_id))
                    .filter(manual_review::is_live.eq($params.is_live))
            );
            if requires_manual_review {
                query = query.filter(q_has_manual_review)
            } else {
                query = query.filter(not(q_has_manual_review))
            }
        }

        // Filter on whether user has a watchlist hit
        if let Some(watchlist_hit) = $params.watchlist_hit.as_ref() {
            let q_has_watchlist_hit = exists(
                watchlist_check::table
                    .filter(watchlist_check::status.eq(WatchlistCheckStatusKind::Fail))
                    .filter(watchlist_check::deactivated_at.is_null())
                    .filter(not(watchlist_check::completed_at.is_null()))
                    .filter(watchlist_check::scoped_vault_id.eq(scoped_vault::id)),
            );
            if *watchlist_hit {
                query = query.filter(q_has_watchlist_hit)
            } else {
                query = query.filter(not(q_has_watchlist_hit))
            }
        }

        if !$params.statuses.is_empty() {
            query = query.filter(scoped_vault::status.eq_any(&$params.statuses))
        }

        if let Some(fp_id) = $params.fp_id.as_ref() {
            query = query.filter(scoped_vault::fp_id.eq(fp_id))
        }

        if let Some(timestamp_lte) = $params.timestamp_lte {
            query = query.filter(scoped_vault::last_activity_at.le(timestamp_lte))
        }

        if let Some(timestamp_gte) = $params.timestamp_gte {
            query = query.filter(scoped_vault::last_activity_at.ge(timestamp_gte))
        }

        if let Some(kind) = $params.kind.as_ref() {
            query = query.filter(scoped_vault::kind.eq(kind))
        }

        if let Some(playbook_ids) = $params.playbook_ids.as_ref() {
            let q_onboarded_onto_playbook = exists(
                workflow::table
                    .filter(workflow::ob_configuration_id.eq_any(playbook_ids))
                    .filter(workflow::scoped_vault_id.eq(scoped_vault::id))
                    // Document workflows have a bogus playbook associated with them
                    .filter(not(workflow::kind.eq(WorkflowKind::Document)))
            );
            query = query.filter(q_onboarded_onto_playbook)
        }

        if let Some(has_outstanding_workflow_request) = $params.has_outstanding_workflow_request.as_ref() {
            let q_has_wfr = exists(
                workflow_request::table
                    .filter(workflow_request::deactivated_at.is_null())
                    .filter(workflow_request::scoped_vault_id.eq(scoped_vault::id)),
            );
            if *has_outstanding_workflow_request {
                query = query.filter(q_has_wfr)
            } else {
                query = query.filter(not(q_has_wfr))
            }
        }

        if let Some(has_workflow) = $params.has_workflow.as_ref() {
            let q_has_workflow =
                exists(workflow::table.filter(workflow::scoped_vault_id.eq(scoped_vault::id)));
            if *has_workflow {
                query = query.filter(q_has_workflow)
            } else {
                query = query.filter(not(q_has_workflow))
            }
        }

        if let Some(sv_ids) = $params.search.as_ref() {
            query = query.filter(scoped_vault::id.eq_any(sv_ids))
        }

        if let Some(external_id) = $params.external_id.as_ref() {
            query = query.filter(scoped_vault::external_id.eq(external_id))
        }

        if !$params.labels.is_empty() {
            let q_has_matching_label = exists(
                scoped_vault_label::table
                    .filter(scoped_vault_label::deactivated_at.is_null())
                    .filter(scoped_vault_label::kind.eq_any(&$params.labels))
                    .filter(scoped_vault_label::scoped_vault_id.eq(scoped_vault::id))
                    // Filter on denormalized columns for better performance
                    .filter(scoped_vault_label::tenant_id.eq(&$params.tenant_id))
                    .filter(scoped_vault_label::is_live.eq($params.is_live))
            );
            query = query.filter(q_has_matching_label)
        }
        if !$params.tags.is_empty() {
            let q_has_matching_tag = exists(
                scoped_vault_tag::table
                    .filter(scoped_vault_tag::deactivated_at.is_null())
                    .filter(scoped_vault_tag::kind.eq_any(&$params.tags))
                    .filter(scoped_vault_tag::scoped_vault_id.eq(scoped_vault::id))
                    // Filter on denormalized columns for better performance
                    .filter(scoped_vault_tag::tenant_id.eq(&$params.tenant_id))
                    .filter(scoped_vault_tag::is_live.eq($params.is_live))
            );
            query = query.filter(q_has_matching_tag)
        }

        query
    }};
}

#[instrument("ScopedVault::vaults_matching_search", skip_all)]
fn vaults_matching_search(
    conn: &mut PgConn,
    search: SearchQuery,
    tenant_id: &TenantId,
    is_live: bool,
) -> DbResult<Vec<ScopedVaultId>> {
    use db_schema::schema::fingerprint;
    let SearchQuery {
        search,
        fingerprint_queries,
    } = search;

    // Search both plaintext results and fingerprinted results
    let plaintext_results = {
        let plaintext_search = format!("%{}%", search.leak());
        // Be careful changing this query - it's optimized to use a specific index
        fingerprint::table
            .filter(fingerprint::deactivated_at.is_null())
            .filter(fingerprint::tenant_id.eq(tenant_id))
            .filter(fingerprint::is_live.eq(is_live))
            .filter(fingerprint::is_hidden.eq(false))
            // Matching filter
            .filter(fingerprint::p_data.is_not_null())
            .filter(fingerprint::p_data.ilike(plaintext_search))
            .select(fingerprint::scoped_vault_id)
            .get_results::<ScopedVaultId>(conn)?
    };

    let fingerprint_results = {
        // Be careful changing this query - it's optimized to use a specific index
        fingerprint::table
            .filter(fingerprint::deactivated_at.is_null())
            .filter(fingerprint::tenant_id.eq(tenant_id))
            .filter(fingerprint::is_live.eq(is_live))
            .filter(fingerprint::is_hidden.eq(false))
            // Matching filter
            .filter(fingerprint::sh_data.is_not_null())
            .filter(fingerprint::sh_data.eq_any(&fingerprint_queries))
            .select(fingerprint::scoped_vault_id)
            .get_results::<ScopedVaultId>(conn)?
    };

    let external_id_results = if let Ok(external_id) = ExternalId::from_str(search.leak()) {
        let id = ScopedVaultIdentifier::ExternalId {
            e_id: &external_id,
            t_id: tenant_id,
            is_live,
        };
        let sv = ScopedVault::get(conn, id).optional()?;

        sv.into_iter().map(|sv| sv.id).collect_vec()
    } else {
        vec![]
    };

    tracing::info!(
        search_len = search.len(),
        sh_datas=%Csv::from(fingerprint_queries),
        num_plaintext_results = plaintext_results.len(),
        num_fingerprint_results = fingerprint_results.len(),
        num_external_id_results = external_id_results.len(),
        "Scoped vaults matching fingerprint/plaintext search"
    );

    let all_ids = fingerprint_results
        .into_iter()
        .chain(plaintext_results)
        .chain(external_id_results)
        .unique()
        .collect();
    Ok(all_ids)
}

#[instrument("ScopedVault::list", skip_all)]
fn list(
    conn: &mut PgConn,
    params: &ScopedVaultListQueryParams<Vec<ScopedVaultId>>,
    cursor: Option<ScopedVaultCursor>,
    order_by: ScopedVaultCursorKind,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let query = list_query!(params);

    let mut scoped_vaults = query.inner_join(vault::table).limit(page_size);

    if let Some(cursor) = cursor {
        match cursor {
            ScopedVaultCursor::OrderingId(c) => {
                scoped_vaults = scoped_vaults.filter(schema::scoped_vault::ordering_id.le(c))
            }
            ScopedVaultCursor::LastActivityAt(c) => {
                scoped_vaults = scoped_vaults.filter(schema::scoped_vault::last_activity_at.le(c))
            }
        }
    }

    match order_by {
        ScopedVaultCursorKind::OrderingId => {
            scoped_vaults = scoped_vaults.order_by(schema::scoped_vault::ordering_id.desc())
        }
        ScopedVaultCursorKind::LastActivityAt => {
            scoped_vaults = scoped_vaults.order_by(schema::scoped_vault::last_activity_at.desc())
        }
    }

    let results = scoped_vaults
        .select((schema::scoped_vault::all_columns, schema::vault::all_columns))
        .get_results(conn)?;
    Ok(results)
}

/// lists all scoped_vaults across all configurations
#[instrument("ScopedVault::list_authorized_for_tenant", skip_all)]
pub fn list_authorized_for_tenant(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
    cursor: Option<i64>,
    page_size: i64,
) -> DbResult<Vec<(ScopedVault, Vault)>> {
    let params = &params.map_search(conn)?;
    let cursor = cursor.map(ScopedVaultCursor::OrderingId);
    list(conn, params, cursor, ScopedVaultCursorKind::OrderingId, page_size)
}

#[instrument("ScopedVault::count_for_tenant", skip_all)]
pub fn count_for_tenant(conn: &mut PgConn, params: ScopedVaultListQueryParams) -> DbResult<i64> {
    let params = &params.map_search(conn)?;
    let count = list_query!(params).count().get_result(conn)?;
    Ok(count)
}

/// List and count all scoped vaults matching the search params. Use this if you need both the
/// count of results and the results themselves - this util saves and reuses some intermediate
/// computation
#[instrument("ScopedVault::list_and_count_authorized_for_tenant", skip_all)]
pub fn list_and_count_authorized_for_tenant(
    conn: &mut PgConn,
    params: ScopedVaultListQueryParams,
    cursor: Option<ScopedVaultCursor>,
    order_by: ScopedVaultCursorKind,
    page_size: i64,
) -> DbResult<(Vec<(ScopedVault, Vault)>, i64)> {
    let params = &params.map_search(conn)?;

    let results = list(conn, params, cursor, order_by, page_size)?;
    let count = list_query!(params).count().get_result(conn)?;
    Ok((results, count))
}
