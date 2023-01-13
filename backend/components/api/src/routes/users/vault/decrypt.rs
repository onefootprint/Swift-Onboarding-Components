use crate::auth::tenant::{CanDecrypt, CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{tenant::TenantUserAuthContext, Either};
use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::{DecryptRequest, UserVaultWrapper, UvwArgs};
use crate::{errors::ApiError, State};
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use itertools::Itertools;
use newtypes::{flat_api_object_map_type, PiiString};
use newtypes::{DataIdentifier, FootprintUserId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptUnifiedFieldsRequest {
    /// list of data identifiers to decrypt
    fields: HashSet<DataIdentifier>,
    /// reason for the data decryption
    reason: String,
}

flat_api_object_map_type!(
    DecryptUnifiedResponse<DataIdentifier, Option<PiiString>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

#[api_v2_operation(tags(Vault, PublicApi, Users), description = "Decrypts items from the vault")]
#[actix::post("/users/{footprint_user_id}/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptUnifiedFieldsRequest>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptUnifiedResponse> {
    // TODO if we get only id data here, don't require the `id.` prefix
    let footprint_user_id = path.into_inner();

    let request = request.into_inner();
    let DecryptUnifiedFieldsRequest { fields, reason } = request;
    let fields = fields.clone().into_iter().collect_vec();

    let auth = auth.check_guard(CanDecrypt::new(fields.clone()))?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let fields_clone = fields.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;
            // TODO bake this access checking into decrypt, when decrypting for a tenant.
            // Shouldn't be allowed to decrypt without doing this
            uvw.ensure_scope_allows_access(conn, &scoped_user, fields_clone)?;
            Ok(uvw)
        })
        .await??;

    let req = DecryptRequest {
        reason,
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    let mut results = uvw.decrypt(&state, &fields, Some(req)).await?;
    // Is this step necessary? Every key is present in the response if it was in the request?
    let results = HashMap::from_iter(fields.into_iter().map(|di| (di.clone(), results.remove(&di))));
    let out = DecryptUnifiedResponse { map: results };

    ResponseData::ok(out).json()
}
