use std::collections::HashMap;

use std::str::FromStr;

use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;

use crate::auth::tenant::TenantAuth;
use crate::auth::tenant::TenantGuard;
use crate::errors::proxy::VaultProxyError;
use crate::errors::ApiError;
use crate::errors::ApiResult;

use crate::errors::tenant::TenantError;
use crate::routes::proxy::token_parser::ProxyTokenParser;
use crate::utils::headers::get_header;
use crate::utils::headers::get_required_header;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::DecryptRequest;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use actix_web::http::header::HeaderMap;

use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;

use itertools::Itertools;

use newtypes::PiiString;

use paperclip::actix::{api_v2_operation, post, web, web::HttpRequest, web::HttpResponse};
use reqwest::header::HeaderName;
use reqwest::header::HeaderValue;
use reqwest::Method;

use super::token_parser::ProxyToken;

/// Prefix for headers to forward
const PROXY_FORWARD_HEADER_PREFIX: &str = "x-fpp-";

const PROXY_DESTINATION_URL_HEADER_NAME: &str = "x-fp-proxy-target";
const PROXY_DESTINATION_METHOD_HEADER_NAME: &str = "x-fp-proxy-method";
const PROXY_ACCESS_REASON: &str = "x-fp-proxy-access-reason";

#[tracing::instrument(skip(state, body_bytes, request))]
#[api_v2_operation(
    description = "Proxy decrypt user vault data to a target HTTPS destination",
    tags(Proxy, PublicApi)
)]
#[post("/proxy")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: HttpRequest,
    body_bytes: web::Bytes,
    insight: InsightHeaders,
) -> ApiResult<HttpResponse> {
    // Will eventually require the permission to decrypt attributes
    let auth = auth.check_guard(TenantGuard::Admin)?; // TODO auth for secret key
    let is_live = auth.is_live()?;

    let body_bytes = body_bytes.to_vec();
    let Some(body) = std::str::from_utf8(&body_bytes).ok() else {
        return Err(ApiError::InvalidProxyBody);
    };

    // get target url
    let proxy_target = get_required_header(PROXY_DESTINATION_URL_HEADER_NAME, request.headers())?;
    let destination_target_url =
        url::Url::parse(&proxy_target).map_err(|_| VaultProxyError::InvalidDestinationUrl)?;

    // enforce HTTPS for destinations
    if destination_target_url.scheme() != "https" && is_live {
        return Err(VaultProxyError::DestinationMustBeHttps)?;
    }

    // get target method
    let destination_method = get_header(PROXY_DESTINATION_METHOD_HEADER_NAME, request.headers())
        .and_then(|m| Method::from_str(&m).ok())
        .unwrap_or(Method::POST);

    // get target headers
    let fwd_headers = ForwardProxyHeaders::from(request.headers());

    // parse and de-tokenize body
    let parser = ProxyTokenParser::parse(body)?;

    // get decrypt reason
    let proxy_access_reason = get_header(PROXY_ACCESS_REASON, request.headers()).ok_or_else(|| {
        TenantError::ValidationError("Decryption reason required to make proxy request".to_owned())
    })?;

    let detokens = detokenize(
        &state,
        auth,
        parser.matches.keys().cloned().collect(),
        proxy_access_reason,
        insight.clone(),
    )
    .await?;
    let detokenized_body = parser.detokenize_body(detokens)?;

    // Make the upstream detokenized request (todo: support configuration)
    let client = reqwest::Client::new();
    let request = client
        .request(destination_method, destination_target_url)
        .headers(fwd_headers.into_headers())
        .body(detokenized_body)
        .build()?;
    let response = client.execute(request).await?;

    // return the proxied response
    let mut builder = HttpResponse::build(response.status());
    response.headers().into_iter().for_each(|(name, value)| {
        builder.insert_header((name, value));
    });

    // TODO: support parsing response and auto-vaulting key-paths

    let response = builder.body(response.bytes().await?);
    Ok(response)
}

/// Collects header to forward to proxy target
struct ForwardProxyHeaders(Vec<(HeaderName, PiiString)>);

impl ForwardProxyHeaders {
    fn into_headers(self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        self.0.into_iter().for_each(|(name, v)| {
            if let Ok(value) = HeaderValue::from_str(v.leak()) {
                headers.insert(name, value);
            };
        });
        headers
    }
}

impl From<&HeaderMap> for ForwardProxyHeaders {
    fn from(map: &HeaderMap) -> Self {
        Self(
            map.iter()
                .filter(|(n, _v)| n.as_str().starts_with(PROXY_FORWARD_HEADER_PREFIX))
                .flat_map(|(n, value)| {
                    let name = n.as_str().replacen(PROXY_FORWARD_HEADER_PREFIX, "", 1);
                    let name = HeaderName::from_str(&name).ok();

                    match (name, value.to_str().ok()) {
                        (Some(name), Some(value)) => {
                            let value = PiiString::from(value);
                            Some((name, value))
                        }
                        _ => {
                            tracing::warn!("invalid header name or value skipped");
                            None
                        }
                    }
                })
                .collect(),
        )
    }
}

/// turns tokens -> PII
/// TODO: depending on usage this function can be optimized greatly:
///     - concurrent async (dispatch concurrent all per-fpid)
///
/// Big TODO: create a shared decryption utility instead of duplicating code across all the places we decrypt.
async fn detokenize(
    state: &State,
    auth: Box<dyn TenantAuth>,
    tokens: Vec<ProxyToken>,
    reason: String,
    insight: InsightHeaders,
) -> ApiResult<HashMap<ProxyToken, PiiString>> {
    let mut out = HashMap::new();

    // split tokens by fp_id
    let tokens = tokens
        .into_iter()
        .map(|tok| (tok.fp_id, tok.identifier))
        .into_group_map();

    for (fp_id, targets) in tokens {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;

        let (uvw, scoped_user) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let scoped_user = ScopedUser::get(conn, (&fp_id, &tenant_id, is_live))?;
                let uvw = UserVaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
                // TODO how do we check perms for custom data? feels like always allowed, only gated
                // by tenant_role. I think this will break rn
                Ok((uvw, scoped_user))
            })
            .await??;

        let req = DecryptRequest {
            reason: reason.clone(),
            principal: auth.actor().into(),
            insight: CreateInsightEvent::from(insight.clone()),
        };
        let results = uvw
            .decrypt(state, &targets, Some(req))
            .await?
            .into_iter()
            .map(|(identifier, v)| {
                let token = ProxyToken {
                    fp_id: scoped_user.fp_user_id.clone(),
                    identifier,
                };
                (token, v)
            });
        out.extend(results);
    }

    Ok(out)
}
