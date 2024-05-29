use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::{
    CheckTenantGuard,
    PartnerTenantGuard,
    PartnerTenantSessionAuth,
};
use api_core::errors::ApiResult;
use api_core::types::{
    EmptyResponse,
    ResponseData,
};
use chrono::Utc;
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_assignment::NewComplianceDocAssignment;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use db::models::tenant_rolebinding::TenantRolebinding;
use newtypes::{
    ComplianceDocId,
    TenantCompliancePartnershipId,
    TenantKind,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Assigns a compliance document to a partner tenant user",
    tags(Compliance, Private)
)]
#[actix::post("/partner/partnerships/{partnership_id}/documents/{document_id}/assignments")]
pub async fn post(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
    request: web::Json<api_wire_types::UpdateComplianceDocAssignmentRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageReviews)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (partnership_id, doc_id) = args.into_inner();
    let assigned_to_tenant_user_id = request.user_id.clone();
    let assigned_by_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &pt_id)?;

            let doc = ComplianceDoc::lock(conn, &doc_id, &partnership_id)?;

            if let Some(assigned_to_tenant_user_id) = assigned_to_tenant_user_id.as_ref() {
                // Ensure the given user ID is part of the authorized tenant.
                TenantRolebinding::get(conn, (assigned_to_tenant_user_id, &pt_id))?;
            }

            NewComplianceDocAssignment {
                created_at: Utc::now(),
                compliance_doc_id: &doc.id,
                kind: TenantKind::PartnerTenant,
                assigned_to_tenant_user_id: assigned_to_tenant_user_id.as_ref(),
                assigned_by_tenant_user_id: &assigned_by_tenant_user_id,
            }
            .create(conn, &doc)?;

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
