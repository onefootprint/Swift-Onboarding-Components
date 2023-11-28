use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::telemetry::RootSpan;
use crate::types::ResponseData;
use crate::utils::actix::OptionalJson;
use crate::utils::db2api::DbToApi;
use crate::utils::headers::IdempotencyId;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;

use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use itertools::Itertools;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawDataRequest;
use newtypes::AccessEventKind;
use newtypes::AccessEventPurpose;
use newtypes::SandboxId;
use newtypes::ValidateArgs;
use newtypes::VaultKind;
use paperclip::actix::web;

pub async fn create_non_portable_vault(
    state: web::Data<State>,
    request: OptionalJson<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
    vault_kind: VaultKind,
    root_span: RootSpan,
) -> ApiResult<ResponseData<api_wire_types::LiteUser>> {
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
        kind: vault_kind,
        is_fixture: false,
        // TODO allow providing sandbox ID in a header
        sandbox_id: (!is_live).then(SandboxId::new),
        is_created_via_api: true,
    };

    // Parse optional request
    let request_info = if let Some(request) = request.into_inner() {
        let targets = request.keys().cloned().collect_vec();
        if !targets.is_empty() {
            let PatchDataRequest { updates, .. } =
                request.clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
            let updates = updates
                .build_tenant_fingerprints(state.as_ref(), &tenant_id)
                .await?;
            Some((targets, updates))
        } else {
            None
        }
    } else {
        None
    };

    if idempotency_id.is_some() && request_info.is_some() {
        return Err(TenantError::CannotProvideBodyAndIdempotencyId.into());
    }

    let actor = auth.actor();
    let source = auth.source();
    let (scoped_user, vault) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let i_id = idempotency_id.0;
            let db_actor = actor.clone().into();
            let (su, vault) =
                ScopedVault::get_or_create_non_portable(conn, new_user, tenant_id, i_id, db_actor)?;

            if let Some((targets, request)) = request_info {
                // If any initial request data was provided, add it to the vault
                let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;
                uvw.patch_data(conn, request, source, Some(actor))?;
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
                    purpose: AccessEventPurpose::Api,
                }
                .create(conn)?;
            }

            Ok((su, vault))
        })
        .await?;
    root_span.record("fp_id", scoped_user.fp_id.to_string());

    Ok(ResponseData::ok(api_wire_types::LiteUser::from_db((
        scoped_user,
        vault,
    ))))
}
