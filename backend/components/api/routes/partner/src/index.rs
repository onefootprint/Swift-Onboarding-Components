use actix_web::web;
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::{tenant::TenantError, ApiResult},
    serializers::IsDomainAlreadyClaimed,
    types::{response::ResponseData, JsonApiResponse},
    utils::db2api::DbToApi,
    State,
};
use db::models::partner_tenant::{PartnerTenant, UpdatePartnerTenant};
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

#[api_v2_operation(
    tags(Organization, OrgSettings, Private),
    description = "Updates the basic information for the tenant"
)]
#[actix::patch("/partner")]
pub async fn patch(
    state: web::Data<State>,
    request: web::Json<api_wire_types::UpdatePartnerTenantRequest>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::PartnerOrganization> {
    let auth = auth.check_guard(PartnerTenantGuard::Admin)?;
    let pt = auth.partner_tenant().clone();
    let pt_id = pt.id.clone();

    let api_wire_types::UpdatePartnerTenantRequest {
        name,
        website_url,
        allow_domain_access,
    } = request.into_inner();

    if allow_domain_access == Some(true) && pt.domains.is_empty() {
        return Err(
            TenantError::ValidationError("Partner tenant has no associated domain".to_string()).into(),
        );
    }

    let update_pt = UpdatePartnerTenant {
        name,
        logo_url: None,
        website_url,
        allow_domain_access,
    };

    let updated_pt = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let pt = PartnerTenant::lock(conn, &pt_id)?;

            // If we're enabling domain access, ensure the partner tenant's domains aren't already claimed.
            // TODO: Enforce this better with a uniqueness constraint on claimed domains in the DB.
            if !pt.allow_domain_access
                && update_pt.allow_domain_access.is_some_and(|allow| allow)
                && PartnerTenant::is_domain_already_claimed(conn, &pt.domains)?
            {
                return Err(TenantError::ValidationError(
                    "Can not allow domain access: domains are already claimed".to_string(),
                )
                .into());
            }

            Ok(PartnerTenant::update(conn, &pt_id, update_pt)?)
        })
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::PartnerOrganization::from_db(updated_pt),
    )))
}
