use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::{ApiResult, ValidationError},
    types::{EmptyResponse, ResponseData},
};
use chrono::Utc;
use db::models::{
    compliance_doc::ComplianceDoc,
    compliance_doc_request::{ComplianceDocRequest, NewComplianceDocRequest},
    compliance_doc_review::NewComplianceDocReview,
    compliance_doc_submission::ComplianceDocSubmission,
    tenant_compliance_partnership::TenantCompliancePartnership,
};
use newtypes::{ComplianceDocId, ComplianceDocReviewDecision, TenantCompliancePartnershipId};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Submit an external URL in response to a request",
    tags(Compliance, Private)
)]
#[actix::post("/compliance/partners/{partnership_id}/documents/{document_id}/reviews")]
pub async fn post(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
    request: web::Json<api_wire_types::CreateReviewRequest>,
) -> JsonApiResponse<EmptyResponse> {
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

            // Only allow reviews on an active submission for an active request.
            let Some(active_req) = ComplianceDocRequest::get_active(conn, &doc)? else {
                return ValidationError(
                    "Cannot submit a review since there is no active request for this compliance document",
                )
                .into();
            };

            let Some(active_sub) = ComplianceDocSubmission::get_active(conn, &active_req.id, &doc)? else {
                return ValidationError(
                    "Cannot submit a review since there is no submission for this compliance document",
                )
                .into();
            };

            if active_sub.id != submission_id {
                return ValidationError(
                    "Cannot review this submission since there is a newer submission for this compliance document",
                ).into();
            }

            NewComplianceDocReview {
                created_at: Utc::now(),
                submission_id: &active_sub.id,
                reviewed_by_partner_tenant_user_id: &tenant_user_id,
                decision,
                note: note.as_str(),
            }.create(conn, &doc)?;

            // Create a reupload request upon rejection.
            if decision == ComplianceDocReviewDecision::Rejected{
                NewComplianceDocRequest {
                    created_at: Utc::now(),
                    name: active_req.name.as_str(),
                    description: active_req.description.as_str(),
                    requested_by_partner_tenant_user_id: &tenant_user_id,
                    compliance_doc_id: &document_id,
                }
                .create(conn, &doc)?;
            }

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
