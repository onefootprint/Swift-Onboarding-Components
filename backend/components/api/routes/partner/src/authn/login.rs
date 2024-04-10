use api_core::{errors::ApiError, types::response::ResponseData, State};
use api_wire_types::{OrgLoginResponse, PartnerLoginRequest};
use newtypes::TenantKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    tags(Auth, Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future partner requests as well as user information"
)]
#[post("/partner/auth/login")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<PartnerLoginRequest>,
) -> actix_web::Result<Json<ResponseData<OrgLoginResponse>>, ApiError> {
    let request = request.into_inner();
    let data = api_route_org_common::login::handle_login(
        state,
        request.code,
        request.request_org_id,
        TenantKind::PartnerTenant,
    )
    .await?;
    ResponseData { data }.json()
}
