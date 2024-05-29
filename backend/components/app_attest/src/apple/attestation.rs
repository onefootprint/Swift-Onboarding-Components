use super::{
    AppleAppAttestationVerifier,
    Config,
};
use crate::error::AttestationError;
use byteorder::ByteOrder;
use der_parser::der::*;
use der_parser::error::BerError;
use openssl::bn::BigNumContext;
use openssl::ec::PointConversionForm;
use openssl::pkey::Id;
use openssl::sha::sha256;
use openssl::x509::X509;
use serde::{
    Deserialize,
    Serialize,
};
use serde_bytes::ByteBuf;
use x509_parser::oid_registry::Oid;
use x509_parser::{
    der_parser,
    nom,
};

impl AppleAppAttestationVerifier {
    /// Attests an Apple App attestation
    pub fn attest(
        &self,
        client_data: &[u8],
        app_attestation: &[u8],
    ) -> Result<VerifiedAppAttestation, AttestationError> {
        apple_app_attest(client_data, app_attestation, &self.config)
    }
}

/// Attests an Apple App attestation
pub(super) fn apple_app_attest(
    client_data: &[u8],
    app_attestation: &[u8],
    config: &Config,
) -> Result<VerifiedAppAttestation, AttestationError> {
    let client_data_hash = sha256(client_data);
    verify_attestation(app_attestation, client_data_hash, config)
}

#[derive(Debug, Serialize, Deserialize)]
struct Attestation {
    #[serde(rename = "fmt")]
    format: Format,
    #[serde(rename = "attStmt")]
    statement: Statement,
    #[serde(rename = "authData")]
    auth_data: ByteBuf,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
enum Format {
    #[serde(rename = "apple-appattest")]
    App,
    #[serde(rename = "apple")]
    Webauthn,
}

#[derive(Debug, Serialize, Deserialize)]
struct Statement {
    #[serde(rename = "x5c")]
    certificates: Vec<ByteBuf>,
    receipt: ByteBuf,
}

#[derive(Debug)]
struct AuthData {
    rp_id_hash: Vec<u8>,
    counter: i32,
    aaguid: AppleAaguid,
    credential_id: Vec<u8>,
}

#[derive(Debug, Clone)]
pub enum AppleAaguid {
    Development,
    Production,
    Zeroes,
    Unknown([u8; 16]),
}

impl AppleAaguid {
    const DEV: &'static [u8; 16] = b"appattestdevelop";
    const PROD: [u8; 16] = [
        0x61, 0x70, 0x70, 0x61, 0x74, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ];
    const ZERO: [u8; 16] = [
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ];

