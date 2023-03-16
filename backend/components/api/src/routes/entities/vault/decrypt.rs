use crate::auth::tenant::{CanDecrypt, CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::{DecryptRequest as VwDecryptRequest, VaultWrapper};
use crate::{errors::ApiError, State};
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::{flat_api_object_map_type, PiiString};
use newtypes::{DataIdentifier, FootprintUserId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    fields: HashSet<DataIdentifier>,
    /// Reason for the data decryption. This will be logged
    reason: String,
}

flat_api_object_map_type!(
    DecryptResponse<DataIdentifier, Option<PiiString>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

#[api_v2_operation(
    tags(Vault, Entities, Private),
    description = "Decrypts the specified list of fields from the provided vault."
)]
#[actix::post("/entities/{fp_id}/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptResponse> {
    let result = post_inner(state, path, request, auth, insights).await?;
    Ok(result)
}

pub async fn post_inner(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptResponse> {
    let fp_id = path.into_inner();

    let request = request.into_inner();
    let DecryptRequest { fields, reason } = request;
    let fields = fields.into_iter().collect_vec();

    let auth = auth.check_guard(CanDecrypt::new(fields.clone()))?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    let req = VwDecryptRequest {
        reason,
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    let mut results = uvw.decrypt(&state, &fields, Some(req)).await?;
    // Is this step necessary? Every key is present in the response if it was in the request?
    let results = HashMap::from_iter(fields.into_iter().map(|di| (di.clone(), results.remove(&di))));
    let out = DecryptResponse { map: results };

    ResponseData::ok(out).json()
}
