use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::routes::entities::vault::get::{get_inner, FieldsParams, GetVaultResponse};
use crate::types::JsonApiResponse;
use crate::State;
use actix_web::web::Query;
use newtypes::FootprintUserId;
use paperclip::actix::{self, api_v2_operation, web, web::Path};

#[api_v2_operation(
    description = "Given a list of fields, checks for their existence in the vault without decrypting them.",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<GetVaultResponse> {
    let result = get_inner(state, path, request, auth).await?;
    Ok(result)
}
