use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::TryDbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
use db::models::samba_report::SambaReport;
use db::models::scoped_vault::ScopedVault;
use itertools::chain;
use itertools::Itertools;
use newtypes::samba::SambaOrderKind;
use newtypes::CustomDocumentConfig;
use newtypes::DataIdentifier;
use newtypes::DocumentDiKind;
use newtypes::DocumentKind;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentSide;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

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
) -> ApiListResponse<api_wire_types::Document> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();

    let api_wire_types::GetHistoricalDataRequest { seqno } = filters.into_inner();

    let (id_docs, api_docs) = state
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let documents = Document::list(conn, &sv.id)?;
            let id_docs = documents
                .into_iter()
                .map(|(doc, dr)| -> FpResult<_> {
                    let args = DocumentImageArgs {
                        only_active: false,
                        at_seqno: seqno,
                    };
                    let images = doc.images(conn, args)?;
                    Ok((doc, dr, images))
                })
                .filter_ok(|(_, _, images)| !images.is_empty())
                .collect::<FpResult<Vec<_>>>()?;
            let id_doc_ids = id_docs.iter().map(|(doc, _, _)| doc.id.clone()).collect_vec();
            // Include Samba responses
            let samba_reports = SambaReport::bulk_get_latest_by_order_kind(conn, &id_doc_ids)?;
            let id_docs = id_docs
                .into_iter()
                .map(|(doc, dr, uploads)| {
                    let activity_history_seqno = samba_reports
                        .get(&(doc.id.clone(), SambaOrderKind::ActivityHistory))
                        .and_then(|r| r.completed_seqno);
                    (doc, dr, uploads, activity_history_seqno)
                })
                .collect_vec();

            let custom_dis = id_docs
                .iter()
                .filter_map(|(_, dr, _, _)| match dr.config {
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
            let vw: TenantVw<Any> = VaultWrapper::build_for_tenant_maybe_version(conn, &sv.id, seqno)?;
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
                        DataIdentifier::Document(DocumentDiKind::ProofOfAddress) => {
                            let already_contains = id_docs
                                .iter()
                                .any(|d| d.0.document_type == DocumentKind::ProofOfAddress);
                            (!already_contains)
                                .then_some((DocumentKind::ProofOfAddress, (DocumentSide::Front, dl)))
                        }
                        DataIdentifier::Document(DocumentDiKind::SsnCard) => {
                            let already_contains =
                                id_docs.iter().any(|d| d.0.document_type == DocumentKind::SsnCard);
                            (!already_contains).then_some((DocumentKind::SsnCard, (DocumentSide::Front, dl)))
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
            .collect::<FpResult<Vec<_>>>()?,
        api_docs.into_iter().map(api_wire_types::Document::from_db),
    )
    .sorted_by_key(|d| d.started_at)
    .rev()
    .collect();
    Ok(response)
}
