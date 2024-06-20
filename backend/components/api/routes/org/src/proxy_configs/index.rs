use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::proxy::VaultProxyError;
use api_core::proxy::ssrf_protection::validate_safe_url;
use api_core::types::JsonApiListResponse;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::CreateProxyConfigRequest;
use api_wire_types::GetProxyConfigRequest;
use api_wire_types::PatchProxyConfigRequest;
use db::models::proxy_config::NewProxyConfigArgs;
use db::models::proxy_config::ProxyConfig;
use db::models::proxy_config::ProxyConfigFilters;
use db::models::proxy_config::UpdateProxyConfigArgs;
use db::DbError;
use newtypes::ProxyConfigId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::str::FromStr;

#[api_v2_operation(
    description = "List the organization's proxy configurations",
    tags(ProxyConfigs, Organization, Private)
)]
#[actix::get("/org/proxy_configs")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<GetProxyConfigRequest>,
    auth: TenantSessionAuth,
) -> JsonApiListResponse<api_wire_types::ProxyConfigBasic> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let GetProxyConfigRequest { status } = filters.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let configs = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let filters = ProxyConfigFilters {
                status,
                tenant_id: &tenant_id,
                is_live,
            };
            let res = ProxyConfig::list(conn, filters)?;
            Ok(res)
        })
        .await?;

    let configs = configs
        .into_iter()
        .map(api_wire_types::ProxyConfigBasic::from_db)
        .collect();

    Ok(configs)
}

#[api_v2_operation(
    description = "Get a proxy configuration with details",
    tags(ProxyConfigs, Organization, Private)
)]
#[actix::get("/org/proxy_configs/{proxy_config_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    proxy_config_id: web::Path<ProxyConfigId>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::ProxyConfigDetailed> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let proxy_config_id = proxy_config_id.into_inner();

    let config = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            ProxyConfig::find(conn, &tenant_id, is_live, proxy_config_id)
        })
        .await?;

    Ok(api_wire_types::ProxyConfigDetailed::from_db(config))
}

#[api_v2_operation(
    description = "Create a new proxy configuration",
    tags(ProxyConfigs, Organization, Private)
)]
#[actix::post("/org/proxy_configs")]
pub async fn post(
    state: web::Data<State>,
    request: Json<CreateProxyConfigRequest>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::ProxyConfigDetailed> {
    let auth = auth.check_guard(TenantGuard::ManageVaultProxy)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;

    let CreateProxyConfigRequest {
        name,
        url,
        method,
        client_identity,
        headers,
        secret_headers,
        pinned_server_certificates,
        access_reason,
        ingress_settings,
    } = request.into_inner();

    // setup the client certificate
    let (client_identity_cert_der, e_client_identity_key_der) = if let Some(id) = client_identity {
        // validate the identity
        let _ = api_core::proxy::config::ClientCertificateKey::parse_cert_and_key(
            id.certificate.as_bytes(),
            id.key.as_bytes(),
        )?;

        // validate pem
        let cert_der = crypto::pem::parse(id.certificate).map_err(VaultProxyError::from)?;
        let key_der = crypto::pem::parse(id.key).map_err(VaultProxyError::from)?;

        (
            Some(cert_der.contents),
            Some(tenant.public_key.seal_bytes(&key_der.contents)?),
        )
    } else {
        (None, None)
    };

    // seal secret headers
    let custom_header_secrets = secret_headers
        .into_iter()
        .map(|h| {
            let e_value = tenant.public_key.seal_bytes(h.value.leak().as_bytes())?;
            Ok((h.name, e_value))
        })
        .collect::<Result<Vec<_>, crypto::Error>>()?;

    // parse server certs
    let server_certs = pinned_server_certificates
        .into_iter()
        .map(|cert| {
            let _ = reqwest::Certificate::from_pem(cert.as_bytes())
                .map_err(VaultProxyError::ServerPinCertificate)?;
            crypto::pem::parse(cert)
                .map_err(VaultProxyError::from)
                .map(|cert| cert.contents)
        })
        .collect::<Result<Vec<_>, _>>()?;

    let url = url::Url::parse(&url).map_err(|_| VaultProxyError::InvalidDestinationUrl)?;
    validate_safe_url(&url)?;
    let method = reqwest::Method::from_str(&method).map_err(|_| VaultProxyError::InvalidDestinationMethod)?;

    // ingress
    let (ingress_content_type, ingress_rules) = if let Some(ingress) = ingress_settings {
        (Some(ingress.content_type), ingress.rules)
    } else {
        (None, vec![])
    };

    let args = NewProxyConfigArgs {
        tenant_id,
        is_live,
        name,
        url: url.to_string(),
        method: method.to_string(),
        client_identity_cert_der,
        e_client_identity_key_der,
        ingress_content_type,
        custom_headers: headers.into_iter().map(|h| (h.name, h.value)).collect(),
        custom_header_secrets,
        server_certs,
        ingress_rules: ingress_rules
            .into_iter()
            .map(|rule| (rule.token.to_string(), rule.target))
            .collect(),
        access_reason,
    };

    let config = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> { ProxyConfig::create_new(conn, args) })
        .await?;

    let config = api_wire_types::ProxyConfigDetailed::from_db(config);

    Ok(config)
}

