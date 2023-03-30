pub mod document;

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::utils::headers::InsightHeaders;
use crate::State;
use actix_web::web::Query;
use api_route_entities::vault::decrypt::{post_inner, DecryptRequest, DecryptResponse};
use api_route_entities::vault::get::{get_inner, FieldsParams, GetVaultResponse};
use api_route_entities::vault::put::{post_validate_inner, put_inner};
use newtypes::put_data_request::RawDataRequest;
use newtypes::FpId;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

// Define shim methods around the entities decrypt APIs. We will keep the user decrypt APIs around
// for backwards compatibility

#[api_v2_operation(
    tags(Vault, PublicApi, Users),
    description = "Decrypts the specified list of fields from the provided user vault."
)]
#[actix::post("/users/{footprint_user_id}/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<DecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptResponse> {
    let result = post_inner(state, path, request, auth, insights).await?;
    Ok(result)
}

#[api_v2_operation(
    description = "Given a list of fields, checks for their existence in the vault without decrypting them.",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<GetVaultResponse> {
    let result = get_inner(state, path, request, auth).await?;
    Ok(result)
}

#[api_v2_operation(
    description = "Checks if provided data is valid before adding it to the vault",
    tags(Vault, PublicApi, Users)
)]
#[actix::post("/users/{footprint_user_id}/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let result = post_validate_inner(state, path, request, tenant_auth).await?;
    Ok(result)
}

#[api_v2_operation(
    description = "Updates data in a user vault. Can be used to update `id.` data or `custom.` data, but `id.` data can only be specified for user vaults created via API.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let result = put_inner(state, path, request, tenant_auth, insight).await?;
    Ok(result)
}

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post_validate)
        .service(put)
        .service(get)
        .service(post)
        .service(document::get)
        .service(document::post_decrypt);
}
