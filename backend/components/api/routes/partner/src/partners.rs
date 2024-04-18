use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::TryDbToApi,
};
use api_wire_types::ListComplianceCompaniesResponse;
use db::{helpers::ComplianceDocSummary, models::ob_configuration::ObConfiguration};
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Returns a summary of partnered companies for a compliance partner.",
    tags(Compliance, Private)
)]
#[actix::get("/partner/partnerships")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<ListComplianceCompaniesResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (summaries, counts) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let summaries = ComplianceDocSummary::filter(conn, &pt_id, None, None)?;
            let tenant_ids: Vec<_> = summaries.values().map(|s| &s.tenant.id).collect();
            let counts = ObConfiguration::count_bulk(conn, tenant_ids, true)?;
            Ok((summaries, counts))
        })
        .await?;

    let companies = summaries
        .values()
        .map(|summary| api_wire_types::ComplianceCompanySummary::try_from_db((summary, &counts)))
        .collect::<ApiResult<Vec<_>>>()?;

    ResponseData::ok(companies as ListComplianceCompaniesResponse).json()
}
