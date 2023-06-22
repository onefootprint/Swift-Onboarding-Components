use api_core::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    types::{JsonApiResponse, ResponseData},
    State,
};
use api_wire_types::{AlpacaCreateAccountRequest, AlpacaCreateAccountResponse};

use newtypes::PiiJsonValue;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Create an Alpaca account", tags(Integrations, Alpaca, Preview))]
#[actix::post("/integrations/alpaca/account")]
pub async fn post(
    _state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<AlpacaCreateAccountRequest>,
) -> JsonApiResponse<AlpacaCreateAccountResponse> {
    let _request = request.into_inner();
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let _is_live = auth.is_live()?;
    let _tenant_id = auth.tenant().id.clone();

    let alpaca_response = PiiJsonValue::new(serde_json::json!({}));
    let status_code = 200;
    ResponseData::ok(AlpacaCreateAccountResponse {
        status_code,
        alpaca_response,
    })
    .json()
}
