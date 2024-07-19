use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use actix_web::web::Query;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::FpResult;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::impl_map_apiv2_schema;
use newtypes::impl_response_type;
use newtypes::input::Csv;
use newtypes::DataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Optionally, a comma-separated list of fields whose existence to check. For example,
    /// `id.first_name,id.ssn4,custom.account_id`
    fields: Option<Csv<DataIdentifier>>,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct GetVaultResponse(HashMap<DataIdentifier, bool>);

impl_map_apiv2_schema!(
    GetVaultResponse<DataIdentifier, bool>,
    "A key-value map of identifier to whether the identifier exists in the vault",
    { "id.first_name": true, "id.ssn9": true, "custom.credit_card": true, "id.dob": false }
);
impl_response_type!(GetVaultResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct GetBusinessVaultResponse(HashMap<DataIdentifier, bool>);

impl_map_apiv2_schema!(
    GetBusinessVaultResponse<DataIdentifier, bool>,
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
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResponse<GetVaultResponse> {
    let result = get_inner(state, path, request, auth).await?;
    Ok(GetVaultResponse(result))
}

#[api_v2_operation(
    description = "Returns information on which fields are present in the business vault.",
    tags(Businesses, Vault, PublicApi)
)]
#[actix::get("/businesses/{fp_bid}/vault")]
pub async fn get_business(
    state: web::Data<State>,
    path: FpIdPath,
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResponse<GetBusinessVaultResponse> {
    let result = get_inner(state, path, request, auth).await?;
    Ok(GetBusinessVaultResponse(result))
}

async fn get_inner(
    state: web::Data<State>,
    path: FpIdPath,
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResponse<HashMap<DataIdentifier, bool>> {
    let fp_id = path.into_inner();
    let FieldsParams { fields } = request.into_inner();

    let auth = auth.check_guard(TenantGuard::Read)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await?;

    let populated = uvw.populated_dis();
    let keys = if let Some(fields) = fields {
        fields.to_vec()
    } else {
        populated.clone()
    };
    let results = HashMap::from_iter(keys.into_iter().map(|di| (di.clone(), populated.contains(&di))));
    Ok(results)
}
