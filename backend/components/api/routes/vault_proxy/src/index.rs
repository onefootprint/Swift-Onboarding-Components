use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::errors::ApiError;
use crate::errors::ApiResult;

use crate::proxy;
use crate::proxy::config::ProxyConfig;
use crate::proxy::net_client;
use crate::proxy::pii_parser;
use crate::proxy::pii_parser::TokenizedIngress;
use crate::proxy::token_parser::ProxyTokenParser;

use crate::proxy::tokenize;
use crate::utils::headers::InsightHeaders;
use crate::State;

use api_core::proxy::config::JustInTimeProxyConfig;
use api_core::proxy::config::ProxyIdAdditonalHeaders;
use api_core::utils::body_bytes::BodyBytes;
use newtypes::ProxyConfigId;
use paperclip::actix::{api_v2_operation, post, web, web::HttpRequest, web::HttpResponse};

/// Limit the body payload to 5MB
const FIVE_MB: usize = 5 * 1024 * 1024;

#[tracing::instrument(skip(state, body_bytes, request))]
#[api_v2_operation(
    description = "Invoke the vault proxy 'just-in-time' (JIT) to securely send and receive data to a target destination",
    tags(VaultProxy, PublicApi)
)]
#[post("/vault_proxy/jit")]
pub async fn just_in_time(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    jit: JustInTimeProxyConfig,
    body_bytes: BodyBytes<FIVE_MB>,
    insight: InsightHeaders,
    request: HttpRequest,
) -> ApiResult<HttpResponse> {
    invoke_vault_proxy(
        state,
        auth,
        ProxyConfigSource::JustInTime(jit.config),
        body_bytes,
        insight,
        request,
    )
    .await
}

#[tracing::instrument(skip(state, body_bytes, request))]
#[api_v2_operation(
    description = "Invoke the vault proxy by configuration id to securely send and receive data to a target destination",
    tags(VaultProxy, PublicApi)
)]
#[post("/vault_proxy/{proxy_id}")]
pub async fn id(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    proxy_config_id: web::Path<ProxyConfigId>,
    body_bytes: BodyBytes<FIVE_MB>,
    insight: InsightHeaders,
    request: HttpRequest,
    _: ProxyIdAdditonalHeaders,
) -> ApiResult<HttpResponse> {
    let id = proxy_config_id.into_inner();
    invoke_vault_proxy(
        state,
        auth,
        ProxyConfigSource::Id(id),
        body_bytes,
        insight,
        request,
    )
    .await
}

#[derive(Debug)]
#[allow(clippy::large_enum_variant)]
enum ProxyConfigSource {
    Id(ProxyConfigId),
    JustInTime(ProxyConfig),
}

#[tracing::instrument(skip(state, body_bytes, request))]
async fn invoke_vault_proxy(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    source: ProxyConfigSource,
    body_bytes: BodyBytes<FIVE_MB>,
    insight: InsightHeaders,
    request: HttpRequest,
) -> ApiResult<HttpResponse> {
    // Will eventually require the permission to decrypt attributes
    let auth = auth.check_guard(TenantGuard::VaultProxy)?;
    let _is_live = auth.is_live()?;

    let body_bytes = body_bytes.to_vec();
    let Some(body) = std::str::from_utf8(&body_bytes).ok() else {
        return Err(ApiError::InvalidProxyBody);
    };

    // parse the proxy configuration either by ID or just in time via headers
    let config = match source {
        ProxyConfigSource::Id(proxy_id) => {
            ProxyConfig::load_from_db(&state, auth.as_ref(), proxy_id, request.headers()).await?
        }
        ProxyConfigSource::JustInTime(config) => config,
    };

    // 1. parse
    let parser = ProxyTokenParser::parse(body, config.global_fp_id)?;

    // 2. detokenize
    let detokens = proxy::detokenize::detokenize(
        &state,
        auth.as_ref(),
        parser.matches.keys().cloned().collect(),
        config.access_reason.clone(),
        insight.clone(),
    )
    .await?;

    let detokenized_body = parser.detokenize_body(detokens)?;

    // 3. proxy the detokenized request
    let response = net_client::proxy_request(
        &state,
        auth.tenant(),
        config.config_id.clone(),
        detokenized_body,
        config.egress,
    )
    .await?;

    tracing::info!(status=%response.status_code, "proxy destination response");

    // 4. build the ingress response
    let mut builder = HttpResponse::build(response.status_code);

    // 4a. forward ingress headers
    response.headers.iter().for_each(|(name, value)| {
        builder.insert_header((name, value));
    });

    // 4b. tokenize the ingress if needed
    let TokenizedIngress {
        tokenized_body,
        values_to_vault,
    } = pii_parser::process_ingress(response.body, config.ingress).await?;

    // 4c. vault pii
    tokenize::vault_pii(&state, auth.as_ref(), values_to_vault, insight).await?;

    let response = builder.body(tokenized_body);
    Ok(response)
}
