use crate::{errors::ApiResult, utils::db2api::TryDbToApi};
use db::{helpers::ComplianceDocSummary, models::ob_configuration::TenantObConfigCounts};

impl TryDbToApi<(&ComplianceDocSummary, &TenantObConfigCounts)> for api_wire_types::ComplianceCompanySummary {
    fn try_from_db(target: (&ComplianceDocSummary, &TenantObConfigCounts)) -> ApiResult<Self> {
        let (summary, counts) = target;

        let num_controls_complete = summary.num_controls_complete()?;
        let num_controls_total = summary.num_controls_total();
        let num_active_playbooks = counts.get(&summary.tenant.id).copied().unwrap_or(0);

        Ok(api_wire_types::ComplianceCompanySummary {
            partnership_id: summary.partnership.id.clone(),
            company_name: summary.tenant.name.clone(),
            num_controls_complete,
            num_controls_total,
            num_active_playbooks,
        })
    }
}
