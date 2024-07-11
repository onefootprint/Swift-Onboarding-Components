use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use api_wire_types::OrgMetricsRequest;
use db::scoped_vault::count_for_tenant;
use db::scoped_vault::ScopedVaultListQueryParams;
use newtypes::OnboardingStatus;
use newtypes::VaultKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    tags(OrgSettings, Private),
    description = "Returns metrics to display on the dashboard home page."
)]
#[get("/org/metrics")]
async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    filters: web::Query<OrgMetricsRequest>,
) -> ApiResponse<api_wire_types::OrgMetricsResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let OrgMetricsRequest {
        timestamp_gte,
        timestamp_lte,
        playbook_id,
    } = filters.into_inner();

    let search_params = move |kind: VaultKind,
                              statuses: Vec<OnboardingStatus>,
                              only_has_wf: bool|
          -> ScopedVaultListQueryParams {
        ScopedVaultListQueryParams {
            tenant_id: tenant_id.clone(),
            is_live,
            kind: Some(kind),
            search: None,
            fp_id: None,
            timestamp_lte,
            timestamp_gte,
            requires_manual_review: None,
            watchlist_hit: None,
            // TODO this could drift easily. Be careful changing this since it could affect the
            // pass rate we display if we start also looking for vaults that aren't verified
            only_active: true,
            statuses,
            playbook_ids: playbook_id.clone().map(|playbook_id| vec![playbook_id]),
            has_outstanding_workflow_request: None,
            has_workflow: only_has_wf.then_some(true),
            external_id: None,
            labels: vec![],
        }
    };

    let (user, business) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let mut metrics_for = |kind: VaultKind| -> FpResult<_> {
                let new_vaults = count_for_tenant(conn, search_params(kind, vec![], false))?;
                let total_onboardings = count_for_tenant(conn, search_params(kind, vec![], true))?;
                let fail_onboardings =
                    count_for_tenant(conn, search_params(kind, vec![OnboardingStatus::Fail], true))?;
                let pass_onboardings =
                    count_for_tenant(conn, search_params(kind, vec![OnboardingStatus::Pass], true))?;
                let incomplete_onboardings = count_for_tenant(
                    conn,
                    search_params(kind, vec![OnboardingStatus::Incomplete], true),
                )?;
                let result = api_wire_types::OrgMetrics {
                    new_vaults,
                    total_onboardings,
                    fail_onboardings,
                    pass_onboardings,
                    incomplete_onboardings,
                };
                Ok(result)
            };
            let user = metrics_for(VaultKind::Person)?;
            let business = metrics_for(VaultKind::Business)?;
            Ok((user, business))
        })
        .await?;

    let result = api_wire_types::OrgMetricsResponse { user, business };

    Ok(result)
}
