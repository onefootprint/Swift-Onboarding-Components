use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKey;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_core::auth::tenant::ClientTenantAuthContext;
use api_core::auth::tenant::TenantAuth;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::CanVault;
use api_core::auth::Either;
use api_core::errors::AssertionError;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::IgnoreLuhnValidation;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::DataLifetimeSources;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawBusinessDataRequest;
use newtypes::put_data_request::RawDataRequest;
use newtypes::put_data_request::RawUserDataRequest;
use newtypes::AccessEventKind;
use newtypes::AccessEventPurpose;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::DbActor;
use newtypes::FpId;
use newtypes::ValidateArgs;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[route_alias(actix::patch(
    "/users/{fp_id}/vault",
    description = "Updates data in a user vault.",
    tags(Users, Vault, PublicApi)
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault.",
    tags(Vault, Entities, Vault, Private)
)]
#[actix::patch("/entities/{fp_id}/vault")]
pub async fn patch(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<RawUserDataRequest>,
    auth: Either<TenantSessionAuth, TenantApiKey>,
    insight: InsightHeaders,
    ignore_luhn_validation: IgnoreLuhnValidation,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let path = path.into_inner();
    let request = request.into_inner().into();
    let result = patch_inner(&state, path, request, auth, insight, *ignore_luhn_validation).await?;
    Ok(result)
}

#[api_v2_operation(
    description = "Updates data in a business vault.",
    tags(Businesses, Vault, PublicApi)
)]
#[actix::patch("/businesses/{fp_bid}/vault")]
pub async fn patch_business(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<RawBusinessDataRequest>,
    auth: Either<TenantSessionAuth, TenantApiKey>,
    insight: InsightHeaders,
    ignore_luhn_validation: IgnoreLuhnValidation,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let path = path.into_inner();
    let request = request.into_inner().into();
    let result = patch_inner(&state, path, request, auth, insight, *ignore_luhn_validation).await?;
    Ok(result)
}

#[route_alias(actix::patch(
    "/users/vault",
    tags(ClientVaulting, Vault, Users, PublicApi, HideWhenLocked),
    description = "Updates data in a vault given a short-lived, entity-scoped client token."
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault given a short-lived, entity-scoped client token.",
    tags(ClientVaulting, Vault, Entities, Private)
)]
#[actix::patch("/entities/vault")]
pub async fn patch_client(
    state: web::Data<State>,
    request: Json<RawUserDataRequest>,
    auth: ClientTenantAuthContext,
    insight: InsightHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    // This is a little different - we actually require a permission to update the data in the
    // vault since the ClientTenantAuth tokens are scoped to specific fields
    let request = request.into_inner();
    let auth = auth.check_guard(CanVault::new(request.keys().cloned().collect()))?;
    let fp_id = auth.fp_id.clone();

    let result = patch_inner(&state, fp_id, request.into(), Box::new(auth), insight, false).await?;
    Ok(result)
}

