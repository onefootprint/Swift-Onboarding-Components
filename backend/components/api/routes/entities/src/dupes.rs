use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth},
        Either,
    },
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{
    errors::ApiResult,
    utils::{dupes, fp_id_path::FpIdPath},
};
use db::models::scoped_vault::ScopedVault;
use newtypes::Dupes;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Lists information about other vaults with duplicate information for a footprint vault.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/dupes")]
pub async fn get_dupes(
    state: web::Data<State>,
    request: FpIdPath,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<Dupes> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let dupes = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            dupes::get_dupes(conn, &sv.id)
        })
        .await?;

    ResponseData::ok(dupes).json()
}
