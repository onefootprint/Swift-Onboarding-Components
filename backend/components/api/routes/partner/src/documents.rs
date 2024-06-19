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
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::TryDbToApi;
use api_core::{
    ApiError,
    ApiErrorKind,
};
use chrono::Utc;
use db::helpers::ComplianceDocSummary;
use db::models::compliance_doc::NewComplianceDoc;
use db::models::compliance_doc_request::NewComplianceDocRequest;
use db::models::compliance_doc_template_version::ComplianceDocTemplateVersion;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::TenantCompliancePartnershipId;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Returns a list of documents for a company partnered with the authorized compliance partner.",
    tags(Compliance, Private)
)]
#[actix::get("/partner/partnerships/{partnership_id}/documents")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    partnership_id: web::Path<TenantCompliancePartnershipId>,
) -> JsonApiListResponse<api_wire_types::ComplianceDocSummary> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let partnership_id = partnership_id.into_inner();

    let summary = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let summary = ComplianceDocSummary::filter(conn, &pt_id, Some(&partnership_id), None)?
                .into_values()
                .next()
                .ok_or(ApiError::from(ApiErrorKind::ResourceNotFound))?;
            Ok(summary)
        })
        .await?;

    let documents = summary
        .docs
        .keys()
        .map(|doc_id| api_wire_types::ComplianceDocSummary::try_from_db((&summary, doc_id)))
        .collect::<ApiResult<_>>()?;
    Ok(documents)
}

#[api_v2_operation(description = "Creates a new document.", tags(Compliance, Private))]
#[actix::post("/partner/partnerships/{partnership_id}/documents")]
pub async fn post(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    partnership_id: web::Path<TenantCompliancePartnershipId>,
    request: web::Json<api_wire_types::CreateComplianceDocRequest>,
) -> JsonApiResponse<api_wire_types::ComplianceDocSummary> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageReviews)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let partnership_id = partnership_id.into_inner();

    let template_version_id = request.template_version_id.clone();
    let name = request.name.clone();
    let description = request.description.clone();
    let requested_by_partner_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    let (summary, doc_id) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Check that the authorized partner tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &pt_id)?;

            // Get the template ID for the given template version ID, while ensuring that the
            // template version is owned by the authorized partner tenant.
            let template_id = template_version_id
                .as_ref()
                .map(|id| ComplianceDocTemplateVersion::get(conn, id, &pt_id))
                .transpose()?
                .map(|t| t.template_id);

            // Create a new compliance doc.
            let doc = NewComplianceDoc {
                tenant_compliance_partnership_id: &partnership_id,
                template_id: template_id.as_ref(),
            }
            .create(conn)
            .map_err(|e| -> ApiError {
                if e.is_unique_constraint_violation() {
                    ValidationError("A compliance document request already exists for this template").into()
                } else {
                    e.into()
                }
            })?;

            // Implicitly create a request for the new doc.
            NewComplianceDocRequest {
                created_at: Utc::now(),
                name: name.as_str(),
                description: description.as_str(),
                requested_by_partner_tenant_user_id: Some(&requested_by_partner_tenant_user_id),
                compliance_doc_id: &doc.id,
            }
            .create(conn, &doc)?;

            let mut summaries =
                ComplianceDocSummary::filter(conn, &pt_id, Some(&partnership_id), Some(&doc.id))?;
            let summary = summaries.remove(&partnership_id).ok_or(AssertionError(
                "no ComplianceDocSummary for requested partnership ID",
            ))?;

            Ok((summary, doc.into_inner().id))
        })
        .await?;

    let resp = api_wire_types::ComplianceDocSummary::try_from_db((&summary, &doc_id))?;
    Ok(resp)
}
