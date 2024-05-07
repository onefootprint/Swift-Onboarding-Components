use crate::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{errors::ApiResult, types::JsonApiResponse, utils::fp_id_path::FpIdPath};
use db::models::{document::Document, scoped_vault::ScopedVault};
use itertools::Itertools;
use newtypes::PreviewApi;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View the successfully uploaded documents uploaded for this user.",
    tags(Users, Preview)
)]
#[get("/users/{fp_id}/documents")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<Vec<api_wire_types::PublicDocument>> {
    auth.check_preview_guard(PreviewApi::AuthEventsList)?;
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    // get all completed id docs, sort by created_at asc
    let id_docs = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
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
        .collect::<Vec<_>>();
    ResponseData::ok(response).json()
}
