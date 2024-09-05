use crate::auth::tenant::TenantApiKey;
use crate::State;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::vault::patch_vault;
use api_core::web::Json;
use api_wire_types::UpdateEntityRequest;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use paperclip::actix::web;

#[api_v2_operation(tags(Businesses, Vault, PublicApi))]
#[patch("/businesses/{fp_bid:fp_[_A-Za-z0-9]*}")]
pub async fn patch(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: Json<UpdateEntityRequest>,
    auth: TenantApiKey,
) -> ApiResponse<api_wire_types::LiteUser> {
    let result = patch_vault(state, fp_id, request.into_inner(), auth).await?;
    Ok(result)
}
