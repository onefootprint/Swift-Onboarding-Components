use newtypes::{ProxyConfigIngressRuleId, ProxyTokenError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum VaultProxyError {
    #[error("Missing $ from token start")]
    InvalidTokenStart,
    #[error("Missing $ from token start")]
    InvalidTokenComponents,
    #[error("Invalid data type identifier: {0}")]
    InvalidDataIdentifier(#[from] newtypes::EnumDotNotationError),
    #[error("Found invalid or unknown data identifiers: {0}")]
    DataIdentifiersNotFound(String),
    #[error("Destination target URL is an invalid URL")]
    InvalidDestinationUrl,
    #[error("Target URL cannot be a Footprint URL")]
    InvalidFootprintDestinationUrl,
    #[error("Destination method is invalid")]
    InvalidDestinationMethod,
    #[error("Destination target must be HTTPS in live-mode")]
    DestinationMustBeHttps,
    #[error("Proxy configured with an invalid forward header: {0}")]
    InvalidProxyForwardHeader(String),
    #[error("Proxy rule has an invalid header value")]
    InvalidIngressRuleHeader,
    #[error("Proxy rule is badly formed: {0}")]
    BadIngressRule(String),
    #[error("Missing or invalid token for ingress rule: {0}")]
    IngressRuleTokenMissing(ProxyConfigIngressRuleId),
    #[error("Ingress rule content type not specified, but ingress rules defined")]
    MissingIngressRuleContentType,
    #[error("Invalid proxy pin cert header")]
    InvalidPinCertHeader,
    #[error("PEM data must be url encoded")]
    InvalidPemUrlEncoding,
    #[error("Proxy parameter encodes invalid base64")]
    InvalidBase64(#[from] crypto::base64::DecodeError),
    #[error("Invalid or missing one of client cert and/or key headers")]
    InvalidClientCertHeader,
    #[error("Client identity pem cert/key error: {0}")]
    ClientIdentityCertificate(reqwest::Error),
    #[error("Bad pin server certificate: {0}")]
    ServerPinCertificate(reqwest::Error),
    #[error("Invalid client certificate")]
    InvalidClientCertificate,
    #[error("Invalid client certificate key")]
    InvalidClientCertificateKey,
    #[error("Forward reqwest error")]
    RequestError(#[from] reqwest::Error),
    #[error("Target json path not found: {0}")]
    TargetJsonPathNotFound(#[from] jsonpath_lib::JsonPathError),
    #[error("Target json path value not a string or number")]
    TargetJsonPathValueNotAStringOrNumber,
    #[error("Failed to convert to json: {0}")]
    FailedToParseIngressBodyJson(#[from] serde_json::Error),
    #[error("Cannot vault restricted identity data")]
    CannotVaultIdentityDataForPortableVaultViaProxy,
    #[error("Cannot proxy vault documents")]
    IngressDocumentVaultProxyingNotSupported,
    #[error("Invalid PEM file: {0}")]
    PemError(#[from] crypto::pem::PemError),
    #[error("Invalid proxy token: {0}")]
    ProxyTokenError(#[from] ProxyTokenError),
    #[error("Must specifiy footprint user token header for ingress rules")]
    MissingFootprintUserTokenParameter,
    #[error("Proxy configuration is disabled. Please enable it to use it.")]
    ProxyConfigDisabled,
}
