use crate::State;
use actix_web::{post, web, web::Json};
use api_core::{
    auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
    errors::ApiResult,
    types::{response::ResponseData, JsonApiResponse},
};
use api_wire_types::CompliancePartnershipRequest;
use db::models::tenant_compliance_partnership::{
    NewTenantCompliancePartnership, TenantCompliancePartnership,
};


#[post("/private/compliance/partnership")]
pub async fn post(
    state: web::Data<State>,
    request: Json<CompliancePartnershipRequest>,
    auth: FirmEmployeeAuthContext,
) -> JsonApiResponse<TenantCompliancePartnership> {
    auth.check_guard(FirmEmployeeGuard::Any)?;

    let partnership = state
        .db_pool
        .db_transaction(move |db| -> ApiResult<_> {
            let (np, _) = NewTenantCompliancePartnership {
                tenant_id: &request.tenant_id.clone(),
                partner_tenant_id: &request.partner_tenant_id.clone(),
            }
            .get_or_create(db)?;
            Ok(np)
        })
        .await?;

    ResponseData::ok(partnership).json()
}
