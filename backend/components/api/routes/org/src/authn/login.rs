use api_core::types::ModernApiResult;
use api_core::State;
use api_wire_types::{
    OrgLoginResponse,
    TenantLoginRequest,
};
use newtypes::TenantKind;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    tags(Auth, Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future requests as well as user information"
)]
#[post("/org/auth/login")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<TenantLoginRequest>,
) -> ModernApiResult<OrgLoginResponse> {
    let request = request.into_inner();
    let data = api_route_org_common::login::handle_login(
        state,
        request.code,
        request.request_org_id,
        TenantKind::Tenant,
    )
    .await?;
    Ok(data)
}
