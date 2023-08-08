use super::{config::EgressConfig, validate_not_footprint_url};
use crate::{
    errors::{proxy::VaultProxyError, ApiError, ApiResult},
    State,
};

use bytes::Bytes;
use chrono::Utc;
use db::models::{
    proxy_request_log::{FinishedRequestLog, NewProxyRequestLog, ProxyRequestLog},
    tenant::Tenant,
};
use newtypes::{PiiString, ProxyConfigId};
use reqwest::{header::HeaderMap, StatusCode};

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
) -> Result<ProxyResponse, ApiError> {
    let mut client = reqwest::Client::builder().use_rustls_tls();

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

    // Double check we aren't proxying to ourselves
    validate_not_footprint_url(&config.url)?;

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
        .await??;

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
    let headers = response.headers().clone();
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
        .await??;

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
        .await??;

    Ok(())
}
