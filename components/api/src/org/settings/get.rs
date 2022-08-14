use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::State;
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

/// get tenant settings
#[api_v2_operation(tags(PublicApi))]
#[get("/")]
fn handler(
    state: web::Data<State>,
    auth: SessionContext<WorkOsSession>,
) -> actix_web::Result<Json<ApiResponseData<GetTenantResponse>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;

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
            name: tenant.name,
            email_domains,
        },
    }))
}
