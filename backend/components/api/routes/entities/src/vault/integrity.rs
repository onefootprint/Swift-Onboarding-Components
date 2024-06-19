use crate::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use crate::types::ModernApiResult;
use crate::State;
use api_core::telemetry::RootSpan;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use macros::route_alias;
use newtypes::{
    flat_api_object_map_type,
    impl_response_type,
    FilterFunction,
    HmacSha256Args,
    IntegritySigningKey,
    PiiBytes,
    PiiJsonValue,
    PreviewApi,
    VersionedDataIdentifier,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
    Apiv2Schema,
};
use serde::{
    Deserialize,
    Serialize,
};
use std::collections::HashSet;

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct IntegrityRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`,
    /// `custom.bank_account`
    fields: HashSet<VersionedDataIdentifier>,
    /// A hex-encoded key for computing `hmac-sha256` signatures
    signing_key: IntegritySigningKey,
}

flat_api_object_map_type!(
    IntegrityResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    description="A key-value map with the corresponding hex-encoded hash values",
    example=r#"{ "id.last_name": "f7ee801830...", "id.ssn9": "1cefe40fa...", "custom.credit_card": "f7dbdc6..." }"#
);
impl_response_type!(IntegrityResponse);

//TODO: replace handler with regular decrypt func
#[route_alias(actix::post(
    "/users/{fp_id}/vault/integrity",
    tags(Users, Vault, Preview),
    description = "Checks if provided data is valid before adding it to the vault."
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Checks if provided data is valid before adding it to the vault.",
    tags(Vault, Entities, Private)
)]
#[actix::post("/entities/{fp_id}/vault/integrity")]
pub async fn post(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<IntegrityRequest>,
    auth: SecretTenantAuthContext,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> ModernApiResult<IntegrityResponse> {
    auth.check_preview_guard(PreviewApi::VaultIntegrity)?;
    // TODO: should we add a separate guard for checking integrity?
    // This is incorrect - won't change though since we are deprecating this soon
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let IntegrityRequest { fields, signing_key } = request.into_inner();

    let transform = FilterFunction::HmacSha256(HmacSha256Args {
        key: PiiBytes::new(signing_key.leak()),
    });
    let req = super::decrypt::DecryptRequest {
        reason: "Compute Integrity HMAC-SHA256".to_string(),
        fields,
        transforms: Some(vec![transform]),
    };

    let fp_id = path.into_inner();

    let response = super::decrypt::post_inner(&state, fp_id, req, auth, insights, root_span).await?;
    let response = IntegrityResponse::from(response.map);
    Ok(response)
}
