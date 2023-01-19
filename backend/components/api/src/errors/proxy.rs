use newtypes::{ProxyConfigIngressRuleId, ProxyTokenError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum VaultProxyError {
    #[error("missing $ from token start")]
    InvalidTokenStart,
    #[error("missing $ from token start")]
    InvalidTokenComponents,
    #[error("invalid data type identifier: {0}")]
    InvalidDataIdentifier(#[from] newtypes::EnumDotNotationError),
    #[error("found invalid or unknown data identifiers: {0}")]
    DataIdentifiersNotFound(String),
    #[error("destination target url is an invalid url")]
    InvalidDestinationUrl,
    #[error("destination method is invalid")]
    InvalidDestinationMethod,
    #[error("destination target must be HTTPS in live-mode")]
    DestinationMustBeHttps,
    #[error("proxy configured with an invalid forward header: {0}")]
    InvalidProxyForwardHeader(String),
    #[error("proxy rule has an invalid header value")]
    InvalidIngressRuleHeader,
    #[error("proxy rule is badly formed: {0}")]
    BadIngressRule(String),
    #[error("Missing or invalid token for ingress rule: {0}")]
    IngressRuleTokenMissing(ProxyConfigIngressRuleId),
    #[error("ingress rule content type not specified, but ingress rules defined")]
    MissingIngressRuleContentType,
    #[error("invalid proxy pin cert header")]
    InvalidPinCertHeader,
    #[error("pem data must be url encoded")]
    InvalidPemUrlEncoding,
    #[error("proxy parameter encodes invalid base64")]
    InvalidBase64(#[from] crypto::base64::DecodeError),
    #[error("invalid or missing one of client cert and/or key headers")]
    InvalidClientCertHeader,
    #[error("client identity pem cert/key error: {0}")]
    ClientIdentityCertificate(reqwest::Error),
    #[error("bad pin server certificate: {0}")]
    ServerPinCertificate(reqwest::Error),
    #[error("invalid client certificate")]
    InvalidClientCertificate,
    #[error("invalid client certificate key")]
    InvalidClientCertificateKey,
    #[error("forward reqwest error")]
    RequestError(#[from] reqwest::Error),
    #[error("target json path not found: {0}")]
    TargetJsonPathNotFound(#[from] jsonpath_lib::JsonPathError),
    #[error("target json path value not a string or number")]
    TargetJsonPathValueNotAStringOrNumber,
    #[error("failed to convert to json: {0}")]
    FailedToParseIngressBodyJson(#[from] serde_json::Error),
    #[error("cannot vault restricted identity data")]
    CannotVaultIdentityDataForPortableVaultViaProxy,
    #[error("cannot proxy vault id documents")]
    CannotProxyVaultNonCustomData,
    #[error("invalid pem file: {0}")]
    PemError(#[from] crypto::pem::PemError),
    #[error("invalid proxy token: {0}")]
    ProxyTokenError(#[from] ProxyTokenError),
}