    pub fn parse(bytes: &[u8]) -> Result<Self, AttestationError> {
        if bytes.len() != 16 {
            return Err(AttestationError::BadAuthenticatorData);
        }

        let mut incoming: [u8; 16] = Default::default();
        incoming.copy_from_slice(&bytes[0..16]);

        let res = match &incoming {
            Self::DEV => Self::Development,
            &Self::PROD => Self::Production,
            &Self::ZERO => Self::Zeroes,
            _ => Self::Unknown(incoming),
        };

        Ok(res)
    }
}

impl AuthData {
    pub fn parse(data: &[u8]) -> Result<Self, AttestationError> {
        if data.len() < 87 {
            return Err(AttestationError::BadAuthenticatorData);
        }

        Ok(Self {
            rp_id_hash: data[0..32].to_vec(),
            counter: byteorder::BigEndian::read_i32(&data[33..37]),
            aaguid: AppleAaguid::parse(&data[37..53])?,
            credential_id: data[55..87].to_vec(),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifiedAppAttestation {
    pub is_development: bool,
    pub receipt: Vec<u8>,
    pub att_public_key: Vec<u8>,
    pub att_key_id: Vec<u8>,
}

impl Config {
    fn is_cert_trusted(&self, presented: &X509) -> Result<bool, AttestationError> {
        for root in &self.root_ca_list {
            if presented.verify(root.public_key()?.as_ref())? {
                return Ok(true);
            }
        }

        Ok(false)
    }
}

/// main verification code path
fn verify_attestation(
    attestation_data: &[u8],
    client_data_hash: [u8; 32],
    config: &Config,
) -> Result<VerifiedAppAttestation, AttestationError> {
    let attest: Attestation = serde_cbor::from_slice(attestation_data)?;

    if attest.format != Format::App {
        return Err(AttestationError::InvalidAttestationFormat);
    }

    let mut certs = attest.statement.certificates.iter();
    let cred_cert = certs.next().ok_or(AttestationError::MissingCertificates)?;
    let cred_cert = X509::from_der(cred_cert.as_ref())?;

    let ca_cert = certs.next().ok_or(AttestationError::MissingCertificates)?;
    let ca_cert = X509::from_der(ca_cert.as_ref())?;

    // 1. ensure the ca cert is trusted by one of our roots
    if !config.is_cert_trusted(&ca_cert)? {
        return Err(AttestationError::UntrustedIntermediateCa);
    }

    // 2. verify the cred cert with the trusted root ca
    if !cred_cert.verify(ca_cert.public_key()?.as_ref())? {
        return Err(AttestationError::CredentialCertificateVerificationFailed);
    }

    // 3/4. Verify nonce (extension with OID 1.2.840.113635.100.8.2)
    // sha256( authData || clientDataHash)
    let expected_nonce = sha256(&[attest.auth_data.as_ref(), client_data_hash.as_ref()].concat());

    let found_nonce = parse_apple_anonymous_nonce(&cred_cert)?;
    if expected_nonce != found_nonce {
        return Err(AttestationError::NonceMismatch);
    }

    // 5. Create the SHA256 hash of the public key in credCert
    let cred_pub_key = cred_cert.public_key()?;
    let cred_pub_key = match cred_pub_key.id() {
        Id::RSA => cred_pub_key.rsa()?.public_key_to_der_pkcs1()?,
        Id::ED448 | Id::ED25519 | Id::EC => {
            let ec_key = cred_pub_key.ec_key()?;
            let mut ctxt = BigNumContext::new()?;
            ec_key
                .public_key()
                .to_bytes(ec_key.group(), PointConversionForm::UNCOMPRESSED, &mut ctxt)?
        }
        _ => return Err(AttestationError::UnsupportedPublicKeyType),
    };
    let credential_pub_key_hash = openssl::sha::sha256(&cred_pub_key).to_vec();

    let auth_data = AuthData::parse(&attest.auth_data)?;

    // 6. ensure authenticator data’s RP ID hash is in the allowed set
    if !config
        .allowed_app_bundle_ids
        .iter()
        .map(|id| sha256(id.as_bytes()).to_vec())
        .any(|x| x == auth_data.rp_id_hash)
    {
        return Err(AttestationError::RpIdMismatch);
    }

    // 7. Verify that the authenticator data’s counter field equals 0.
    if auth_data.counter != 0 {
        return Err(AttestationError::InvalidCounterValue);
    }

    // 8. Verify that the authenticator data’s aaguid
    let is_development = match auth_data.aaguid {
        AppleAaguid::Production => false,
        AppleAaguid::Development => true,
        AppleAaguid::Unknown(_) | AppleAaguid::Zeroes => return Err(AttestationError::UnexpectedAaguid),
    };

    // 9. Verify that the authenticator data’s credentialId field is the same as the key identifier.
    if auth_data.credential_id != credential_pub_key_hash {
        return Err(AttestationError::CredentialAuthenticatorDataMismatch);
    }

    Ok(VerifiedAppAttestation {
        is_development,
        att_public_key: cred_pub_key,
        att_key_id: auth_data.credential_id,
        receipt: attest.statement.receipt.into_vec(),
    })
}

/// Extract the Apple attestation nonce from certificate extension bytes
/// adapted from https://github.com/kanidm/webauthn-rs/blob/6f8ca8c7e133ed17fdf709579056acf1bcf5afdd/webauthn-rs-core/src/attestation.rs#L277
fn parse_apple_anonymous_nonce(cert: &X509) -> Result<[u8; 32], AttestationError> {
    const OID: Oid<'static> = der_parser::oid!(1.2.840 .113635 .100 .8 .2);

    let parse_nonce = |i: &[u8]| -> Result<[u8; 32], AttestationError> {
        let (_, nonce) = parse_der_container(|i: &[u8], hdr: Header| {
            if hdr.tag() != Tag::Sequence {
                return Err(nom::Err::Error(BerError::BerTypeError));
            }
            let (i, tagged_nonce) = parse_der_tagged_explicit(1, parse_der_octetstring)(i)?;
            let (class, _tag, nonce) = tagged_nonce.as_tagged()?;
            if class != Class::ContextSpecific {
                return Err(nom::Err::Error(BerError::BerTypeError));
            }
            let nonce = nonce
                .as_slice()?
                .try_into()
                .map_err(|_| der_parser::error::BerError::InvalidLength)?;
            Ok((i, nonce))
        })(i)?;
        Ok(nonce)
    };

    let der_bytes = cert.to_der()?;
    let nonce = x509_parser::parse_x509_certificate(&der_bytes)
        .map_err(|_| AttestationError::AttestationStatementX5CInvalid)?
        .1
        .extensions()
        .iter()
        .find_map(|extension| {
            (extension.oid == OID).then(|| {
                parse_nonce(extension.value).map_err(|_| AttestationError::AttestationStatementX5CInvalid)
            })
        })
        .ok_or(AttestationError::AttestationNonceMissing)??;

    Ok(nonce)
}
