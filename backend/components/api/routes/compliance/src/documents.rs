use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::TryDbToApi,
    ApiError, ApiErrorKind,
};
use api_wire_types::ListComplianceDocumentsResponse;
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
) -> JsonApiResponse<ListComplianceDocumentsResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let partnership_id = partnership_id.into_inner();

    let summary = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let summary = ComplianceDocSummary::filter(conn, &pt_id, Some(partnership_id), None)?
                .into_values()
                .next()
                .ok_or(ApiError::from(ApiErrorKind::ResourceNotFound))?;
            Ok(summary)
        })
        .await?;

    let resp = api_wire_types::ListComplianceDocumentsResponse::try_from_db(&summary)?;
    ResponseData::ok(resp).json()
}
