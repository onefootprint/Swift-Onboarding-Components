use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::ApiResult,
    types::{EmptyResponse, ResponseData},
    ApiError, ApiErrorKind,
};
use db::models::{
    compliance_doc::ComplianceDoc, compliance_doc_request::ComplianceDocRequest,
    compliance_doc_submission::ComplianceDocSubmission,
    tenant_compliance_partnership::TenantCompliancePartnership,
};
use newtypes::{ComplianceDocRequestId, TenantCompliancePartnershipId};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(description = "Retracts a document request.", tags(Compliance, Private))]
#[actix::delete("/compliance/partners/{partnership_id}/requests/{request_id}")]
pub async fn delete(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocRequestId)>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageReviews)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (partnership_id, request_id) = args.into_inner();
    let deactivated_by_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized partner tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &pt_id)?;

            // Check that the document is associated with the given partnership ID and lock the
            // document.
            let doc = ComplianceDoc::lock(conn, &request_id, &partnership_id)?;

            // Ensure the given request is the latest active request.
            let Some(req) = ComplianceDocRequest::get_active(conn, &doc)? else {
                return Err(ApiError::from(ApiErrorKind::ValidationError(
                    "Cannot retract this compliance document request since there are no active requests for this document".to_owned(),
                )));
            };

            if req.id != request_id {
                return Err(ApiError::from(ApiErrorKind::ValidationError(
                    "Cannot retract this compliance document request since there is a newer request for this document".to_owned(),
                )));
            }

            // Ensure there are no submissions for this request.
            let sub_count = ComplianceDocSubmission::count_for_request(conn, &req, &doc)?;
            if sub_count > 0 {
                return Err(ApiError::from(ApiErrorKind::ValidationError(
                    "Cannot retract a compliance document request with submissions".to_owned(),
                )));
            }

            ComplianceDocRequest::deactivate(conn, &req.id, Some(&deactivated_by_user_id), &doc)?;
            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
