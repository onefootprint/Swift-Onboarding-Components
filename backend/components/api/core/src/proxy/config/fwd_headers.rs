use super::ProxyHeaderParams;
use crate::errors::proxy::VaultProxyError;
use crate::errors::{
    ApiError,
    ApiResult,
};
use actix_web::http::header::HeaderMap;
use newtypes::PiiString;
use reqwest::header::{
    HeaderName,
    HeaderValue,
};
use std::str::FromStr;

/// Parses out headers to forward along the egress
#[derive(Debug, Clone, Default)]
pub struct ForwardProxyHeaders(pub Vec<(String, PiiString)>);

impl ForwardProxyHeaders {
    pub fn concat(self, other: ForwardProxyHeaders) -> Self {
        Self(self.0.into_iter().chain(other.0).collect())
    }
}

impl TryFrom<&HeaderMap> for ForwardProxyHeaders {
    type Error = ApiError;

    fn try_from(map: &HeaderMap) -> ApiResult<Self> {
        let result = map
            .iter()
            .filter(|(n, _v)| {
                n.as_str()
                    .starts_with(ProxyHeaderParams::FORWARD_HEADER_PREFIX_HEADER_NAME)
            })
            .map(|(n, value)| {
                let name_string =
                    n.as_str()
                        .replacen(ProxyHeaderParams::FORWARD_HEADER_PREFIX_HEADER_NAME, "", 1);
                let parse = || {
                    let value = value.to_str().ok()?.to_string();
                    Some((name_string.clone(), PiiString::from(value)))
                };
                Ok(parse().ok_or(VaultProxyError::InvalidProxyForwardHeader(name_string))?)
            })
            .collect::<Result<Vec<_>, ApiError>>();

        Ok(Self(result?))
    }
}

impl ForwardProxyHeaders {
    /// transforms into headers to send with `reqwest`
    pub fn try_into_headers(self) -> Result<reqwest::header::HeaderMap, VaultProxyError> {
        let mut headers = reqwest::header::HeaderMap::new();
        for (name_str, v) in self.0 {
            let name = HeaderName::from_str(&name_str)
                .map_err(|_| VaultProxyError::InvalidProxyForwardHeader(name_str.clone()))?;
            let value = HeaderValue::from_str(v.leak())
                .map_err(|_| VaultProxyError::InvalidProxyForwardHeader(name_str))?;
            headers.insert(name, value);
        }
        Ok(headers)
    }
}
