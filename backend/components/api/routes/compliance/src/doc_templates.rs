use crate::{types::JsonApiResponse, State};
use api_core::{
    auth::tenant::{CheckTenantGuard, PartnerTenantGuard, PartnerTenantSessionAuth},
    errors::{ApiResult, AssertionError},
    types::{EmptyResponse, ResponseData},
    utils::db2api::DbToApi,
};
use chrono::Utc;
use db::{
    models::{
        compliance_doc_template::{ComplianceDocTemplate, NewComplianceDocTemplate},
        compliance_doc_template_version::NewComplianceDocTemplateVersion,
        tenant_user::TenantUser,
    },
    DbResult,
};
use itertools::Itertools;
use newtypes::ComplianceDocTemplateId;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    description = "Lists compliance document templates.",
    tags(Compliance, Private)
)]
#[actix::get("/compliance/doc_templates")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::ListComplianceDocTemplatesResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (templates_with_latest_version, users) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let templates_with_latest_version =
                ComplianceDocTemplate::list_active_with_latest_version(conn, &pt_id)?;

            let user_ids = templates_with_latest_version
                .iter()
                .map(|(_, tplv)| &tplv.created_by_partner_tenant_user_id)
                .collect_vec();

            let users = TenantUser::get_bulk(conn, user_ids)?;

            Ok((templates_with_latest_version, users))
        })
        .await?;

    let templates = templates_with_latest_version
        .into_iter()
        .map(|(tpl, tplv)| {
            let user = users
                .get(&tplv.created_by_partner_tenant_user_id)
                .ok_or(AssertionError("missing tenant user ID after get_bulk"))?
                .clone();

            Ok(api_wire_types::ComplianceDocTemplate::from_db((tpl, tplv, user)))
        })
        .collect::<ApiResult<Vec<_>>>()?;

    ResponseData::ok(templates).json()
}

#[api_v2_operation(
    description = "Creates a new compliance document template.",
    tags(Compliance, Private)
)]
#[actix::post("/compliance/doc_templates")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateComplianceDocTemplateRequest>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::ComplianceDocTemplate> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageTemplates)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let req = request.into_inner();
    let created_by_partner_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    let models = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let template = NewComplianceDocTemplate {
                partner_tenant_id: &pt_id,
            }
            .create(conn)?;

            let template_version = ComplianceDocTemplate::create_new_version(
                conn,
                &template,
                NewComplianceDocTemplateVersion {
                    created_at: Utc::now(),
                    created_by_partner_tenant_user_id: &created_by_partner_tenant_user_id,
                    template_id: &template.id,
                    name: &req.name,
                    description: &req.description,
                },
            )?;

            let created_by_partner_tenant_user = TenantUser::get(conn, &created_by_partner_tenant_user_id)?;

            Ok((
                template.into_inner(),
                template_version,
                created_by_partner_tenant_user,
            ))
        })
        .await?;

    let resp = api_wire_types::ComplianceDocTemplate::from_db(models);
    ResponseData::ok(resp).json()
}

#[api_v2_operation(
    description = "Updates a compliance document template by creating a new template version.",
    tags(Compliance, Private)
)]
#[actix::put("/compliance/doc_templates/{template_id}")]
pub async fn put(
    state: web::Data<State>,
    template_id: web::Path<ComplianceDocTemplateId>,
    request: web::Json<api_wire_types::UpdateComplianceDocTemplateRequest>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::ComplianceDocTemplate> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageTemplates)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let template_id = template_id.into_inner();
    let req = request.into_inner();
    let created_by_partner_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    let models = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            // Ensure the template is owned by the authorized partner tenant.
            let template = ComplianceDocTemplate::lock(conn, &template_id, &pt_id)?;

            let template_version = ComplianceDocTemplate::create_new_version(
                conn,
                &template,
                NewComplianceDocTemplateVersion {
                    created_at: Utc::now(),
                    created_by_partner_tenant_user_id: &created_by_partner_tenant_user_id,
                    template_id: &template.id,
                    name: &req.name,
                    description: &req.description,
                },
            )?;

            let created_by_partner_tenant_user = TenantUser::get(conn, &created_by_partner_tenant_user_id)?;

            Ok((
                template.into_inner(),
                template_version,
                created_by_partner_tenant_user,
            ))
        })
        .await?;
    let resp = api_wire_types::ComplianceDocTemplate::from_db(models);
    ResponseData::ok(resp).json()
}

#[api_v2_operation(
    description = "Deactivates a compliance document template.",
    tags(Compliance, Private)
)]
#[actix::delete("/compliance/doc_templates/{template_id}")]
pub async fn delete(
    state: web::Data<State>,
    template_id: web::Path<ComplianceDocTemplateId>,
    auth: PartnerTenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(PartnerTenantGuard::ManageTemplates)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let template_id = template_id.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            ComplianceDocTemplate::deactivate(conn, &template_id, &pt_id)
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
