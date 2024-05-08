use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{
    errors::ApiResult,
    types::JsonApiResponse,
    utils::{
        db2api::TryDbToApi,
        fp_id_path::FpIdPath,
        vault_wrapper::{Any, TenantVw, VaultWrapper},
    },
};
use db::models::{
    document::{Document, DocumentImageArgs},
    scoped_vault::ScopedVault,
};
use itertools::{chain, Itertools};
use newtypes::{
    CustomDocumentConfig, DataIdentifier, DocumentDiKind, DocumentKind, DocumentRequestConfig, DocumentSide,
};
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
    filters: web::Query<api_wire_types::GetHistoricalDataRequest>,
) -> JsonApiResponse<Vec<api_wire_types::Document>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let api_wire_types::GetHistoricalDataRequest { seqno } = filters.into_inner();

    let (id_docs, api_docs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let documents = Document::list(conn, &sv.id)?;
            let id_docs = documents
                .into_iter()
                .map(|(doc, dr)| -> ApiResult<_> {
                    let args = DocumentImageArgs {
                        only_active: false,
                        at_seqno: seqno,
                    };
                    let images = doc.images(conn, args)?;
                    Ok((doc, dr, images))
                })
                .filter_ok(|(_, _, images)| !images.is_empty())
                .collect::<ApiResult<Vec<_>>>()?;

            let custom_dis = id_docs
                .iter()
                .filter_map(|(_, dr, _)| match dr.config {
                    DocumentRequestConfig::Custom(CustomDocumentConfig { ref identifier, .. }) => {
                        Some(identifier)
                    }
                    _ => None,
                })
                .collect_vec();

            // Documents can also be uploaded via tenant-facing API or via the dashboard.
            // So we have to add these in here...
            // TODO we won't show historical versions of documents uploaded here, even though we
            // show multiple ID document sessions.
            // We'd need to support fetching even deactivated DLs from the database
            let vw: TenantVw<Any> = VaultWrapper::build_for_tenant_version(conn, &sv.id, seqno)?;
            let api_docs = vw
                .populated_dis()
                .into_iter()
                .filter_map(|di| {
                    let dl = vw.get_lifetime(&di)?.clone();
                    // Only take document DIs that don't have a corresponding IdDoc in the DB.
                    // This will be a little derpy if an API-uploaded document is replaced by a
                    // bifrost-uploaded document...
                    match di {
                        DataIdentifier::Document(DocumentDiKind::LatestUpload(kind, side)) => {
                            let already_contains = id_docs.iter().any(|d| d.0.document_type == kind.into());
                            (!already_contains).then_some((kind.into(), (side, dl)))
                        }
                        DataIdentifier::Document(DocumentDiKind::Custom(_)) => {
                            let already_contains = custom_dis.iter().any(|i| **i == di);
                            (!already_contains).then_some((DocumentKind::Custom, (DocumentSide::Front, dl)))
                        }
                        _ => None,
                    }
                })
                .into_group_map();

            Ok((id_docs, api_docs))
        })
        .await?;

    let response = chain(
        id_docs
            .into_iter()
            .map(api_wire_types::Document::try_from_db)
            .collect::<ApiResult<Vec<_>>>()?,
        api_docs.into_iter().map(api_wire_types::Document::from_db),
    )
    .collect::<Vec<_>>();
    ResponseData::ok(response).json()
}
