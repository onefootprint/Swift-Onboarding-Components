use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKeyAuth;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use actix_web::web::Query;
use api_core::types::WithVaultVersionHeader;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::VaultVersion;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::FpResult;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_version::ScopedVaultVersion;
use macros::route_alias;
use newtypes::impl_map_apiv2_schema;
use newtypes::impl_response_type;
use newtypes::input::Csv;
use newtypes::BusinessDataIdentifier;
use newtypes::DataIdentifier;
use newtypes::PreviewApi;
use newtypes::ScopedVaultVersionNumber;
use newtypes::UserDataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct UserFieldsParam {
    /// Optionally, a comma-separated list of fields whose existence to check. For example,
    /// `id.first_name,id.ssn4,custom.account_id`
    #[openapi(serialize_as = "Option<Vec<UserDataIdentifier>>")]
    fields: Option<Csv<DataIdentifier>>,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct BusinessFieldsParam {
    /// Optionally, a comma-separated list of fields whose existence to check. For example,
    /// `business.name,business.website,custom.account_id`
    #[openapi(serialize_as = "Option<Vec<BusinessDataIdentifier>>")]
    fields: Option<Csv<DataIdentifier>>,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct GetUserVaultResponse(HashMap<DataIdentifier, bool>);

impl_map_apiv2_schema!(
    GetUserVaultResponse<UserDataIdentifier, bool>,
    "A key-value map of identifier to whether the identifier exists in the vault",
    { "id.first_name": true, "id.ssn9": true, "custom.credit_card": true, "id.dob": false }
);
impl_response_type!(GetUserVaultResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct GetBusinessVaultResponse(HashMap<DataIdentifier, bool>);

impl_map_apiv2_schema!(
    GetBusinessVaultResponse<BusinessDataIdentifier, bool>,
    "A key-value map of identifier to whether the identifier exists in the business vault",
    { "business.name": true, "business.website": true, "custom.account_id": true }
);
impl_response_type!(GetBusinessVaultResponse);

#[route_alias(actix::get(
    "/users/{fp_id}/vault",
    description = "Returns information on which fields are present in the user vault.",
    tags(Users, Vault, PublicApi)
))]
#[api_v2_operation(
    description = "Returns information on which fields are present in the vault.",
    tags(Vault, Entities, Private)
)]
#[actix::get("/entities/{fp_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: FpIdPath,
    request: Query<UserFieldsParam>,
    vault_version: VaultVersion,
    auth: Either<TenantSessionAuth, TenantApiKeyAuth>,
) -> ApiResponse<WithVaultVersionHeader<GetUserVaultResponse>> {
    let UserFieldsParam { fields } = request.into_inner();
    let (result, vault_version) = get_inner(state, path, fields, vault_version, auth).await?;

    Ok(WithVaultVersionHeader::new(
        GetUserVaultResponse(result),
        vault_version,
    ))
}

#[api_v2_operation(
    description = "Returns information on which fields are present in the business vault.",
    tags(Businesses, Vault, PublicApi)
)]
#[actix::get("/businesses/{fp_bid}/vault")]
pub async fn get_business(
    state: web::Data<State>,
    path: FpIdPath,
    request: Query<BusinessFieldsParam>,
    vault_version: VaultVersion,
    auth: Either<TenantSessionAuth, TenantApiKeyAuth>,
) -> ApiResponse<WithVaultVersionHeader<GetBusinessVaultResponse>> {
    let BusinessFieldsParam { fields } = request.into_inner();
    let (result, vault_version) = get_inner(state, path, fields, vault_version, auth).await?;

    Ok(WithVaultVersionHeader::new(
        GetBusinessVaultResponse(result),
        vault_version,
    ))
}

async fn get_inner(
    state: web::Data<State>,
    path: FpIdPath,
    fields: Option<Csv<DataIdentifier>>,
    vault_version: VaultVersion,
    auth: Either<TenantSessionAuth, TenantApiKeyAuth>,
) -> ApiResponse<(HashMap<DataIdentifier, bool>, Option<ScopedVaultVersionNumber>)> {
    let fp_id = path.into_inner();

    let auth = auth.check_guard(TenantGuard::Read)?;
    let is_live = auth.is_live()?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let vault_version = if tenant.can_access_preview(&PreviewApi::VaultVersioning) {
        vault_version.into_inner()
    } else {
        None
    };

    let (uvw, svvn) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let svvn = if let Some(svvn) = vault_version {
                svvn
            } else {
                ScopedVaultVersion::latest_version_number(conn, &scoped_vault.id)?
            };
            let seqno = ScopedVaultVersion::get_seqno(conn, &scoped_vault.id, svvn)?;

            let uvw: TenantVw = VaultWrapper::build_for_tenant_version(conn, &scoped_vault.id, seqno)?;

            Ok((uvw, svvn))
        })
        .await?;

    let populated = uvw.populated_dis();
    let keys = if let Some(fields) = fields {
        fields.to_vec()
    } else {
        populated.clone()
    };
    let results = HashMap::from_iter(keys.into_iter().map(|di| (di.clone(), populated.contains(&di))));

    let vault_version = if tenant.can_access_preview(&PreviewApi::VaultVersioning) {
        Some(svvn)
    } else {
        None
    };
    Ok((results, vault_version))
}
