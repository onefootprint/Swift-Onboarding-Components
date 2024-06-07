use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::{
    JsonApiResponse,
    ResponseData,
};
use crate::State;
use api_core::errors::ApiResult;
use api_wire_types::OrgMetricsRequest;
use db::scoped_vault::{
    count_for_tenant,
    ScopedVaultListQueryParams,
};
use newtypes::{
    OnboardingStatus,
    VaultKind,
};
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(
    tags(OrgSettings, Private),
    description = "Returns metrics to display on the dashboard home page."
)]
#[get("/org/metrics")]
async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    filters: web::Query<OrgMetricsRequest>,
) -> JsonApiResponse<api_wire_types::OrgMetrics> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let OrgMetricsRequest {
        timestamp_gte,
        timestamp_lte,
        playbook_id,
    } = filters.into_inner();

    let search_params =
        move |statuses: Vec<OnboardingStatus>, only_has_wf: bool| -> ScopedVaultListQueryParams {
            ScopedVaultListQueryParams {
                tenant_id: tenant_id.clone(),
                is_live,
                kind: Some(VaultKind::Person),
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

    let result = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let new_user_vaults = count_for_tenant(conn, search_params(vec![], false))?;
            let total_user_onboardings = count_for_tenant(conn, search_params(vec![], true))?;
            let failed_user_onboardings =
                count_for_tenant(conn, search_params(vec![OnboardingStatus::Fail], true))?;
            let successful_user_onboardings =
                count_for_tenant(conn, search_params(vec![OnboardingStatus::Pass], true))?;
            let incomplete_user_onboardings =
                count_for_tenant(conn, search_params(vec![OnboardingStatus::Incomplete], true))?;
            let result = api_wire_types::OrgMetrics {
                new_user_vaults,
                total_user_onboardings,
                failed_user_onboardings,
                successful_user_onboardings,
                incomplete_user_onboardings,
            };
            Ok(result)
        })
        .await?;

    ResponseData::ok(result).json()
}
