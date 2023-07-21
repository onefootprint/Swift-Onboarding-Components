use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::errors::tenant::TenantError;
use api_core::utils::actix::OptionalJson;
use api_core::utils::headers::IdempotencyId;
use api_core::utils::vault_wrapper::Any;

use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use itertools::Itertools;
use newtypes::put_data_request::RawDataRequest;
use newtypes::AccessEventKind;
use newtypes::SandboxId;
use newtypes::ValidateArgs;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Creates a new user vault, optionally initializing with the provided data",
    tags(Users, Vault, PublicApi)
)]
#[post("/users")]
pub async fn post(
    state: web::Data<State>,
    request: OptionalJson<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
) -> ApiResult<ResponseData<api_wire_types::UserId>> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
    let principal = auth.actor().into();
    let insight = CreateInsightEvent::from(insight);

    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let new_user = NewVaultArgs {
        public_key,
        e_private_key,
        is_live,
        is_portable: false,
        kind: VaultKind::Person,
        is_fixture: false,
        // TODO allow providing sandbox ID in a header
        sandbox_id: (!is_live).then(SandboxId::new),
    };

    // Parse optional request
    let request_info = if let Some(request) = request.into_inner() {
        let targets = request.keys().cloned().collect_vec();
        if !targets.is_empty() {
            let request = request.clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
            let request = request
                .build_tenant_fingerprints(state.as_ref(), &tenant_id)
                .await?;
            Some((targets, request))
        } else {
            None
        }
    } else {
        None
    };

    if idempotency_id.is_some() && request_info.is_some() {
        return Err(TenantError::CannotProvideBodyAndIdempotencyId.into());
    }

    let actor = auth.actor().into();
    let scoped_user = state
        .db_pool
        .db_transaction(|conn| -> ApiResult<_> {
            let (su, _) =
                ScopedVault::get_or_create_non_portable(conn, new_user, tenant_id, idempotency_id.0, actor)?;

            if let Some((targets, request)) = request_info {
                // If any initial request data was provided, add it to the vault
                let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;
                uvw.patch_data(conn, request)?;
                // Create an access event to show data was added
                NewAccessEvent {
                    scoped_vault_id: su.id.clone(),
                    tenant_id: su.tenant_id.clone(),
                    is_live: su.is_live,
                    reason: None,
                    principal,
                    insight,
                    kind: AccessEventKind::Update,
                    targets,
                }
                .create(conn)?;
            }

            Ok(su)
        })
        .await?;

    Ok(ResponseData::ok(api_wire_types::UserId::from_db(scoped_user)))
}
