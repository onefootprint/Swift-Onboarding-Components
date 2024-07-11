use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use api_wire_types::OnboardingConfigFilters;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use db::models::rule_set_version::RuleSetVersion;
use db::DbError;
use newtypes::ObConfigurationId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Returns a list of onboarding configurations owned by the tenant."
)]
#[get("/org/onboarding_configs")]
async fn get_list(
    state: web::Data<State>,
    filters: web::Query<OnboardingConfigFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
) -> ApiResponse<Json<OffsetPaginatedResponse<api_wire_types::OnboardingConfiguration>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let pagination = pagination.db_pagination(&state);
    let OnboardingConfigFilters {
        status,
        search,
        kinds,
    } = filters.into_inner();
    let kinds = kinds.map(|k| k.into_iter().collect());

    let query = ObConfigurationQuery {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        status,
        search,
        kinds,
    };
    let (results, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let (results, next_page) = ObConfiguration::list(conn, &query, pagination)?;
            let count = ObConfiguration::count(conn, &query)?;
            Ok((results, next_page, count))
        })
        .await?;

    let results = results
        .into_iter()
        .map(|(obc, actor, rs)| {
            api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone()))
        })
        .collect::<Vec<_>>();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Returns an onboarding configuration."
)]
#[get("/org/onboarding_configs/{id}")]
async fn get_detail(
    state: web::Data<State>,
    ob_config_id: web::Path<ObConfigurationId>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let ob_config_id = ob_config_id.into_inner();

    let (obc, actor, rs) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;

    let result = api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.ff_client.clone()));
    Ok(result)
}
