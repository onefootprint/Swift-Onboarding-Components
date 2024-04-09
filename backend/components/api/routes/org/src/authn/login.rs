use api_core::{errors::ApiError, types::response::ResponseData, State};
use api_wire_types::{OrgLoginRequest, OrgLoginResponse};
use newtypes::{TenantId, TenantKind};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    tags(Auth, Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future requests as well as user information"
)]
#[post("/org/auth/login")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<OrgLoginRequest<TenantId>>,
) -> actix_web::Result<Json<ResponseData<OrgLoginResponse>>, ApiError> {
    let data = api_route_org_common::login::handle_login(state, request, TenantKind::Tenant).await?;
    ResponseData { data }.json()
}
