use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::utils::vault_wrapper::TenantVw;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{FpId, ValidateArgs};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[route_alias(
    actix::post(
        "/users/{footprint_user_id}/vault/validate",
        tags(Users, Vault, PublicApi),
        description = "Checks if provided data is valid before adding it to the vault."
    ),
    actix::post(
        "/businesses/{footprint_biz_id}/vault/validate",
        tags(Businesses, Vault, PublicApi),
        description = "Checks if provided data is valid before adding it to the vault."
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Checks if provided data is valid before adding it to the vault.",
    tags(Vault, Entities, Preview)
)]
#[actix::post("/entities/{fp_id}/vault/validate")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let fp_id = path.into_inner();

    let tenant_auth = tenant_auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;

    let request = request
        .into_inner()
        .clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;
    request.assert_allowable_identifiers(uvw.vault.kind)?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively
    uvw.validate_request(request)?;

    EmptyResponse::ok().json()
}
