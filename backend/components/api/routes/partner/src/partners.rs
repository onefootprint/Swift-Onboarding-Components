use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::PartnerTenantGuard;
use api_core::auth::tenant::PartnerTenantSessionAuth;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::TryDbToApi;
use api_core::FpResult;
use db::helpers::ComplianceDocSummary;
use db::models::ob_configuration::ObConfiguration;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Returns a summary of partnered companies for a compliance partner.",
    tags(Compliance, Private)
)]
#[actix::get("/partner/partnerships")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
) -> ApiListResponse<api_wire_types::ComplianceCompanySummary> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (summaries, counts) = state
        .db_query(move |conn| -> FpResult<_> {
            let summaries = ComplianceDocSummary::filter(conn, &pt_id, None, None)?;
            let tenant_ids: Vec<_> = summaries.values().map(|s| &s.tenant.id).collect();
            let counts = ObConfiguration::count_bulk(conn, tenant_ids, true)?;
            Ok((summaries, counts))
        })
        .await?;

    let companies = summaries
        .values()
        .map(|summary| api_wire_types::ComplianceCompanySummary::try_from_db((summary, &counts)))
        .collect::<FpResult<_>>()?;

    Ok(companies)
}
