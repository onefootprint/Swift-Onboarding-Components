use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::{
    CheckTenantGuard,
    PartnerTenantGuard,
    PartnerTenantSessionAuth,
};
use api_core::errors::{
    ApiResult,
    AssertionError,
    ValidationError,
};
use chrono::Utc;
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_request::{
    ComplianceDocRequest,
    NewComplianceDocRequest,
};
use db::models::compliance_doc_review::NewComplianceDocReview;
use db::models::compliance_doc_submission::ComplianceDocSubmission;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::{
    ComplianceDocId,
    ComplianceDocReviewDecision,
    TenantCompliancePartnershipId,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Submit a review for a compliance document submissions",
    tags(Compliance, Private)
)]
#[actix::post("/partner/partnerships/{partnership_id}/documents/{document_id}/reviews")]
pub async fn post(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
    request: web::Json<api_wire_types::CreateReviewRequest>,
) -> JsonApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageReviews)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (partnership_id, document_id) = args.into_inner().clone();

    let submission_id = request.submission_id.clone();
    let decision = request.decision;
    let note = request.note.clone();
    let tenant_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &pt_id)?;

            // Check that the document is associated with the given partnership ID and lock the
            // document.
            let doc = ComplianceDoc::lock(conn, &document_id, &partnership_id)?;

            let Some(sub) =
                ComplianceDocSubmission::get_active(conn, &doc)?.filter(|sub| sub.id == submission_id)
            else {
                return ValidationError("Can only review the latest submission").into();
            };

            NewComplianceDocReview {
                created_at: Utc::now(),
                submission_id: &sub.id,
                reviewed_by_partner_tenant_user_id: &tenant_user_id,
                decision,
                note: note.as_str(),
                compliance_doc_id: &doc.id,
            }
            .create(conn, &doc)?;

            // Create a reupload request upon rejection.
            let Some(req) = ComplianceDocRequest::get_active(conn, &doc)? else {
                return AssertionError("Found active submission but no active request").into();
            };

            if decision == ComplianceDocReviewDecision::Rejected {
                NewComplianceDocRequest {
                    created_at: Utc::now(),
                    name: req.name.as_str(),
                    description: req.description.as_str(),
                    requested_by_partner_tenant_user_id: Some(&tenant_user_id),
                    compliance_doc_id: &document_id,
                }
                .create(conn, &doc)?;
            }

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
