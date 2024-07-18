use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_core::auth::tenant::ClientTenantAuthContext;
use api_core::auth::tenant::TenantAuth;
use api_core::auth::CanVault;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::DataLifetimeSources;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::TenantVw;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawBusinessDataRequest;
use newtypes::put_data_request::RawDataRequest;
use newtypes::put_data_request::RawUserDataRequest;
use newtypes::FpId;
use newtypes::ValidateArgs;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[route_alias(actix::post(
    "/users/{fp_id}/vault/validate",
    tags(Users, Vault, PublicApi),
    description = "Checks if provided data is valid before adding it to the vault. Returns an HTTP 200 if there are no validation errors, or HTTP 400 with context describing validation errors if any."
))]
#[api_v2_operation(
    description = "Checks if provided data is valid before adding it to the vault. Returns an HTTP 200 if there are no validation errors, or HTTP 400 with context describing validation errors if any.",
    tags(Vault, Entities, Private)
)]
#[actix::post("/entities/{fp_id}/vault/validate")]
pub async fn post(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<RawUserDataRequest>,
    auth: SecretTenantAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let result = post_inner(&state, path.into_inner(), request.into_inner().into(), auth).await?;
    Ok(result)
}


#[api_v2_operation(
    tags(Businesses, Vault, PublicApi),
    description = "Checks if provided data is valid before adding it to the vault. Returns an HTTP 200 if there are no validation errors, or HTTP 400 with context describing validation errors if any."
)]
#[actix::post("/businesses/{fp_bid}/vault/validate")]
pub async fn post_business(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<RawBusinessDataRequest>,
    auth: SecretTenantAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let result = post_inner(&state, path.into_inner(), request.into_inner().into(), auth).await?;
    Ok(result)
}

#[route_alias(actix::post(
    "/users/vault/validate",
    tags(Client, Vault, Users, PublicApi),
    description = "Checks if provided data is valid before adding it to the vault given a short-lived, user-scoped client token. Returns an HTTP 200 if there are no validation errors, or HTTP 400 with context describing validation errors if any."
))]
#[api_v2_operation(
    description = "Checks if provided data is valid before adding it to the vault given a short-lived, user-scoped client token. Returns an HTTP 200 if there are no validation errors, or HTTP 400 with context describing validation errors if any.",
    tags(Client, Vault, Entities, Private)
)]
#[actix::post("/entities/vault/validate")]
pub async fn post_client(
    state: web::Data<State>,
    request: Json<RawUserDataRequest>,
    auth: ClientTenantAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    // This is a little different - we actually require a permission to update the data in the
    // vault since the ClientTenantAuth tokens are scoped to specific fields
    let request = request.into_inner();
    let auth = auth.check_guard(CanVault::new(request.keys().cloned().collect()))?;
    let fp_id = auth.fp_id.clone();

    let result = post_inner(&state, fp_id, request.into(), Box::new(auth)).await?;
    Ok(result)
}

async fn post_inner(
    state: &State,
    fp_id: FpId,
    request: RawDataRequest,
    auth: Box<dyn TenantAuth>,
) -> ApiResponse<api_wire_types::Empty> {
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let PatchDataRequest { updates, .. } =
        PatchDataRequest::clean_and_validate(request, ValidateArgs::for_non_portable(is_live))?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);
    let source = auth.dl_source();
    state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            let sources = DataLifetimeSources::single(source);

            uvw.validate_request(conn, updates, sources, Some(actor), DataRequestSource::PatchVault)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
