use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    types::{EmptyResponse, ResponseData},
};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Creates a new IAM user for the partner tenant. Sends an invite link via WorkOs.",
    tags(Compliance, Private)
)]
#[actix::post("/compliance/org/members")]
pub async fn post(
    _state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Admin)?;
    let pt = auth.partner_tenant();
    dbg!(pt);

    ResponseData::ok(EmptyResponse {}).json()
}
