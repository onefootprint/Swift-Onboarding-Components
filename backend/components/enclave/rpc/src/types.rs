use serde::{
    Deserialize,
    Serialize,
};
use std::fmt::Debug;
use strum_macros::EnumDiscriminants;

#[derive(Clone, Serialize, Deserialize)]
pub struct KmsCredentials {
    pub region: String,
    pub key_id: String,
    pub secret_key: String,
    pub session_token: Option<String>,
}
impl Debug for KmsCredentials {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("KmsCredentials")
            .field("region", &self.region)
            .field("key_id", &self.key_id)
            .field("secret_key", &"<omitted>")
            .field("session_token", &"<omitted>")
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize, EnumDiscriminants, PartialEq, Hash, Eq, Default)]
#[strum_discriminants(name(DataTransformName))]
#[strum_discriminants(derive(strum_macros::Display, strum::EnumString, Hash))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "type")]
pub enum DataTransform {
    #[default]
    /// no transform, just the plain data
    Identity,
    /// HMAC-SHA256
    HmacSha256 {
        // TODO we should have a pii type for this
        key: Vec<u8>,
    },
    /// asymmetric encryption
    Encrypt {
        algorithm: EncryptTransformAlgorithm,
        /// DER-encoded public-key
        public_key_der: Vec<u8>,
    },
    ToLowercase,
    ToUppercase,
    ToAscii,
    Prefix {
        count: usize,
    },
    Suffix {
        count: usize,
    },
    Replace {
        from: String,
        to: String,
    },
    DateFormat {
        from_format: String,
        to_format: String,
    },
}

impl std::fmt::Debug for DataTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        DataTransformName::from(self).fmt(f)
    }
}

impl std::fmt::Display for DataTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Since the transforms may have some sensitive information (ie secret keys), just show
        // the name of the transform, none of the args
        std::fmt::Display::fmt(&DataTransformName::from(self), f)
    }
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Hash, Eq)]
pub enum EncryptTransformAlgorithm {
    // Provide explicit serializations here - it's easy for this to drift from the strum
    // serializations used in the API crate
    #[serde(rename = "rsa_pksc1v15")]
    /// WARNING: the serialization here is DIFFERENT from the name of the enum.
    /// An old version of code had the serialization incorrect, so we're keeping it until we want
    /// to migrate.
    RsaPkcs1v15,
    #[serde(rename = "ecies_p256_x963_sha256_aes_gcm")]
    EciesP256X963Sha256AesGcm,
}
