use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::errors::tenant::TenantError;
use crate::errors::ValidationError;
use crate::telemetry::RootSpan;
use crate::types::ModernApiResult;
use crate::utils::actix::OptionalJson;
use crate::utils::db2api::DbToApi;
use crate::utils::headers::ExternalId;
use crate::utils::headers::IdempotencyId;
use crate::utils::headers::InsightHeaders;
use crate::utils::headers::SandboxId as SandboxIdHeader;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DataLifetimeSources;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use itertools::Itertools;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawDataRequest;
use newtypes::AccessEventKind;
use newtypes::AccessEventPurpose;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::DbActor;
use newtypes::SandboxId;
use newtypes::ValidateArgs;
use newtypes::VaultKind;
use paperclip::actix::web;

#[allow(clippy::unwrap_or_default)]
#[allow(clippy::too_many_arguments)]
pub async fn create_non_portable_vault(
    state: web::Data<State>,
    request: OptionalJson<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
    idempotency_id: IdempotencyId,
    sandbox_id: SandboxIdHeader,
    external_id: ExternalId,
    vault_kind: VaultKind,
    root_span: RootSpan,
) -> ModernApiResult<api_wire_types::LiteUser> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
    let insight = CreateInsightEvent::from(insight);

    let tenant_id = auth.tenant().id.clone();
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
    let request_info = if let Some(request) = request.into_inner() {
        let targets = request.keys().cloned().collect_vec();
        if !targets.is_empty() {
            let PatchDataRequest { updates, .. } =
                request.clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
            let updates = FingerprintedDataRequest::build_for_new_user(&state, updates, &tenant_id).await?;
            Some((targets, updates))
        } else {
            None
        }
    } else {
        None
    };

    if (external_id.is_some() || idempotency_id.is_some()) && request_info.is_some() {
        return Err(TenantError::CannotProvideBodyAndIdempotencyId.into());
    }

    let actor = auth.actor();
    let source = auth.dl_source();
    let (scoped_user, vault) = state
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

            if let Some((targets, request)) = request_info {
                // If any initial request data was provided, add it to the vault
                let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id)?;
                let sources = DataLifetimeSources::single(source);
                uvw.patch_data(conn, request, sources, Some(actor))?;

                let insight_event_id = insight.insert_with_conn(conn)?.id;

                // Create an access event to show data was added
                let aeid = AuditEventId::generate();
                NewAccessEventRow {
                    id: aeid.clone().into_correlated_access_event_id(),
                    scoped_vault_id: su.id.clone(),
                    tenant_id: su.tenant_id.clone(),
                    is_live: su.is_live,
                    reason: None,
                    principal: db_actor.clone(),
                    insight_event_id: insight_event_id.clone(),
                    kind: AccessEventKind::Update,
                    targets: targets.clone(),
                    purpose: AccessEventPurpose::Api,
                }
                .create(conn)?;

                NewAuditEvent {
                    id: aeid,
                    tenant_id: su.tenant_id.clone(),
                    principal_actor: db_actor,
                    insight_event_id,
                    detail: AuditEventDetail::UpdateUserData {
                        is_live: su.is_live,
                        scoped_vault_id: su.id.clone(),
                        updated_fields: targets,
                    },
                }
                .create(conn)?;
            }

            Ok((su, vault))
        })
        .await?;
    root_span.record("fp_id", scoped_user.fp_id.to_string());

    let response = api_wire_types::LiteUser::from_db((scoped_user, vault));
    Ok(response)
}
