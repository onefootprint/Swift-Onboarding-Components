use crate::auth::tenant::{
    CheckTenantPermissions, TenantPermission, TenantPermissionDsl, TenantUserAuthContext,
};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use workos::organizations::{GetOrganization, OrganizationId};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct GetTenantResponse {
    /// tenant name
    name: String,
    /// set of email domains
    email_domains: Vec<String>,
}

#[api_v2_operation(description = "Returns tenant settings.", tags(Organization, PublicApi))]
#[actix::get("/org/settings")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantUserAuthContext,
) -> actix_web::Result<Json<ResponseData<GetTenantResponse>>, ApiError> {
    let auth = auth.check_permissions(TenantPermission::OrgSettings.or_ro())?;
    let tenant = auth.tenant();

    let email_domains = if let Some(org_id) = tenant.workos_id.as_ref() {
        let org = state
            .workos_client
            .organizations()
            .get_organization(&OrganizationId::from(org_id.as_str()))
            .await?;

        org.domains.into_iter().map(|domain| domain.domain).collect()
    } else {
        vec![]
    };

    //TODO: update tenant settings
    Ok(Json(ResponseData {
        data: GetTenantResponse {
            name: tenant.name.clone(),
            email_domains,
        },
    }))
}
