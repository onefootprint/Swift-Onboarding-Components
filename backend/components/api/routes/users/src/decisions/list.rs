use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginatedResponseNoCount;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::web::Json;
use api_core::ApiResponse;
use api_core::FpResult;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::OnboardingStatus;
use newtypes::PreviewApi;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[route_alias(get(
    "/businesses/{fp_bid}/decisions",
    description = "Returns list of decisions made for this business in timestamp descending order. Includes both automated decisions made by running rules on a playbook and manual decisions made via dashboard users.",
    tags(Businesses, Preview)
))]
#[api_v2_operation(
    description = "Returns list of decisions made for this user in timestamp descending order. Includes both automated decisions made by running rules on a playbook and manual decisions made via dashboard users.",
    tags(Users, Preview)
)]
#[get("/users/{fp_id}/decisions")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
    pagination: web::Query<OffsetPaginationRequest>,
) -> ApiResponse<Json<OffsetPaginatedResponseNoCount<api_wire_types::PublicOnboardingDecision>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    auth.check_preview_guard(PreviewApi::DecisionsList)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let pagination = pagination.db_pagination(&state);

    let (decisions, next_page) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (decisions, next_page) =
                OnboardingDecision::list(conn, &sv.id, Default::default(), pagination)?;
            Ok((decisions, next_page))
        })
        .await?;

    let results = decisions
        .into_iter()
        .filter(|(_, wf, _)| wf.kind.has_tenant_facing_decision())
        // Filter out step up decisions
        .filter(|(d, _, _)| OnboardingStatus::from(d.status).is_terminal())
        .map(api_wire_types::PublicOnboardingDecision::from_db)
        .collect::<Vec<_>>();
    Ok(Json(OffsetPaginatedResponse::ok_no_count(results, next_page)))
}
