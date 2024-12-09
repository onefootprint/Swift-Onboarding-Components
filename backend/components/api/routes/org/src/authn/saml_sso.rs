use api_core::errors::workos::WorkOsError;
use api_core::utils::email_domain;
use api_core::ApiResponse;
use api_core::State;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use api_wire_types::SamlSsoRequest;
use api_wire_types::SamlSsoResponse;
use db::models::tenant::Tenant;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use workos::organizations::ListOrganizations;
use workos::organizations::ListOrganizationsParams;
use workos::sso::ClientId;
use workos::sso::ConnectionSelector;
use workos::sso::GetAuthorizationUrl;
use workos::sso::GetAuthorizationUrlParams;

#[api_v2_operation(
    description = "Fetch the SAML SSO URL for a given email address.",
    tags(Auth, Private)
)]
#[post("/org/auth/saml_sso")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<SamlSsoRequest>,
) -> ApiResponse<SamlSsoResponse> {
    let Some(domain) = email_domain::parse_private_email_domain(request.email_address.as_str()) else {
        return Ok(SamlSsoResponse { saml_sso_url: None });
    };

    let orgs = state
        .workos_client
        .organizations()
        .list_organizations(&ListOrganizationsParams {
            domains: Some(vec![domain.as_str()].into()),
            ..Default::default()
        })
        .await
        .map_err(|_| ServerErr("failed to check domain"))?;

    if orgs.data.len() > 1 {
        return ServerErrInto("multiple workos orgs with the same domain found");
    }

    let Some(org) = orgs.data.first().cloned() else {
        return Ok(SamlSsoResponse { saml_sso_url: None });
    };

    // ensure that this tenant is configured for workos saml sso
    let org_id = org.id.to_string();
    let tenant = state
        .db_pool
        .db_query(move |conn| Tenant::get_opt_by_workos_org_id(conn, &org_id))
        .await?;

    let Some(tenant) = tenant else {
        return Ok(SamlSsoResponse { saml_sso_url: None });
    };

    tracing::info!(
        tenant_id = ?tenant.id,
        tenant_name = tenant.name,
        "attempting SAML SSO login"
    );

    let authorization_url = &state
        .workos_client
        .sso()
        .get_authorization_url(&GetAuthorizationUrlParams {
            client_id: &ClientId::from(state.config.workos_client_id.as_str()),
            redirect_uri: request.redirect_url.as_str(),
            connection_selector: ConnectionSelector::Organization(&org.id),
            state: None,
        })
        .map_err(WorkOsError::from)?;


    Ok(SamlSsoResponse {
        saml_sso_url: Some(authorization_url.to_string()),
    })
}
