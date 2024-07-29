use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::types::ApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::FpResult;
use db::models::document::Document;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "View the documents uploaded successfully by this user.",
    tags(Users, PhasedOut, HideWhenLocked)
)]
#[get("/users/{fp_id}/documents")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: TenantApiKeyGated<preview_api::DocumentsList>,
) -> ApiListResponse<api_wire_types::PublicDocument> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    // get all completed id docs, sort by created_at asc
    let id_docs = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let id_docs: Vec<Document> = Document::list(conn, &sv.id)?
                .into_iter()
                .map(|(i, _)| i)
                .filter(|i| i.completed_seqno.is_some())
                .sorted_by(|x, y| Ord::cmp(&x.created_at, &y.created_at))
                .collect();
            Ok(id_docs)
        })
        .await?;

    let response = id_docs
        .into_iter()
        .map(api_wire_types::PublicDocument::from_db)
        .collect();
    Ok(response)
}
