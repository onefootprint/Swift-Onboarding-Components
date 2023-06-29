use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::{DecryptRequest as VwDecryptRequest, VaultWrapper};
use crate::{errors::ApiError, State};
use api_core::auth::tenant::{ClientTenantAuthContext, TenantAuth};
use api_core::auth::CanDecrypt;
use api_core::utils::vault_wrapper::TenantVw;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::{flat_api_object_map_type, PiiString};
use newtypes::{DataIdentifier, FpId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json, web::Path};
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

#[tracing::instrument(skip(state, auth))]
#[route_alias(
    post(
        "/users/{fp_id}/vault/decrypt",
        tags(Users, Vault, PublicApi),
        description = "Decrypts the specified list of fields from the provided vault."
    ),
    post(
        "/businesses/{fp_bid}/vault/decrypt",
        tags(Businesses, Vault, PublicApi),
        description = "Decrypts the specified list of fields from the provided vault."
    )
)]
#[api_v2_operation(
    tags(Vault, Entities, Preview),
    description = "Works for either person or business entities. Decrypts the specified list of fields from the provided vault."
)]
#[post("/entities/{fp_id}/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<DecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptResponse> {
    let request = request.into_inner();
    let auth = auth.check_guard(CanDecrypt::new(request.fields.iter().cloned().collect()))?;

    let result = post_inner(&state, path.into_inner(), request, auth, insights).await?;
    Ok(result)
}

#[tracing::instrument(skip(state, auth))]
#[route_alias(post(
    "/users/vault/decrypt",
    tags(Client, Vault, Users, PublicApi),
    description = "Decrypts the specified list of fields given a short-lived, entity-scoped client token"
))]
#[api_v2_operation(
    tags(Client, Vault, Entities, Private),
    description = "Works for either person or business entities. Decrypts the specified list of fields given a short-lived, entity-scoped client token"
)]
#[post("/entities/vault/decrypt")]
pub async fn post_client(
    state: web::Data<State>,
    request: Json<DecryptRequest>,
    auth: ClientTenantAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptResponse> {
    let request = request.into_inner();
    let auth = auth.check_guard(CanDecrypt::new(request.fields.iter().cloned().collect()))?;
    let fp_id = auth.fp_id.clone();

    // TODO would be really cool if we could share the handler - the only difference is one gets
    // the fp_id from the path while the other gets it from the token. could we make an extractor
    // for this?
    let result = post_inner(&state, fp_id, request, Box::new(auth), insights).await?;
    Ok(result)
}

async fn post_inner(
    state: &State,
    fp_id: FpId,
    request: DecryptRequest,
    auth: Box<dyn TenantAuth>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptResponse> {
    let DecryptRequest { fields, reason } = request;
    let fields = fields.into_iter().collect_vec();

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

    let req = VwDecryptRequest {
        reason,
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    let mut results = uvw.decrypt(state, &fields, req).await?;
    // Is this step necessary? Every key is present in the response if it was in the request?
    let results = HashMap::from_iter(fields.into_iter().map(|di| (di.clone(), results.remove(&di.into()))));
    let out = DecryptResponse { map: results };

    ResponseData::ok(out).json()
}
