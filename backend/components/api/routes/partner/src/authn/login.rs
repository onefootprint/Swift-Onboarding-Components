use api_core::types::ModernApiResult;
use api_core::State;
use api_wire_types::OrgLoginResponse;
use api_wire_types::PartnerLoginRequest;
use newtypes::TenantKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Auth, Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future partner requests as well as user information"
)]
#[post("/partner/auth/login")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<PartnerLoginRequest>,
) -> ModernApiResult<OrgLoginResponse> {
    let request = request.into_inner();
    let data = api_route_org_common::login::handle_login(
        state,
        request.code,
        request.request_org_id,
        TenantKind::PartnerTenant,
    )
    .await?;
    Ok(data)
}
