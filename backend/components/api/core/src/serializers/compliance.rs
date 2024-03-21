use crate::{
    errors::{ApiResult, AssertionError},
    utils::db2api::{DbToApi, TryDbToApi},
};
use db::{
    helpers::ComplianceDocSummary,
    models::{
        compliance_doc_template::ComplianceDocTemplate,
        compliance_doc_template_version::ComplianceDocTemplateVersion,
        ob_configuration::TenantObConfigCounts, tenant_user::TenantUser,
    },
};

impl TryDbToApi<(&ComplianceDocSummary, &TenantObConfigCounts)> for api_wire_types::ComplianceCompanySummary {
    fn try_from_db(target: (&ComplianceDocSummary, &TenantObConfigCounts)) -> ApiResult<Self> {
        let (summary, counts) = target;

        let num_controls_complete = summary.num_controls_complete()?;
        let num_controls_total = summary.num_controls_total();
        let num_active_playbooks = counts.get(&summary.tenant.id).copied().unwrap_or(0);

        Ok(api_wire_types::ComplianceCompanySummary {
            id: summary.partnership.id.clone(),
            company_name: summary.tenant.name.clone(),
            num_controls_complete,
            num_controls_total,
            num_active_playbooks,
        })
    }
}

impl TryDbToApi<&ComplianceDocSummary> for api_wire_types::ListComplianceDocumentsResponse {
    fn try_from_db(summary: &ComplianceDocSummary) -> ApiResult<Self> {
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
    }
}

impl DbToApi<(ComplianceDocTemplate, ComplianceDocTemplateVersion, TenantUser)>
    for api_wire_types::ComplianceDocTemplate
{
    fn from_db(target: (ComplianceDocTemplate, ComplianceDocTemplateVersion, TenantUser)) -> Self {
        let (template, template_version, created_by_partner_tenant_user) = target;

        api_wire_types::ComplianceDocTemplate {
            id: template.id,
            latest_version: api_wire_types::ComplianceDocTemplateVersion::from_db((
                template_version,
                created_by_partner_tenant_user,
            )),
        }
    }
}

impl DbToApi<(ComplianceDocTemplateVersion, TenantUser)> for api_wire_types::ComplianceDocTemplateVersion {
    fn from_db(target: (ComplianceDocTemplateVersion, TenantUser)) -> Self {
        let (template_version, created_by_partner_tenant_user) = target;

        api_wire_types::ComplianceDocTemplateVersion {
            id: template_version.id,
            template_id: template_version.template_id,
            created_at: template_version.created_at,
            created_by_partner_tenant_user: api_wire_types::LiteOrgMember::from_db(
                created_by_partner_tenant_user,
            ),
            name: template_version.name,
            description: template_version.description,
        }
    }
}
