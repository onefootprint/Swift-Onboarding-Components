use alpaca::{AlpacaCip, CipRequest};
use api_core::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    errors::ApiResult,
    types::{JsonApiResponse, ResponseData},
    utils::{
        headers::InsightHeaders,
        vault_wrapper::{TenantVw, VaultWrapper},
    },
    State,
};
use api_wire_types::{AlpacaCipRequest, AlpacaCipResponse};
use db::models::scoped_vault::ScopedVault;
use newtypes::{PiiJsonValue, PiiString};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Forward CIP information to Alpaca",
    tags(Integrations, Alpaca, PublicApi)
)]
#[actix::post("/integrations/alpaca_cip")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<AlpacaCipRequest>,
    _insight: InsightHeaders,
) -> JsonApiResponse<AlpacaCipResponse> {
    let request = request.into_inner();
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let fp_id = request.fp_user_id;

    // make the client
    let alpaca_client = alpaca::AlpacaCipClient::new(request.api_key, request.api_secret, &request.hostname)?;

    // build our vault wrapper
    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    // build the cip request
    let cip_request = create_cip_request(&state, uvw, request.default_approver).await?;

    // fire off the cip request to alpaca
    let response = alpaca_client.send_cip(request.account_id, cip_request).await?;

    // parse the response as json and grab it's response code
    let status_code = response.status().as_u16();
    let alpaca_response: PiiJsonValue = response.json().await?;

    ResponseData::ok(AlpacaCipResponse {
        status_code,
        alpaca_response,
    })
    .json()
}

async fn create_cip_request(
    _state: &State,
    _uvw: TenantVw,
    _default_approver: PiiString,
) -> ApiResult<CipRequest> {
    //TODO: replace me
    Ok(CipRequest::test_fixture())
}
