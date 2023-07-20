use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use db::models::identity_document::IdentityDocument;
use db::models::scoped_vault::ScopedVault;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "Allows a tenant to view a customer's registered webauthn credentials.",
    tags(Entities, Preview)
)]
#[get("/entities/{fp_id}/documents")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<Vec<api_wire_types::Document>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    // Some things might break if we start deactivating doc request
    // look at all uses of DocumentREquest::get - they should be filtering on active
    let results = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let documents = IdentityDocument::list(conn, &sv.id)?;
            let documents = documents
                .into_iter()
                .map(|d| -> ApiResult<_> {
                    let images = d.images(conn, false)?;
                    Ok((d, images))
                })
                .collect::<ApiResult<Vec<_>>>()?;
            Ok(documents)
        })
        .await??;

    let response = results
        .into_iter()
        .map(api_wire_types::Document::from_db)
        .collect::<Vec<_>>();
    ResponseData::ok(response).json()
}
