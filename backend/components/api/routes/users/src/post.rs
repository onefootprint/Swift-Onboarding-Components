use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::utils::headers::{ExternalId, IdempotencyId};
use api_core::vault::create_non_portable_vault;
use api_core::{telemetry::RootSpan, utils::actix::OptionalJson};
use newtypes::put_data_request::RawDataRequest;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Creates a new user, optionally initializing with the provided data",
    tags(Users, Vault, PublicApi)
)]
#[post("/users")]
pub async fn post(
    state: web::Data<State>,
    request: OptionalJson<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
    external_id: ExternalId,
    root_span: RootSpan,
) -> ApiResult<ResponseData<api_wire_types::LiteUser>> {
    let result = create_non_portable_vault(
        state,
        request,
        auth,
        insight,
        idempotency_id,
        external_id,
        VaultKind::Person,
        root_span,
    )
    .await?;
    Ok(result)
}
