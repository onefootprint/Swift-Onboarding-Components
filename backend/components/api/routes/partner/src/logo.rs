use actix_multipart::Multipart;
use api_core::auth::tenant::{
    CheckTenantGuard,
    PartnerTenantGuard,
    PartnerTenantSessionAuth,
};
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::partner_tenant::{
    PartnerTenant,
    UpdatePartnerTenant,
};
use paperclip::actix::web::HttpRequest;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Upload a new logo for the partner organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::put("/partner/logo")]
pub async fn put(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    payload: Multipart,
    request: HttpRequest,
) -> ModernApiResult<api_wire_types::PartnerOrganization> {
    let auth = auth.check_guard(PartnerTenantGuard::Admin)?;
    let pt_id = auth.partner_tenant().id.clone();

    let logo_url =
        api_route_org_common::logo::upload_org_logo(&state, (&pt_id).into(), payload, request).await?;

    // update the partner tenant url
    let update_pt = UpdatePartnerTenant {
        logo_url: Some(logo_url),
        ..Default::default()
    };

    let updated_pt = state
        .db_pool
        .db_transaction(move |conn| PartnerTenant::update(conn, &pt_id, update_pt))
        .await?;

    Ok(api_wire_types::PartnerOrganization::from_db(updated_pt))
}
