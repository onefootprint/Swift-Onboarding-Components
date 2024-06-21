use super::config::EgressConfig;
use super::ssrf_protection::validate_safe_url;
use super::ssrf_protection::PublicIpDNSResolver;
use crate::errors::proxy::VaultProxyError;
use crate::errors::ApiResult;
use crate::State;
use bytes::Bytes;
use chrono::Utc;
use db::models::proxy_request_log::FinishedRequestLog;
use db::models::proxy_request_log::NewProxyRequestLog;
use db::models::proxy_request_log::ProxyRequestLog;
use db::models::tenant::Tenant;
use http::HeaderName;
use newtypes::PiiString;
use newtypes::ProxyConfigId;
use reqwest::header::HeaderMap;
use reqwest::StatusCode;
use std::sync::Arc;

pub struct ProxyResponse {
    pub status_code: StatusCode,
    pub body: Bytes,
    pub headers: HeaderMap,
}

#[tracing::instrument(skip(state, body, config))]
pub async fn proxy_request(
    state: &State,
    tenant: &Tenant,
    config_id: Option<ProxyConfigId>,
    body: PiiString,
    config: EgressConfig,
) -> ApiResult<ProxyResponse> {
    // Prevent SSRF as much as possible before DNS resolution.
    validate_safe_url(&config.url)?;

    let mut client = reqwest::Client::builder().use_rustls_tls();

    // Prevent SSRF by blocking unsafe IPs resolved from DNS names.
    client = client.dns_resolver(Arc::new(PublicIpDNSResolver::new()));

    if let Some(client_tls) = config.client_tls_credential {
        client = client.identity(client_tls.into_identity())
    }

    if !config.pinned_certs.certs.is_empty() {
        client = client.tls_built_in_root_certs(false);
    }

    for cert in config.pinned_certs.certs {
        client = client.add_root_certificate(cert);
    }

    let client = client.build()?;

    // record the log
    let log = NewProxyRequestLog {
        tenant_id: tenant.id.clone(),
        config_id,
        e_url: tenant.public_key.seal_bytes(config.url.as_ref().as_bytes())?,
        method: config.method.to_string(),
        e_request_data: tenant.public_key.seal_pii(&body)?,
        sent_at: Utc::now(),
    };

    let log = state
        .db_pool
        .db_query(move |conn| ProxyRequestLog::create_new(conn, log))
        .await?;

    // build the request
    let request = client
        .request(config.method, config.url)
        .headers(config.headers.try_into_headers()?)
        .body(body)
        .build();

    // if the request is invalid log and error
    let request = match request {
        Ok(request) => request,
        Err(error) => {
            record_reqwest_error(log, state, &error).await?;
            return Err(VaultProxyError::from(error))?;
        }
    };

    // fire off the request!
    let response = client.execute(request).await;

    // log any the execution error
    let response = match response {
        Ok(response) => response,
        Err(error) => {
            // TODO: Support retry configurations
            record_reqwest_error(log, state, &error).await?;
            return Err(VaultProxyError::from(error))?;
        }
    };

    // parse the response
    let status_code = response.status();
    let headers = sanitize_headers(response.headers().clone())?;
    let response_body = response.bytes().await?;

    // log the actual result
    let log_finish = FinishedRequestLog {
        status_code: Some(status_code.as_u16() as i32),
        e_response_data: Some(tenant.public_key.seal_bytes(response_body.as_ref())?),
        request_error: None,
        received_at: Utc::now(),
    };

    let _ = state
        .db_pool
        .db_query(move |conn| log.finish_request(conn, log_finish))
        .await?;

    // return our response
    Ok(ProxyResponse {
        status_code,
        body: response_body,
        headers,
    })
}

async fn record_reqwest_error(log: ProxyRequestLog, state: &State, error: &reqwest::Error) -> ApiResult<()> {
    let update = FinishedRequestLog {
        status_code: None,
        e_response_data: None,
        request_error: Some(error.to_string()),
        received_at: Utc::now(),
    };

    let _ = state
        .db_pool
        .db_query(move |conn| log.finish_request(conn, update))
        .await?;

    Ok(())
}

