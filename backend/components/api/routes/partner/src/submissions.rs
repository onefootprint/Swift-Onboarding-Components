use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::{
    CheckTenantGuard,
    PartnerTenantGuard,
    PartnerTenantSessionAuth,
};
use api_core::errors::ApiResult;
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_submission::ComplianceDocSubmission;
use db::models::tenant::Tenant;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::{
    ComplianceDocData,
    ComplianceDocSubmissionId,
    TenantCompliancePartnershipId,
};
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Fetches the submission with the given ID",
    tags(Compliance, Private)
)]
#[actix::get("/partner/partnerships/{partnership_id}/submissions/{submission_id}")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocSubmissionId)>,
) -> JsonApiResponse<api_wire_types::ComplianceDocSubmission> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (partnership_id, submission_id) = args.into_inner();

    let (sub, tenant_e_private_key) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Check that the authorized partner tenant owns the partnership.
            let partnership = TenantCompliancePartnership::get(conn, &partnership_id, &pt_id)?;

            // Check that the document is associated with the given partnership ID.
            let doc = ComplianceDoc::get(conn, &submission_id, &partnership_id)?;

            let sub = ComplianceDocSubmission::get(conn, &submission_id, &doc.id)?;

            // Fetch the tenant's private key for decryption.
            let tenant = Tenant::get(conn, &partnership.tenant_id)?;

            Ok((sub, tenant.e_private_key))
        })
        .await?;

    let ComplianceDocSubmission {
        id,
        doc_data,
        created_at,
        ..
    } = sub;

    let data = match doc_data {
        ComplianceDocData::ExternalUrl { url } => api_wire_types::ComplianceDocData::ExternalUrl { url },
        ComplianceDocData::SealedUpload {
            filename,
            s3_url,
            e_data_key,
        } => {
            let data = state
                .enclave_client
                .decrypt_document(&tenant_e_private_key, &e_data_key, &s3_url)
                .await?;

            api_wire_types::ComplianceDocData::FileUpload {
                filename,
                data: data.into_base64_pii(),
            }
        }
    };

    let resp = api_wire_types::ComplianceDocSubmission { id, created_at, data };
    Ok(resp)
}