#[api_v2_operation(
    description = "Update an existing proxy configuration",
    tags(ProxyConfigs, Organization, Private)
)]
#[actix::patch("/org/proxy_configs/{proxy_config_id}")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<PatchProxyConfigRequest>,
    proxy_config_id: web::Path<ProxyConfigId>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::ProxyConfigDetailed> {
    let auth = auth.check_guard(TenantGuard::ManageVaultProxy)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let is_live = auth.is_live()?;
    let proxy_config_id = proxy_config_id.into_inner();

    let PatchProxyConfigRequest {
        name,
        status,
        url,
        method,
        headers,
        client_identity,
        pinned_server_certificates,
        access_reason,
        ingress_settings,
        add_secret_headers,
        delete_secret_headers,
    } = request.into_inner();

    // setup the client certificate
    let (client_identity_cert_der, e_client_identity_key_der) = match client_identity {
        Some(Some(id)) => {
            // validate the identity
            let _ = api_core::proxy::config::ClientCertificateKey::parse_cert_and_key(
                id.certificate.as_bytes(),
                id.key.as_bytes(),
            )?;

            // validate pem
            let cert_der = crypto::pem::parse(id.certificate).map_err(VaultProxyError::from)?;
            let key_der = crypto::pem::parse(id.key).map_err(VaultProxyError::from)?;

            (
                Some(Some(cert_der.contents)),
                Some(Some(tenant.public_key.seal_bytes(&key_der.contents)?)),
            )
        }
        Some(None) => (Some(None), Some(None)),
        None => (None, None),
    };

    // seal secret headers
    let custom_header_secrets = if let Some(nsh) = add_secret_headers {
        Some(
            nsh.into_iter()
                .map(|h| {
                    let e_value = tenant.public_key.seal_bytes(h.value.leak().as_bytes())?;
                    Ok((h.name, e_value))
                })
                .collect::<Result<Vec<_>, crypto::Error>>()?,
        )
    } else {
        None
    };

    // parse server certs
    let server_certs = if let Some(psc) = pinned_server_certificates {
        Some(
            psc.into_iter()
                .map(|cert| {
                    let _ = reqwest::Certificate::from_pem(cert.as_bytes())
                        .map_err(VaultProxyError::ServerPinCertificate)?;
                    crypto::pem::parse(cert)
                        .map_err(VaultProxyError::from)
                        .map(|cert| cert.contents)
                })
                .collect::<Result<Vec<_>, _>>()?,
        )
    } else {
        None
    };

    let url = if let Some(url) = url {
        Some(url::Url::parse(&url).map_err(|_| VaultProxyError::InvalidDestinationUrl)?)
    } else {
        None
    };

    let method = if let Some(method) = method {
        Some(reqwest::Method::from_str(&method).map_err(|_| VaultProxyError::InvalidDestinationMethod)?)
    } else {
        None
    };

    // ingress
    let (ingress_content_type, ingress_rules) = if let Some(ingress) = ingress_settings {
        if let Some(ingress) = ingress {
            (
                Some(Some(ingress.content_type)),
                Some(
                    ingress
                        .rules
                        .into_iter()
                        .map(|rule| (rule.token.to_string(), rule.target))
                        .collect(),
                ),
            )
        } else {
            (Some(None), Some(vec![]))
        }
    } else {
        (None, None)
    };

    let args = UpdateProxyConfigArgs {
        tenant_id,
        is_live,
        config_id: proxy_config_id,
        name,
        status,
        url: url.map(|url| url.to_string()),
        method: method.map(|m| m.to_string()),
        client_identity_cert_der,
        e_client_identity_key_der,
        ingress_content_type,
        custom_headers: headers.map(|hdrs| hdrs.into_iter().map(|h| (h.name, h.value)).collect()),
        custom_header_secrets,
        delete_custom_header_secrets: delete_secret_headers.unwrap_or_default(),
        server_certs,
        ingress_rules,
        access_reason,
    };

    let config = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> { ProxyConfig::update(conn, args) })
        .await?;

    let config = api_wire_types::ProxyConfigDetailed::from_db(config);

    Ok(config)
}
