use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::types::JsonApiResponse;
use crate::utils::vault_wrapper::{DecryptRequest as VwDecryptRequest, VaultWrapper};
use crate::State;
use api_core::types::ResponseData;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::ApiError;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::{flat_api_object_map_type, DataIdentifier, FpId, IntegritySigningKey, PiiString};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct IntegrityRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    fields: HashSet<DataIdentifier>,
    /// A hex-encoded key for computing `hmac-sha256` signatures
    signing_key: IntegritySigningKey,
}

flat_api_object_map_type!(
    IntegrityResponse<DataIdentifier, Option<PiiString>>,
    description="A key-value map with the corresponding hex-encoded hash values",
    example=r#"{ "id.last_name": "f7ee801830...", "id.ssn9": "1cefe40fa...", "custom.credit_card": "f7dbdc6..." }"#
);

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
    let fields = fields.into_iter().collect_vec();

    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let fp_id = path.into_inner();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    let req = VwDecryptRequest {
        reason: "Compute Integrity HMAC-SHA256".to_string(),
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    let results = uvw
        .compute_integrity_signed_hashes(&state, &fields, signing_key, req)
        .await?;

    let out = IntegrityResponse {
        map: results
            .into_iter()
            .map(|(op, result)| (op.identifier, Some(result)))
            .collect(),
    };

    ResponseData::ok(out).json()
}
