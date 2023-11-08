use crate::auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth};
use crate::errors::workos::WorkOsError;
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

#[api_v2_operation(
    description = "Returns tenant settings.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::get("/org/settings")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> actix_web::Result<Json<ResponseData<GetTenantResponse>>, ApiError> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let email_domains = if let Some(org_id) = tenant.workos_id.as_ref() {
        let org = state
            .workos_client
            .organizations()
            .get_organization(&OrganizationId::from(org_id.as_str()))
            .await
            .map_err(WorkOsError::from)?;

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
