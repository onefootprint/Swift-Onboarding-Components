use crate::auth::tenant::SecretTenantAuthContext;
use crate::ApiResponse;
use crate::FpResult;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginatedResponseMetaNoCount;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::web::Json;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use macros::route_alias;
use newtypes::PreviewApi;
use newtypes::WorkflowKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

type OnboardingsListResponse =
    OffsetPaginatedResponse<api_wire_types::PublicOnboarding, OffsetPaginatedResponseMetaNoCount>;


#[route_alias(get(
    "/businesses/{fp_bid}/onboardings",
    description = "Get the list of playbooks a business has onboarded onto, ordered by timestamp descending. If a business has onboarded onto one playbook multiple times, there will be two separate onboardings.",
    tags(Businesses, Preview)
))]
#[api_v2_operation(
    description = "Get the list of playbooks a user has onboarded onto, ordered by timestamp descending. If a user has onboarded onto one playbook multiple times, there will be two separate onboardings.",
    tags(Users, Preview)
)]
#[get("/users/{fp_id}/onboardings")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: SecretTenantAuthContext,
    fp_id: FpIdPath,
) -> ApiResponse<Json<OnboardingsListResponse>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    auth.check_preview_guard(PreviewApi::OnboardingsList)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let pagination = pagination.db_pagination(&state);
    let (wfs, next_page) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (wfs, next_page) = Workflow::list(conn, &sv.id, pagination)?;
            Ok((wfs, next_page))
        })
        .await?;

    let results = wfs
        .into_iter()
        .filter_map(|(wf, obc)| obc.map(|obc| (wf, obc)))
        .filter(|(wf, _)| match wf.kind {
            WorkflowKind::Kyb | WorkflowKind::Kyc | WorkflowKind::AlpacaKyc => true,
            // Don't show status of document-only workflows triggered via the dashboard. Onboardings onto
            // document playbooks actually use the Kyc workflow (which is shown above)
            WorkflowKind::Document => false,
        })
        // Start by only showing workflows with a terminal decision
        .filter(|(wf, _)| wf.status.is_terminal())
        .map(api_wire_types::PublicOnboarding::from_db)
        .collect();
    let response = OffsetPaginatedResponse::ok_no_count(results, next_page);
    Ok(Json(response))
}
