use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::State;
use chrono::Utc;
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_assignment::NewComplianceDocAssignment;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use db::models::tenant_rolebinding::TenantRolebinding;
use newtypes::ComplianceDocId;
use newtypes::TenantCompliancePartnershipId;
use newtypes::TenantKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Assigns a compliance document to a tenant user",
    tags(Compliance, Private)
)]
#[actix::post("/org/partners/{partnership_id}/documents/{document_id}/assignments")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
    request: web::Json<api_wire_types::UpdateComplianceDocAssignmentRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::ManageComplianceDocSubmission)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let (partnership_id, doc_id) = args.into_inner();
    let assigned_to_tenant_user_id = request.user_id.clone();
    let assigned_by_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    state
        .db_transaction(move |conn| {
            // Check that the authorized tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &tenant_id)?;

            let doc = ComplianceDoc::lock(conn, &doc_id, &partnership_id)?;

            if let Some(assigned_to_tenant_user_id) = assigned_to_tenant_user_id.as_ref() {
                // Ensure the given user ID is part of the authorized tenant.
                TenantRolebinding::get(conn, (assigned_to_tenant_user_id, &tenant_id))?;
            }

            NewComplianceDocAssignment {
                created_at: Utc::now(),
                compliance_doc_id: &doc.id,
                kind: TenantKind::Tenant,
                assigned_to_tenant_user_id: assigned_to_tenant_user_id.as_ref(),
                assigned_by_tenant_user_id: &assigned_by_tenant_user_id,
            }
            .create(conn, &doc)?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
