use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::{ApiResult, ValidationError},
    types::{EmptyResponse, ResponseData},
};
use chrono::Utc;
use db::models::{
    compliance_doc::ComplianceDoc, compliance_doc_request::ComplianceDocRequest,
    compliance_doc_submission::NewComplianceDocSubmission,
    tenant_compliance_partnership::TenantCompliancePartnership,
};
use newtypes::{ComplianceDocData, ComplianceDocId, TenantCompliancePartnershipId};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Submit an external URL in response to a request",
    tags(Compliance, Private)
)]
#[actix::post("/org/partners/{partnership_id}/documents/{document_id}/submissions")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
    request: web::Json<api_wire_types::SubmitExternalUrlRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::ManageComplianceDocSubmission)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let (partnership_id, document_id) = args.into_inner().clone();

    let request_id = request.request_id.clone();
    let url = request.url.clone();
    let submitted_by_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &tenant_id)?;

            // Check that the document is associated with the given partnership ID and lock the
            // document.
            let doc = ComplianceDoc::lock(conn, &document_id, &partnership_id)?;

            let Some(req) = ComplianceDocRequest::get_active(conn, &doc)?.filter(|req| req.id == request_id)
            else {
                return ValidationError("Can only submit documents for the latest request").into();
            };

            let doc_data = ComplianceDocData::ExternalUrl(url);
            NewComplianceDocSubmission {
                created_at: Utc::now(),
                request_id: &req.id,
                submitted_by_tenant_user_id: &submitted_by_tenant_user_id,
                doc_data: &doc_data,
                compliance_doc_id: &doc.id,
            }
            .create(conn, &doc)?;

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