async fn patch_inner(
    state: &State,
    fp_id: FpId,
    request: RawDataRequest,
    auth: Box<dyn TenantAuth>,
    insight: InsightHeaders,
    ignore_luhn_validation: bool,
) -> ApiResponse<api_wire_types::Empty> {
    let insight = CreateInsightEvent::from(insight);

    let tenant_id: newtypes::TenantId = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    // If the initial request has an ssn4, see if the vault already has the same ssn4 and if so no-op
    // TODO we'll probably want to generalize this logic for all pieces of info later. Could store
    // a hash(uv_id || di || value) inline on vault_data purely for duplicate checking
    use newtypes::IdentityDataKind as IDK;
    let ssn4 = IDK::Ssn4.into();
    let mut request = request;
    if let Some(new_ssn4) = request.get(&ssn4) {
        let fp_id = fp_id.clone();
        let tenant_id = tenant_id.clone();
        let uvw = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
                let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;
                Ok(vw)
            })
            .await?;
        if uvw.get(&ssn4).is_some() {
            let existing_ssn4 = uvw
                .decrypt_unchecked_single(&state.enclave_client, ssn4.clone())
                .await?
                .ok_or(AssertionError("No ssn4 found"))?;
            // If the ssn4 being added to the vault exactly matches the ssn4 on the vault, remove
            // it from the request to be added to the vault.
            // This is a special request from grid to prevent us from erroring when an ssn4 is
            // added that is consistent with the ssn9
            // This is pretty hacky since no other vaulting endpoints have this logic, and this isn't
            // represented in POST /validate
            // TODO https://linear.app/footprint/issue/FP-4973/make-all-vault-writes-idempotent
            let new_ssn4 = new_ssn4.clone().as_string().map_err(newtypes::Error::from)?;
            if existing_ssn4.safe_compare(&new_ssn4) {
                request.remove(&ssn4);
            }
        }
    }

    let sv = state
        .db_pool
        .db_query(move |conn| ScopedVault::get(conn, (&fp_id, &tenant_id, is_live)))
        .await?;

    let mut args = ValidateArgs::for_non_portable(is_live);
    args.ignore_luhn_validation = ignore_luhn_validation;
    let PatchDataRequest { updates, deletions } = PatchDataRequest::clean_and_validate(request, args)?;
    let updates = FingerprintedDataRequest::build(state, updates, &sv.id).await?;

    let source = auth.dl_source();
    let actor = auth.actor();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv.id)?;
            // TODO one day, delete in `patch_data` below and make a more informative timeline
            // event with context on what was updated, deleted, and added
            let deleted_dis = uvw.soft_delete_vault_data(conn, deletions)?;
            let updated_dis = updates.keys().cloned().collect_vec();
            let sources = DataLifetimeSources::single(source);
            uvw.patch_data(conn, updates, sources, Some(actor.clone()))?;

            let insight_event_id = insight.insert_with_conn(conn)?.id;
            let principal: DbActor = actor.into();

            // Create access events to show data was added/deleted
            if !updated_dis.is_empty() {
                let aeid = AuditEventId::generate();
                NewAccessEventRow {
                    id: aeid.clone().into_correlated_access_event_id(),
                    scoped_vault_id: sv.id.clone(),
                    tenant_id: sv.tenant_id.clone(),
                    is_live: sv.is_live,
                    reason: None,
                    principal: principal.clone(),
                    insight_event_id: insight_event_id.clone(),
                    kind: AccessEventKind::Update,
                    targets: updated_dis.clone(),
                    purpose: AccessEventPurpose::Api,
                }
                .create(conn)?;

                NewAuditEvent {
                    id: aeid,
                    tenant_id: sv.tenant_id.clone(),
                    principal_actor: principal.clone(),
                    insight_event_id: insight_event_id.clone(),
                    detail: AuditEventDetail::UpdateUserData {
                        is_live: sv.is_live,
                        scoped_vault_id: sv.id.clone(),
                        updated_fields: updated_dis,
                    },
                }
                .create(conn)?;
            }
            if !deleted_dis.is_empty() {
                let aeid = AuditEventId::generate();
                NewAccessEventRow {
                    id: aeid.clone().into_correlated_access_event_id(),
                    scoped_vault_id: sv.id.clone(),
                    tenant_id: sv.tenant_id.clone(),
                    is_live: sv.is_live,
                    reason: None,
                    principal: principal.clone(),
                    insight_event_id: insight_event_id.clone(),
                    kind: AccessEventKind::Delete,
                    targets: deleted_dis.clone(),
                    purpose: AccessEventPurpose::Api,
                }
                .create(conn)?;

                NewAuditEvent {
                    id: aeid,
                    tenant_id: sv.tenant_id,
                    principal_actor: principal,
                    insight_event_id,
                    detail: AuditEventDetail::DeleteUserData {
                        is_live: sv.is_live,
                        scoped_vault_id: sv.id,
                        deleted_fields: deleted_dis,
                    },
                }
                .create(conn)?;
            }

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
