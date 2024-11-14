use crate::State;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_wire_types::CompliancePartnershipRequest;
use chrono::DateTime;
use chrono::Utc;
use db::models::compliance_doc::NewComplianceDoc;
use db::models::compliance_doc_request::NewComplianceDocRequest;
use db::models::compliance_doc_template::ComplianceDocTemplate;
use db::models::tenant_compliance_partnership::NewTenantCompliancePartnership;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::PartnerTenantId;
use newtypes::TenantCompliancePartnershipId;
use newtypes::TenantId;
use paperclip::actix::Apiv2Response;

#[derive(serde::Serialize, macros::JsonResponder, Apiv2Response)]
struct TenantCompliancePartnershipResponse {
    pub id: TenantCompliancePartnershipId,

    pub tenant_id: TenantId,
    pub partner_tenant_id: PartnerTenantId,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub deactivated_at: Option<DateTime<Utc>>,
}

#[post("/private/compliance/partnership")]
pub async fn post(
    state: web::Data<State>,
    request: Json<CompliancePartnershipRequest>,
    auth: FirmEmployeeAuthContext,
) -> ApiResponse<TenantCompliancePartnershipResponse> {
    auth.check_guard(FirmEmployeeGuard::Any)?;

    let partnership = state
        .db_transaction(move |conn| -> FpResult<_> {
            let (np, is_new) = NewTenantCompliancePartnership {
                tenant_id: &request.tenant_id.clone(),
                partner_tenant_id: &request.partner_tenant_id.clone(),
            }
            .get_or_create(conn)?;

            if is_new {
                let templates =
                    ComplianceDocTemplate::list_active_with_latest_version(conn, &np.partner_tenant_id)?;
                for (template, template_version) in templates {
                    let doc = NewComplianceDoc {
                        tenant_compliance_partnership_id: &np.id,
                        template_id: Some(&template.id),
                    }
                    .create(conn)?;

                    NewComplianceDocRequest {
                        created_at: Utc::now(),
                        name: &template_version.name,
                        description: &template_version.description,
                        requested_by_partner_tenant_user_id: None,
                        compliance_doc_id: &doc.id,
                    }
                    .create(conn, &doc)?;
                }
            }

            Ok(np)
        })
        .await?;

    let TenantCompliancePartnership {
        id,
        tenant_id,
        partner_tenant_id,
        _created_at,
        _updated_at,
        deactivated_at,
    } = partnership;
    let response = TenantCompliancePartnershipResponse {
        id,
        tenant_id,
        partner_tenant_id,
        _created_at,
        _updated_at,
        deactivated_at,
    };
    Ok(response)
}
