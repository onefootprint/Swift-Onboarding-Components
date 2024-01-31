use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{
    errors::ApiResult,
    types::{JsonApiResponse, OffsetPaginatedResponse, OffsetPaginationRequest},
};
use api_wire_types::OnboardingConfigFilters;
use db::{
    models::ob_configuration::{ObConfiguration, ObConfigurationQuery},
    DbError, OffsetPagination,
};
use newtypes::ObConfigurationId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

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
) -> ApiResult<Json<OffsetPaginatedResponse<api_wire_types::OnboardingConfiguration>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let pagination = OffsetPagination::new(page, page_size);
    let OnboardingConfigFilters { status, search } = filters.into_inner();

    let query = ObConfigurationQuery {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        status,
        search,
    };
    let (results, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let (results, next_page) = ObConfiguration::list(conn, &query, pagination)?;
            let count = ObConfiguration::count(conn, &query)?;
            Ok((results, next_page, count))
        })
        .await??;

    let results = results
        .into_iter()
        .map(|(obc, actor)| {
            api_wire_types::OnboardingConfiguration::from_db((obc, actor, state.feature_flag_client.clone()))
        })
        .collect::<Vec<_>>();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Returns a list of onboarding configurations owned by the tenant."
)]
#[get("/org/onboarding_configs/{id}")]
async fn get_detail(
    state: web::Data<State>,
    ob_config_id: web::Path<ObConfigurationId>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let ob_config_id = ob_config_id.into_inner();

    let (obc, actor) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc)?;
            Ok((obc, actor))
        })
        .await??;

    let result =
        api_wire_types::OnboardingConfiguration::from_db((obc, actor, state.feature_flag_client.clone()));
    ResponseData::ok(result).json()
}
