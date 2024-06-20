use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::ApiResult;
use api_core::errors::ValidationError;
use api_core::types::ModernApiResult;
use api_core::State;
use chrono::Utc;
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_request::ComplianceDocRequest;
use db::models::compliance_doc_submission::NewComplianceDocSubmission;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::ComplianceDocData;
use newtypes::ComplianceDocRequestId;
use newtypes::TenantCompliancePartnershipId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Submit an external URL in response to a request",
    tags(Compliance, Private)
)]
#[actix::post("/org/partners/{partnership_id}/requests/{request_id}/submissions")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocRequestId)>,
    request: web::Json<api_wire_types::SubmitExternalUrlRequest>,
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::ManageComplianceDocSubmission)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let (partnership_id, request_id) = args.into_inner().clone();

    let url = request.url.clone();
    let submitted_by_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &tenant_id)?;

            // Check that the request is associated with the given partnership ID and lock the
            // document.
            let doc = ComplianceDoc::lock(conn, &request_id, &partnership_id)?;

            let Some(req) = ComplianceDocRequest::get_active(conn, &doc)?.filter(|req| req.id == request_id)
            else {
                return ValidationError("Can only submit documents for the latest request").into();
            };

            let doc_data = ComplianceDocData::ExternalUrl { url };
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

    Ok(api_wire_types::Empty)
}
