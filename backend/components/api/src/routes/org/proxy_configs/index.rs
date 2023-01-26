use std::str::FromStr;

use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantRbAuthContext};
use crate::auth::Either;
use crate::errors::proxy::VaultProxyError;
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::CreateProxyConfigRequest;
use db::models::proxy_config::{NewProxyConfigArgs, ProxyConfig};
use db::DbError;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

type ProxyConfigsResponse = Json<ResponseData<Vec<api_wire_types::ProxyConfig>>>;

#[api_v2_operation(
    description = "List the organization's proxy configurations",
    tags(Organization, PublicApi)
)]
#[actix::get("/org/proxy_configs")]
pub async fn get(
    state: web::Data<State>,
    auth: Either<TenantRbAuthContext, SecretTenantAuthContext>,
) -> ApiResult<ProxyConfigsResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let configs = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> { ProxyConfig::list(conn, &tenant_id, is_live) })
        .await??;

    let configs: Vec<api_wire_types::ProxyConfig> = configs
        .into_iter()
        .map(api_wire_types::ProxyConfig::from_db)
        .collect();

    ResponseData::ok(configs).json()
}

#[api_v2_operation(
    description = "Create a new proxy configuration",
    tags(Organization, PublicApi)
)]
#[actix::post("/org/proxy_configs")]
pub async fn post(
    state: web::Data<State>,
    request: Json<CreateProxyConfigRequest>,
    auth: Either<TenantRbAuthContext, SecretTenantAuthContext>,
) -> ApiResult<Json<ResponseData<api_wire_types::ProxyConfig>>> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
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

    let mut client_identity_cert_der = None;
    let mut e_client_identity_key_der = None;

    // setup the client certificate
    if let Some(id) = client_identity {
        // validate the identity
        let _ = crate::proxy::config::ClientCertificateKey::parse_cert_and_key(
            id.certificate.as_bytes(),
            id.key.as_bytes(),
        )?;

        // validate pem
        let cert_der = crypto::pem::parse(id.certificate).map_err(VaultProxyError::from)?;
        let key_der = crypto::pem::parse(id.key).map_err(VaultProxyError::from)?;

        e_client_identity_key_der = Some(tenant.public_key.seal_bytes(&key_der.contents)?);
        client_identity_cert_der = Some(cert_der.contents);
    }

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

    let config = api_wire_types::ProxyConfig::from_db(config);

    ResponseData::ok(config).json()
}
