use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::utils::actix::OptionalJson;
use api_core::utils::headers::IdempotencyId;
use api_core::vault::create_non_portable_vault;
use newtypes::put_data_request::RawDataRequest;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Creates a new business vault, optionally initializing with the provided data",
    tags(Businesses, Vault, PublicApi)
)]
#[post("/businesses")]
pub async fn post(
    state: web::Data<State>,
    request: OptionalJson<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
) -> ApiResult<ResponseData<api_wire_types::UserId>> {
    let result =
        create_non_portable_vault(state, request, auth, insight, idempotency_id, VaultKind::Business).await?;
    Ok(result)
}
