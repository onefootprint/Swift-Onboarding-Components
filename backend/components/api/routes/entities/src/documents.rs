use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use db::models::identity_document::IdentityDocument;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DocumentKind;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View the documents uploaded for this vault.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/documents")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiResponse<Vec<api_wire_types::Document>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    // Some things might break if we start deactivating doc request
    // look at all uses of DocumentREquest::get - they should be filtering on active
    let (id_docs, api_docs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let documents = IdentityDocument::list(conn, &sv.id)?;
            let id_docs = documents
                .into_iter()
                .map(|d| -> ApiResult<_> {
                    let images = d.images(conn, false)?;
                    Ok((d, images))
                })
                .collect::<ApiResult<Vec<_>>>()?
                .into_iter()
                .filter(|(_, images)| !images.is_empty())
                .collect_vec();
            // Since some of our tenants are backfilling the ID doc images they already have,
            // we also have to support rendering documents that only exist in the vault
            // (and not in ID docs)
            let api_docs = vw
                .get_visible_populated_fields()
                .into_iter()
                .filter_map(|di| {
                    let DataIdentifier::Document(DocumentKind::LatestUpload(kind, side)) = di else {
                        return None;
                    };
                    let dl = vw.get_lifetime(di)?.clone();
                    Some((kind, (side, dl)))
                })
                // Only take document DIs that don't have a corresponding IdDocument.
                // This will be a little derpy if an API-uploaded document is replaced by a
                // bifrost-uploaded document
                .filter(|(kind, _)| !id_docs.iter().any(|d| &d.0.document_type == kind))
                .into_group_map();

            Ok((id_docs, api_docs))
        })
        .await??;

    let response = id_docs
        .into_iter()
        .map(api_wire_types::Document::from_db)
        .chain(api_docs.into_iter().map(api_wire_types::Document::from_db))
        .collect::<Vec<_>>();
    ResponseData::ok(response).json()
}
