use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::OnboardingConfigFilters;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationQuery;
use newtypes::PlaybookId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Returns a list of playbooks owned by the tenant."
)]
#[get("/org/playbooks")]
pub async fn get_playbooks(
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
        playbook_id: None,
        include_deactivated_versions: false,
    };
    let (results, next_page, count) = state
        .db_query(move |conn| {
            let (results, next_page) = ObConfiguration::list(conn, &query, pagination)?;
            let count = ObConfiguration::count(conn, &query)?;
            Ok((results, next_page, count))
        })
        .await?;

    let results = results
        .into_iter()
        .map(|(playbook, obc, actor, rs)| {
            api_wire_types::OnboardingConfiguration::from_db((
                playbook,
                obc,
                actor,
                rs,
                state.ff_client.clone(),
            ))
        })
        .collect::<Vec<_>>();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Returns the version history of onboarding configurations for the given playbook."
)]
#[get("/org/playbooks/{playbook_id}/versions")]
async fn get_versions(
    state: web::Data<State>,
    playbook_id: web::Path<PlaybookId>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
) -> ApiResponse<Json<OffsetPaginatedResponse<api_wire_types::OnboardingConfiguration>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let pagination = pagination.db_pagination(&state);

    let query = ObConfigurationQuery {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        status: None,
        search: None,
        kinds: None,
        playbook_id: Some(playbook_id.into_inner()),
        include_deactivated_versions: true,
    };
    let (results, next_page, count) = state
        .db_query(move |conn| {
            let (results, next_page) = ObConfiguration::list(conn, &query, pagination)?;
            let count = ObConfiguration::count(conn, &query)?;
            Ok((results, next_page, count))
        })
        .await?;

    let results = results
        .into_iter()
        .map(|(playbook, obc, actor, rs)| {
            api_wire_types::OnboardingConfiguration::from_db((
                playbook,
                obc,
                actor,
                rs,
                state.ff_client.clone(),
            ))
        })
        .collect::<Vec<_>>();

    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}
