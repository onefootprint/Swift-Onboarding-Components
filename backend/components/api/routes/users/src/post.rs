use crate::auth::tenant::TenantApiKey;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::actix::OptionalJson;
use api_core::utils::headers::ExternalId;
use api_core::utils::headers::IdempotencyId;
use api_core::utils::headers::SandboxId;
use api_core::vault::create_non_portable_vault;
use newtypes::put_data_request::RawUserDataRequest;
use newtypes::VaultKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[allow(clippy::too_many_arguments)]
#[api_v2_operation(
    description = "Creates a new user, optionally initializing with the provided data",
    tags(Users, Vault, PublicApi)
)]
#[post("/users")]
pub async fn post(
    state: web::Data<State>,
    request: OptionalJson<RawUserDataRequest>,
    auth: TenantApiKey,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
    sandbox_id: SandboxId,
    external_id: ExternalId,
    root_span: RootSpan,
) -> ApiResponse<api_wire_types::LiteUser> {
    let result = create_non_portable_vault(
        state,
        request.0.unwrap_or_default().into(),
        auth,
        insight,
        idempotency_id,
        sandbox_id,
        external_id,
        VaultKind::Person,
        root_span,
    )
    .await?;
    Ok(result)
}
