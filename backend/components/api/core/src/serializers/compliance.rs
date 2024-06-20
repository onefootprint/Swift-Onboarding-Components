use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::utils::db2api::DbToApi;
use crate::utils::db2api::TryDbToApi;
use db::helpers::ActiveDocResources;
use db::helpers::ComplianceDocSummary;
use db::models::compliance_doc_template::ComplianceDocTemplate;
use db::models::compliance_doc_template_version::ComplianceDocTemplateVersion;
use db::models::ob_configuration::TenantObConfigCounts;
use db::models::tenant_user::TenantUser;
use newtypes::ComplianceDocId;
use newtypes::ComplianceDocStatus;
use newtypes::TenantUserId;

impl TryDbToApi<(&ComplianceDocSummary, &TenantObConfigCounts)> for api_wire_types::ComplianceCompanySummary {
    fn try_from_db(target: (&ComplianceDocSummary, &TenantObConfigCounts)) -> ApiResult<Self> {
        let (summary, counts) = target;

        let num_controls_complete = summary.num_controls_complete()?;
        let num_controls_total = summary.num_controls_total()?;
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

impl TryDbToApi<(&ComplianceDocSummary, &TenantUserId)> for api_wire_types::LiteOrgMember {
    fn try_from_db(target: (&ComplianceDocSummary, &TenantUserId)) -> ApiResult<Self> {
        let (summary, user_id) = target;
        let user = summary
            .users
            .get(user_id)
            .ok_or(AssertionError("user not present in ComplianceDocSummary"))?;
        Ok(api_wire_types::LiteOrgMember::from_db(user.clone()))
    }
}

impl TryDbToApi<(&ComplianceDocSummary, &ComplianceDocId)> for api_wire_types::ComplianceDocSummary {
    fn try_from_db(target: (&ComplianceDocSummary, &ComplianceDocId)) -> ApiResult<Self> {
        let (summary, doc_id) = target;
        let doc = summary
            .docs
            .get(doc_id)
            .ok_or(AssertionError("doc not present in ComplianceDocSummary"))?;
        let ActiveDocResources {
            request: req,
            submission: sub,
            review: rev,
            partner_tenant_assignment,
            tenant_assignment,
        } = summary.active_resources_for_doc(doc_id)?;
        let status = summary.status_for_doc(doc_id)?;

        let partner_tenant_assignee = partner_tenant_assignment
            .and_then(|pta| pta.assigned_to_tenant_user_id.as_ref())
            .map(|user_id| api_wire_types::LiteOrgMember::try_from_db((summary, &user_id)))
            .transpose()?;
        let tenant_assignee = tenant_assignment
            .and_then(|ta| ta.assigned_to_tenant_user_id.as_ref())
            .map(|user_id| api_wire_types::LiteOrgMember::try_from_db((summary, &user_id)))
            .transpose()?;

        let last_updated = summary.last_updated(doc_id)?;

        let (name, description) = match &req {
            Some(req) => (req.name.clone(), req.description.clone()),
            None => {
                // Fall back on the name for the latest deactivated request if there are no active
                // requests. This should only happen if the document was requested and immediately
                // retracted.
                if status != ComplianceDocStatus::NotRequested {
                    tracing::error!("no active requests for active compliance doc");
                }
                let deactivated_req = summary.newest_request_for_doc(doc_id)?;
                (deactivated_req.name.clone(), deactivated_req.description.clone())
            }
        };

        Ok(api_wire_types::ComplianceDocSummary {
            id: doc_id.clone(),
            name,
            description,
            status,
            partner_tenant_assignee,
            tenant_assignee,
            last_updated,
            active_request_id: req.map(|req| req.id.clone()),
            active_submission_id: sub.map(|sub| sub.id.clone()),
            active_review_id: rev.map(|rev| rev.id.clone()),
            template_id: doc.template_id.clone(),
        })
    }
}

impl
    DbToApi<(
        ComplianceDocTemplate,
        ComplianceDocTemplateVersion,
        Option<TenantUser>,
    )> for api_wire_types::ComplianceDocTemplate
{
    fn from_db(
        target: (
            ComplianceDocTemplate,
            ComplianceDocTemplateVersion,
            Option<TenantUser>,
        ),
    ) -> Self {
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

impl DbToApi<(ComplianceDocTemplateVersion, Option<TenantUser>)>
    for api_wire_types::ComplianceDocTemplateVersion
{
    fn from_db(target: (ComplianceDocTemplateVersion, Option<TenantUser>)) -> Self {
        let (template_version, created_by_partner_tenant_user) = target;

        api_wire_types::ComplianceDocTemplateVersion {
            id: template_version.id,
            template_id: template_version.template_id,
            created_at: template_version.created_at,
            created_by_partner_tenant_user: created_by_partner_tenant_user
                .map(api_wire_types::LiteOrgMember::from_db),
            name: template_version.name,
            description: template_version.description,
        }
    }
}
