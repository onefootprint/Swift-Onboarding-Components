use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth},
        Either,
    },
    errors::ApiError,
    types::{JsonApiResponse, ResponseData},
    utils::vault_wrapper::VaultWrapper,
    State,
};
use actix_web::web::Query;
use api_core::utils::{fp_id_path::FpIdPath, vault_wrapper::TenantVw};
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::{flat_api_object_map_type, input::Csv, DataIdentifier};
use paperclip::actix::{self, api_v2_operation, web, Apiv2Schema};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check. For example, `id.first_name,id.ssn4,custom.bank_account`
    #[openapi(example = "id.last_name, custom.ach_account, id.dob, id.ssn9")]
    fields: Option<Csv<DataIdentifier>>,
}

flat_api_object_map_type!(
    GetVaultResponse<DataIdentifier, bool>,
    description="A key-value map of identifier to whether the identifier exists in the vault",
    example=r#"{ "id.last_name": true, "id.ssn9": true, "custom.credit_card": true, "id.dob": false }"#
);

#[route_alias(
    actix::get(
        "/users/{fp_id}/vault",
        description = "Given a list of fields, checks for their existence in the user vault without decrypting them.",
        tags(Users, Vault, PublicApi)
    ),
    actix::get(
        "/businesses/{fp_bid}/vault",
        description = "Given a list of fields, checks for their existence in the business vault without decrypting them.",
        tags(Businesses, Vault, PublicApi)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Given a list of fields, checks for their existence in the vault without decrypting them.",
    tags(Vault, Entities, Private)
)]
#[actix::get("/entities/{fp_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: FpIdPath,
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<GetVaultResponse> {
    let fp_id = path.into_inner();
    let FieldsParams { fields } = request.into_inner();

    let auth = auth.check_guard(TenantGuard::Read)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    let populated = uvw.populated_dis();
    let keys = if let Some(fields) = fields {
        fields.to_vec()
    } else {
        populated.clone()
    };
    let results = HashMap::from_iter(keys.into_iter().map(|di| (di.clone(), populated.contains(&di))));
    let out = GetVaultResponse { map: results };

    ResponseData::ok(out).json()
}
