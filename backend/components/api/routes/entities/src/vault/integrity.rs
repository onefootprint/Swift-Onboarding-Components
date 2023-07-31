use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::types::JsonApiResponse;
use crate::State;
use api_core::types::ResponseData;
use api_core::utils::headers::InsightHeaders;
use macros::route_alias;
use newtypes::{
    flat_api_object_map_type, FilterFunction, FpId, IntegritySigningKey, PiiBytes, PiiString,
    VersionedDataIdentifier,
};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct IntegrityRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    fields: HashSet<VersionedDataIdentifier>,
    /// A hex-encoded key for computing `hmac-sha256` signatures
    signing_key: IntegritySigningKey,
}

flat_api_object_map_type!(
    IntegrityResponse<VersionedDataIdentifier, Option<PiiString>>,
    description="A key-value map with the corresponding hex-encoded hash values",
    example=r#"{ "id.last_name": "f7ee801830...", "id.ssn9": "1cefe40fa...", "custom.credit_card": "f7dbdc6..." }"#
);

//TODO: replace handler with regular decrypt func
#[route_alias(actix::post(
    "/users/{fp_id}/vault/integrity",
    tags(Users, Vault, PublicApi),
    description = "Checks if provided data is valid before adding it to the vault."
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Checks if provided data is valid before adding it to the vault.",
    tags(Vault, Entities, Preview)
)]
#[actix::post("/entities/{fp_id}/vault/integrity")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<IntegrityRequest>,
    auth: SecretTenantAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<IntegrityResponse> {
    // TODO: should we add a separate guard for checking integrity?
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let IntegrityRequest { fields, signing_key } = request.into_inner();

    let req = super::decrypt::DecryptRequest {
        reason: "Compute Integrity HMAC-SHA256".to_string(),
        fields,
        filters: vec![FilterFunction::HmacSha256 {
            key: PiiBytes::new(signing_key.leak()),
        }],
    };

    let fp_id = path.into_inner();

    let Json(response) = super::decrypt::post_inner(&state, fp_id, req, auth, insights).await?;
    let response = IntegrityResponse::from(response.data.map);
    ResponseData::ok(response).json()
}
