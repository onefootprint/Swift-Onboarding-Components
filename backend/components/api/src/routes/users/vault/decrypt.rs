use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::routes::entities::vault::decrypt::{post_inner, DecryptRequest, DecryptResponse};
use crate::types::JsonApiResponse;
use crate::utils::headers::InsightHeaders;
use crate::State;
use newtypes::FootprintUserId;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[api_v2_operation(
    tags(Vault, PublicApi, Users),
    description = "Decrypts the specified list of fields from the provided user vault."
)]
#[actix::post("/users/{footprint_user_id}/vault/decrypt")]
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
