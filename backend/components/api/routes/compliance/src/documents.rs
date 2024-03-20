use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::{ApiResult, AssertionError},
    types::ResponseData,
    utils::db2api::DbToApi,
    ApiError, ApiErrorKind,
};
use api_wire_types::GetComplianceDocumentsResponse;
use db::helpers::ComplianceDocSummary;
use newtypes::TenantCompliancePartnershipId;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Returns a list of documents for a company partned with the authorized compliance partner.",
    tags(Compliance, Private)
)]
#[actix::get("/compliance/partners/{partnership_id}/documents")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    partnership_id: web::Path<TenantCompliancePartnershipId>,
) -> JsonApiResponse<GetComplianceDocumentsResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let partnership_id = partnership_id.into_inner();

    let documents = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let summary = ComplianceDocSummary::filter(conn, &pt_id, Some(partnership_id), None)?
                .into_values()
                .next()
                .ok_or(ApiError::from(ApiErrorKind::ResourceNotFound))?;

            let documents = summary
                .docs
                .keys()
                .map(|doc_id| {
                    let (req, sub, _) = summary.newest_resources_for_doc(doc_id)?;
                    let status = summary.status_for_doc(doc_id)?;

                    let assigned_to = sub
                        .and_then(|sub| sub.assigned_to_partner_tenant_user_id.as_ref())
                        .map(|user_id| -> ApiResult<_> {
                            let user = summary
                                .users
                                .get(user_id)
                                .ok_or(AssertionError("user not present in ComplianceDocSummary"))?;
                            Ok(api_wire_types::LiteOrgMember::from_db(user.clone()))
                        })
                        .transpose()?;

                    let last_updated = summary.last_updated(doc_id)?;

                    Ok(api_wire_types::ComplianceDocSummary {
                        id: doc_id.clone(),
                        name: req.name.clone(),
                        status,
                        assigned_to,
                        last_updated,
                    })
                })
                .collect::<ApiResult<Vec<_>>>()?;

            Ok(documents)
        })
        .await?;

    ResponseData::ok(GetComplianceDocumentsResponse { documents }).json()
}
