use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    types::{EmptyResponse, ResponseData},
};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Returns a summary of partnered companies for a compliance partner.",
    tags(Compliance, Private)
)]
#[actix::get("/compliance/companies")]
pub async fn get(_state: web::Data<State>, auth: PartnerTenantSessionAuth) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    dbg!(pt);

    ResponseData::ok(EmptyResponse {}).json()
}