// As long as we're serving proxy responses on api.onefootprint.com, we should be careful about
// what response headers we allow. In theory, it should be hard to get a web browser to render a
// web page with the response, since it's a POST request that requires an API key header. However,
// it's easier to reason about safety with a trusted set of headers rather than allowing all
// headers and filtering out a few we know are dangerous. For example, Set-Cookie may be dangerous
// in some contexts, but not others. For example, Fetch APIs ignore Set-Cookie in the response, but
// XMLHttpRequest may set cookies received in the response if withCredentials is true.
fn sanitize_headers(original_headers: HeaderMap) -> ApiResult<HeaderMap> {
    let mut ret = HeaderMap::new();

    // Make sure the browser doesn't try to guess the content type if it does manage to render the
    // response.
    ret.insert("x-content-type-options", "nosniff".try_into()?);

    for (name, value) in original_headers.iter() {
        let proxied_header_name = format!("x-footprint-proxy-fwd-{}", name);
        ret.insert(
            HeaderName::from_lowercase(proxied_header_name.as_bytes())?,
            value.clone(),
        );

        match name.as_str() {
            "cache-control" | "content-language" | "content-length" | "expires" | "last-modified"
            | "pragma" => {
                // Chose these as safe set since CORS considers these safe response headers by default.
                ret.insert(name.clone(), value.clone());
            }
            "content-type" => {
                // Content types look like "text/json; charset=utf-8". Check that the content type
                // matches a trusted list (or map to text/plain) and maintain the original charset.
                let v = value.to_str()?;
                let i = v.bytes().position(|b| b == b';').unwrap_or(v.bytes().len());
                let (content_type, rest) = v.split_at(i);
                let content_type = match content_type {
                    "text/plain" | "application/json" | "application/xml" | "text/xml" => content_type,
                    // Map unexpected content types to text/plain.
                    _ => "text/plain",
                };
                ret.insert("content-type", format!("{}{}", content_type, rest).try_into()?);
            }
            _ => {}
        }
    }

    Ok(ret)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_headers() {
        // 1: untrusted content type, custom headers.
        let mut orig = HeaderMap::new();
        orig.insert("content-length", "123".try_into().unwrap());
        orig.insert("x-custom-header", "abc".try_into().unwrap());
        orig.insert("content-type", "text/html; charset=utf-8".try_into().unwrap());

        let sanitized = sanitize_headers(orig).unwrap();
        let expected = [
            ("content-length", "123"),
            ("content-type", "text/plain; charset=utf-8"),
            ("x-content-type-options", "nosniff"),
            ("x-footprint-proxy-fwd-content-length", "123"),
            ("x-footprint-proxy-fwd-x-custom-header", "abc"),
            ("x-footprint-proxy-fwd-content-type", "text/html; charset=utf-8"),
        ];
        assert_eq!(sanitized.iter().count(), expected.len());
        for (name, value) in expected.into_iter() {
            assert_eq!(sanitized.get(name).unwrap().to_str().unwrap(), value);
        }

        // 2: trusted content type with charset
        let mut orig = HeaderMap::new();
        orig.insert(
            "content-type",
            "application/json; charset=utf-8".try_into().unwrap(),
        );

        let sanitized = sanitize_headers(orig).unwrap();
        let expected = [
            ("content-type", "application/json; charset=utf-8"),
            ("x-content-type-options", "nosniff"),
            (
                "x-footprint-proxy-fwd-content-type",
                "application/json; charset=utf-8",
            ),
        ];
        assert_eq!(sanitized.iter().count(), expected.len());
        for (name, value) in expected.into_iter() {
            assert_eq!(sanitized.get(name).unwrap().to_str().unwrap(), value);
        }

        // 3: trusted content type without charset
        let mut orig = HeaderMap::new();
        orig.insert("content-type", "text/xml".try_into().unwrap());

        let sanitized = sanitize_headers(orig).unwrap();
        let expected = [
            ("content-type", "text/xml"),
            ("x-content-type-options", "nosniff"),
            ("x-footprint-proxy-fwd-content-type", "text/xml"),
        ];
        assert_eq!(sanitized.iter().count(), expected.len());
        for (name, value) in expected.into_iter() {
            assert_eq!(sanitized.get(name).unwrap().to_str().unwrap(), value);
        }
    }
}
