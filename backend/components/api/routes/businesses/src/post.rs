use crate::{auth::tenant::SecretTenantAuthContext, utils::headers::InsightHeaders, State};
use api_core::{
    telemetry::RootSpan,
    types::JsonApiResponse,
    utils::{
        actix::OptionalJson,
        headers::{ExternalId, IdempotencyId, SandboxId},
    },
    vault::create_non_portable_vault,
};
use newtypes::{put_data_request::RawDataRequest, VaultKind};
use paperclip::actix::{api_v2_operation, post, web};

#[allow(clippy::too_many_arguments)]
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
    sandbox_id: SandboxId,
    external_id: ExternalId,
    root_span: RootSpan,
) -> JsonApiResponse<api_wire_types::LiteUser> {
    let result = create_non_portable_vault(
        state,
        request,
        auth,
        insight,
        idempotency_id,
        sandbox_id,
        external_id,
        VaultKind::Business,
        root_span,
    )
    .await?;
    Ok(result)
}
