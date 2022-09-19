use crate::auth::{CheckTenantPermissions, WorkOsAuth};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::State;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};
use workos::organizations::{GetOrganization, OrganizationId};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct GetTenantResponse {
    /// tenant name
    name: String,
    /// set of email domains
    email_domains: Vec<String>,
}

#[api_v2_operation(
    summary = "/org/settings",
    operation_id = "org-settings",
    description = "Returns tenant settings.",
    tags(PublicApi)
)]
#[get("/")]
fn handler(
    state: web::Data<State>,
    auth: WorkOsAuth,
) -> actix_web::Result<Json<ApiResponseData<GetTenantResponse>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::OrgSettings])?;
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
    Ok(Json(ApiResponseData {
        data: GetTenantResponse {
            name: tenant.name.clone(),
            email_domains,
        },
    }))
}
