use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::{
    CheckTenantGuard,
    PartnerTenantGuard,
    PartnerTenantSessionAuth,
};
use api_core::errors::{
    ApiResult,
    ValidationError,
};
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_request::ComplianceDocRequest;
use db::models::compliance_doc_submission::ComplianceDocSubmission;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::{
    ComplianceDocRequestId,
    TenantCompliancePartnershipId,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(description = "Retracts a document request.", tags(Compliance, Private))]
#[actix::delete("/partner/partnerships/{partnership_id}/requests/{request_id}")]
pub async fn delete(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocRequestId)>,
) -> JsonApiResponse<api_wire_types::Empty> {
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

            let Some(req) = ComplianceDocRequest::get_active(conn, &doc)?.filter(|req| req.id == request_id)
            else {
                return ValidationError("Can only retract the latest active request").into();
            };

            // Ensure there are no submissions for this request.
            if ComplianceDocSubmission::get_active(conn, &doc)?.is_some() {
                return ValidationError("Cannot retract a compliance document request with submissions")
                    .into();
            }

            ComplianceDocRequest::deactivate(conn, &req.id, &doc, Some(&deactivated_by_user_id))?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
