use thiserror::Error;

#[derive(Debug, Error)]
pub enum AttestationError {
    #[error("CBOR encoding invalid: '{0}'")]
    CborEncoding(#[from] serde_cbor::Error),

    #[error("Attestation format is invalid")]
    InvalidAttestationFormat,

    #[error("One or more certificates are missing from the attestation")]
    MissingCertificates,

    #[error("Presented root certificate is untrusted")]
    UntrustedIntermediateCa,

    #[error("The credential certificate failed to verify")]
    CredentialCertificateVerificationFailed,

    #[error("OpenSSL error: '{0}'")]
    OpenSsl(#[from] openssl::error::ErrorStack),

    #[error("x509 Parsing Error: '{0}'")]
    X509Parsing(String),

    #[error("Missing certificate extension")]
    X509ExtensionMissing,

    #[error("Attestation nonce mismatch")]
    NonceMismatch,

    #[error("Attestation key identifier mismatch")]
    KeyIdentifierMismatch,

    #[error("AuthenticatorData is not valid")]
    BadAuthenticatorData,

    #[error("Relying party id mismatch")]
    RpIdMismatch,

    #[error("Credential mismatch in authenticator data")]
    CredentialAuthenticatorDataMismatch,

    #[error("Counter value is not valid")]
    InvalidCounterValue,

    #[error("unsupported public key type")]
    UnsupportedPublicKeyType,

    #[error("certificate parsing error")]
    DerParser(#[from] x509_parser::nom::Err<x509_parser::der_parser::error::Error>),

    #[error("aaguid is unexpected")]
    UnexpectedAaguid,

    #[error("invalid attestation x5c stmt")]
    AttestationStatementX5CInvalid,

    #[error("missing nonce from attestation")]
    AttestationNonceMissing,
}
