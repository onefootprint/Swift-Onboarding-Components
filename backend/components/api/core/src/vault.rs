use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKey;
use crate::auth::tenant::TenantGuard;
use crate::errors::tenant::TenantError;
use crate::errors::ValidationError;
use crate::telemetry::RootSpan;
use crate::types::ApiResponse;
use crate::types::WithVaultVersionHeader;
use crate::utils::db2api::DbToApi;
use crate::utils::fp_id_path::FpIdPath;
use crate::utils::headers::ExternalId;
use crate::utils::headers::IdempotencyId;
use crate::utils::headers::InsightHeaders;
use crate::utils::headers::SandboxId as SandboxIdHeader;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DataLifetimeSources;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::PatchDataResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_errors::FpError;
use api_wire_types::UpdateEntityRequest;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultUpdate;
use db::models::scoped_vault_version::ScopedVaultVersion;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use db::DbError;
use itertools::Itertools;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::AuditEventDetail;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::PiiJsonValue;
use newtypes::PreviewApi;
use newtypes::SandboxId;
use newtypes::ValidateArgs;
use newtypes::VaultKind;
use paperclip::actix::web;
use std::collections::HashMap;

#[allow(clippy::unwrap_or_default)]
#[allow(clippy::too_many_arguments)]
pub async fn create_non_portable_vault(
    state: web::Data<State>,
    request: HashMap<DataIdentifier, PiiJsonValue>,
    auth: TenantApiKey,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
    sandbox_id: SandboxIdHeader,
    external_id: ExternalId,
    vault_kind: VaultKind,
    root_span: RootSpan,
) -> ApiResponse<WithVaultVersionHeader<api_wire_types::LiteUser>> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
    let insight = CreateInsightEvent::from(insight);

    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;

    let sandbox_id = sandbox_id.0;
    let sandbox_id = if is_live {
        if sandbox_id.is_some() {
            return Err(ValidationError("Cannot provide a sandbox ID outside of live mode").into());
        }
        None
    } else {
        Some(sandbox_id.unwrap_or_else(SandboxId::new))
    };

    let new_user = NewVaultArgs {
        public_key,
        e_private_key,
        is_live,
        kind: vault_kind,
        is_fixture: false,
        sandbox_id,
        is_created_via_api: true,
        duplicate_of_id: None,
    };

    // Parse optional request
    let targets = request.keys().cloned().collect_vec();
    let request_info = if !targets.is_empty() {
        let PatchDataRequest { updates, .. } =
            PatchDataRequest::clean_and_validate(request, ValidateArgs::for_non_portable(is_live))?;
        let updates = FingerprintedDataRequest::build_for_new_user(&state, updates, &tenant_id).await?;
        Some((targets, updates))
    } else {
        None
    };

    if (external_id.is_some() || idempotency_id.is_some()) && request_info.is_some() {
        return Err(TenantError::CannotProvideBodyAndIdempotencyId.into());
    }

    tracing::info!(idempotency_id_provided=%idempotency_id.is_some(), external_id_provided=%external_id.is_some(), "Creating new vault");

    let actor = auth.actor();
    let source = auth.dl_source();
    let (scoped_user, vault, new_version) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let idempotency_id = idempotency_id.0;
            let external_id = external_id.0;
            let db_actor: DbActor = actor.clone().into();
            let (su, vault) = ScopedVault::get_or_create_non_portable(
                conn,
                new_user,
                tenant_id,
                idempotency_id,
                external_id,
                db_actor.clone(),
            )?;

            let svv = if let Some((targets, request)) = request_info {
                // If any initial request data was provided, add it to the vault
                let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;
                let sources = DataLifetimeSources::single(source);
                let PatchDataResult {
                    new_ci: _,
                    seqno: _,
                    new_version,
                } = uvw.patch_data(conn, request, sources, Some(actor))?;

                let insight_event_id = insight.insert_with_conn(conn)?.id;

                // Create an audit event to show data was added
                let event = NewAuditEvent {
                    tenant_id: su.tenant_id.clone(),
                    principal_actor: db_actor,
                    insight_event_id,
                    detail: AuditEventDetail::UpdateUserData {
                        is_live: su.is_live,
                        scoped_vault_id: su.id.clone(),
                        updated_fields: targets,
                    },
                };
                AuditEvent::create(conn, event)?;

                new_version
            } else {
                ScopedVaultVersion::latest_version_number(conn, &su.id)?
            };

            Ok((su, vault, svv))
        })
        .await?;
    root_span.record("fp_id", scoped_user.fp_id.to_string());

    let response = api_wire_types::LiteUser::from_db((scoped_user, vault));


    let vault_version = if tenant.can_access_preview(&PreviewApi::VaultVersioning) {
        Some(new_version)
    } else {
        None
    };

    Ok(WithVaultVersionHeader::new(response, vault_version))
}

pub async fn patch_vault(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: UpdateEntityRequest,
    auth: TenantApiKey,
) -> FpResult<api_wire_types::LiteUser> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let UpdateEntityRequest { external_id } = request;
    let (sv, v) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let v = Vault::get(conn, &sv.vault_id)?;
            let update = ScopedVaultUpdate {
                external_id,
                ..Default::default()
            };
            let sv = ScopedVault::update(conn, &sv.id, update).map_err(|e| -> FpError {
                if matches!(e, DbError::UniqueConstraintViolation(_)) {
                    ValidationError("User or business with this external ID already exists").into()
                } else {
                    e.into()
                }
            })?;
            Ok((sv, v))
        })
        .await?;
    let response = api_wire_types::LiteUser::from_db((sv, v));
    Ok(response)
}
