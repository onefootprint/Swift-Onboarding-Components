use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::ApiResult,
    types::{EmptyResponse, ResponseData},
};
use chrono::Utc;
use db::models::{
    compliance_doc::ComplianceDoc, compliance_doc_request::NewComplianceDocRequest,
    tenant_compliance_partnership::TenantCompliancePartnership,
};
use newtypes::{ComplianceDocId, TenantCompliancePartnershipId};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(description = "Request reupload of a document.", tags(Compliance, Private))]
#[actix::post("/partner/partnerships/{partnership_id}/documents/{document_id}/reupload")]
pub async fn post(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
    request: web::Json<api_wire_types::ReuploadComplianceDocRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageReviews)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (partnership_id, document_id) = args.into_inner().clone();

    let name = request.name.clone();
    let description = request.description.clone();
    let requested_by_partner_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized partner tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &pt_id)?;

            // Check that the document is associated with the given partnership ID and lock the
            // document.
            let doc = ComplianceDoc::lock(conn, &document_id, &partnership_id)?;

            // Create a request for the new doc.
            NewComplianceDocRequest {
                created_at: Utc::now(),
                name: name.as_str(),
                description: description.as_str(),
                requested_by_partner_tenant_user_id: &requested_by_partner_tenant_user_id,
                compliance_doc_id: &document_id,
            }
            .create(conn, &doc)?;

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
