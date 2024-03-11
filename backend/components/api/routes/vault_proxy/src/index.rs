use crate::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext},
    errors::ApiResult,
};

use crate::{
    proxy,
    proxy::{
        config::ProxyConfig, net_client, pii_parser, pii_parser::TokenizedIngress,
        token_parser::ProxyTokenParser,
    },
};

use crate::{proxy::tokenize, utils::headers::InsightHeaders, State};
use api_core::{auth::AuthError, telemetry::RootSpan, ApiErrorKind};

use api_core::{
    auth::tenant::TenantAuth,
    proxy::config::{JitProxyHeaderParams, ProxyHeaderParams},
    utils::body_bytes::BodyBytes,
};
use newtypes::{AccessEventPurpose, InvokeVaultProxyPermission, ProxyConfigId};
use paperclip::actix::{
    api_v2_operation, post, web,
    web::{HttpRequest, HttpResponse},
};

/// Limit the body payload to 5MB
const FIVE_MB: usize = 5 * 1024 * 1024;

#[allow(clippy::too_many_arguments)]
#[api_v2_operation(
    description = "Invoke the vault proxy 'just-in-time' (JIT) to securely send and receive data to a target destination. Please contact support to enable this API.",
    tags(VaultProxy, PublicApi)
)]
#[post("/vault_proxy/jit")]
pub async fn just_in_time(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    body_bytes: BodyBytes<FIVE_MB>,
    jit_params: JitProxyHeaderParams,
    opt_params: ProxyHeaderParams,
    insight: InsightHeaders,
    request: HttpRequest,
    root_span: RootSpan,
) -> ApiResult<HttpResponse> {
    let proxy_config = ProxyConfig::try_from((jit_params, opt_params, request.headers()))?;
    let auth = auth.check_guard(InvokeVaultProxyPermission::JustInTime)?;

    let tenant_id = &auth.tenant().id;
    if !state
        .feature_flag_client
        .flag(feature_flag::BoolFlag::IsVaultProxyJitEndpointEnabled(tenant_id))
    {
        return Err(AuthError::ApiEndpointRequiresSupportEnablement.into());
    }

    invoke_vault_proxy(
        state,
        auth,
        ProxySource::JustInTime(proxy_config),
        body_bytes,
        insight,
        request,
        root_span,
    )
    .await
}

#[allow(clippy::too_many_arguments)]
#[api_v2_operation(
    description = "Invoke the vault proxy by configuration id to securely send and receive data to a target destination. Please contact support to enable this API.",
    tags(VaultProxy, PublicApi)
)]
#[post("/vault_proxy/{id}")]
pub async fn id(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    proxy_config_id: web::Path<ProxyConfigId>,
    body_bytes: BodyBytes<FIVE_MB>,
    insight: InsightHeaders,
    params: ProxyHeaderParams,
    request: HttpRequest,
    root_span: RootSpan,
) -> ApiResult<HttpResponse> {
    let id = proxy_config_id.into_inner();
    let auth = auth.check_guard(InvokeVaultProxyPermission::Id { id: id.clone() })?;

    let tenant_id = &auth.tenant().id;
    if !state
        .feature_flag_client
        .flag(feature_flag::BoolFlag::IsVaultProxyPreConfiguredEndpointEnabled(
            tenant_id,
        ))
    {
        return Err(AuthError::ApiEndpointRequiresSupportEnablement.into());
    }

    invoke_vault_proxy(
        state,
        auth,
        ProxySource::Id(id, params),
        body_bytes,
        insight,
        request,
        root_span,
    )
    .await
}

enum ProxySource {
    Id(ProxyConfigId, ProxyHeaderParams),
    JustInTime(ProxyConfig),
}

#[tracing::instrument(skip_all)]
async fn invoke_vault_proxy(
    state: web::Data<State>,
    auth: Box<dyn TenantAuth>,
    source: ProxySource,
    body_bytes: BodyBytes<FIVE_MB>,
    insight: InsightHeaders,
    request: HttpRequest,
    root_span: RootSpan,
) -> ApiResult<HttpResponse> {
    let body_bytes = body_bytes.to_vec();
    let Some(body) = std::str::from_utf8(&body_bytes).ok() else {
        return Err(ApiErrorKind::InvalidProxyBody)?;
    };

    let config = match source {
        ProxySource::Id(proxy_id, params) => {
            ProxyConfig::load_from_db(&state, auth.as_ref(), proxy_id, params, request.headers()).await?
        }
        ProxySource::JustInTime(config) => config,
    };

    // 1. parse
    let (parser, tokens) = ProxyTokenParser::parse_and_log_fp_id(body, config.global_fp_id, root_span)?;

    // 2. detokenize
    let detokens = proxy::detokenize::detokenize(
        &state,
        auth.as_ref(),
        tokens,
        config.access_reason.clone(),
        insight.clone(),
        AccessEventPurpose::VaultProxy,
    )
    .await?;

    let detokenized_body = parser.detokenize_body(&detokens)?;

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
