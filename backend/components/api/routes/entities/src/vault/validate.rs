use crate::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::{
    ClientTenantAuthContext,
    TenantAuth,
};
use api_core::auth::CanVault;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::{
    DataLifetimeSources,
    DataRequestSource,
    FingerprintedDataRequest,
    TenantVw,
};
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::put_data_request::{
    PatchDataRequest,
    RawDataRequest,
};
use newtypes::{
    FpId,
    ValidateArgs,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[route_alias(
    actix::post(
        "/users/{fp_id}/vault/validate",
        tags(Users, Vault, PublicApi),
        description = "Checks if provided data is valid before adding it to the vault."
    ),
    actix::post(
        "/businesses/{fp_bid}/vault/validate",
        tags(Businesses, Vault, PublicApi),
        description = "Checks if provided data is valid before adding it to the vault."
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Checks if provided data is valid before adding it to the vault.",
    tags(Vault, Entities, Private)
)]
#[actix::post("/entities/{fp_id}/vault/validate")]
pub async fn post(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<RawDataRequest>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let result = post_inner(&state, path.into_inner(), request.into_inner(), auth).await?;
    Ok(result)
}

#[route_alias(actix::post(
    "/users/vault/validate",
    tags(Client, Vault, Users, PublicApi),
    description = "Checks if provided data is valid before adding it to the vault given a short-lived, user-scoped client token"
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Checks if provided data is valid before adding it to the vault given a short-lived, entity-scoped client token.",
    tags(Client, Vault, Entities, Private)
)]
#[actix::post("/entities/vault/validate")]
pub async fn post_client(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    auth: ClientTenantAuthContext,
) -> JsonApiResponse<api_wire_types::Empty> {
    // This is a little different - we actually require a permission to update the data in the
    // vault since the ClientTenantAuth tokens are scoped to specific fields
    let request = request.into_inner();
    let auth = auth.check_guard(CanVault::new(request.keys().cloned().collect()))?;
    let fp_id = auth.fp_id.clone();

    let result = post_inner(&state, fp_id, request, Box::new(auth)).await?;
    Ok(result)
}

async fn post_inner(
    state: &State,
    fp_id: FpId,
    request: RawDataRequest,
    auth: Box<dyn TenantAuth>,
) -> JsonApiResponse<api_wire_types::Empty> {
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let PatchDataRequest { updates, .. } =
        request.clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);
    let source = auth.dl_source();
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            let sources = DataLifetimeSources::single(source);

            uvw.validate_request(conn, updates, sources, Some(actor), DataRequestSource::PatchVault)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
