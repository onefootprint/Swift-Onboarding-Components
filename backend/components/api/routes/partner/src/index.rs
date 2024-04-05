use actix_web::web;
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    serializers::IsDomainAlreadyClaimed,
    types::{response::ResponseData, JsonApiResponse},
    utils::db2api::DbToApi,
    State,
};
use db::models::partner_tenant::PartnerTenant;
use paperclip::actix::{self, api_v2_operation, web::Json};

#[api_v2_operation(
    tags(Organization, OrgSettings, Private),
    description = "Returns basic info about the authed partner tenant"
)]
#[actix::get("/partner")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::PartnerOrganization> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant().clone();

    let domains = pt.domains.clone();
    let is_domain_already_claimed = state
        .db_pool
        .db_query(move |conn| PartnerTenant::is_domain_already_claimed(conn, &domains))
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::PartnerOrganization::from_db((
            pt,
            Some(IsDomainAlreadyClaimed(is_domain_already_claimed)),
        )),
    )))
}
