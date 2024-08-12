use crate::Fingerprint;
use crate::PiiString;
use crate::SealedVaultBytes;
use crate::VaultPublicKey;
use async_trait::async_trait;
use derive_more::From;
use derive_more::Into;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// A secret api key wrapper around a string
#[derive(Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(transparent)]
pub struct SecretApiKey(String);

#[async_trait]
pub trait ApiKeyFingerprinter {
    type Error: From<crate::Error>;

    async fn sign_raw_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error>;
}

impl SecretApiKey {
    const LENGTH: usize = 37;
    /// prefixed on LIVE keys
    pub const LIVE_PREFIX: &'static str = "sk_live";
    const NUM_SCRUBBED_CHARS: usize = 3;
    /// prefix on sandbox keys
    pub const SANDBOX_PREFIX: &'static str = "sk_test";

    /// generate a random new secret api key
    pub fn generate(is_live: bool) -> Self {
        let prefix = if is_live {
            Self::LIVE_PREFIX
        } else {
            Self::SANDBOX_PREFIX
        };

        let api_key = format!(
            "{}_{}",
            prefix,
            crypto::random::gen_random_alphanumeric_code(Self::LENGTH)
        );

        Self(api_key)
    }

    /// create a vault sealed secret key
    pub fn seal_to(&self, public_key: &VaultPublicKey) -> Result<SealedVaultBytes, crypto::Error> {
        public_key.seal_data(self.0.as_str())
    }

    /// create fingerprint of the api key
    pub async fn fingerprint<F: ApiKeyFingerprinter>(&self, f: &F) -> Result<Fingerprint, F::Error> {
        f.sign_raw_data(self.0.as_bytes()).await
    }

    /// Determines if an ob config public key may have been accidentally provided as the secret key
    pub fn is_maybe_ob_config_key(&self) -> bool {
        self.0.starts_with("ob_")
    }

    pub fn scrub(&self) -> PiiString {
        let prefix = if self.0.starts_with(Self::LIVE_PREFIX) {
            format!("{}_", Self::LIVE_PREFIX)
        } else if self.0.starts_with(Self::SANDBOX_PREFIX) {
            format!("{}_", Self::SANDBOX_PREFIX)
        } else {
            "".to_string()
        };
        let suffix = &self.0[(self.0.len() - Self::NUM_SCRUBBED_CHARS)..];
        let scrubbed_key = format!("{}{}{}", prefix, "*".repeat(8), suffix);
        PiiString::from(scrubbed_key)
    }
}

impl From<PiiString> for SecretApiKey {
    fn from(value: PiiString) -> Self {
        Self::from(value.leak().to_string())
    }
}

impl Debug for SecretApiKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.scrub().leak())
    }
}

#[cfg(test)]
mod tests {

    use super::SecretApiKey;

    #[derive(Debug, serde::Serialize, serde::Deserialize)]
    struct Test {
        key: SecretApiKey,
    }

    #[test]
    fn test() {
        let key = SecretApiKey::generate(true);
        assert!(key.0.starts_with(SecretApiKey::LIVE_PREFIX));
        assert_eq!(
            key.0.len(),
            SecretApiKey::LIVE_PREFIX.len() + SecretApiKey::LENGTH + 1
        );

        let test = Test { key };
        let test_json = serde_json::to_string(&test).expect("Json");

        assert!(test_json.contains(test.key.0.as_str()));

        let fake_key = "sk_live_testkey123456789012345678901234567";
        let json = serde_json::json!({ "key": fake_key });

        let test: Test = serde_json::from_value(json).expect("failed to decode");

        assert_eq!(test.key.0.as_str(), fake_key);

        let debug = format!("{:?}", test.key);

        assert!(!debug.contains(fake_key));
        assert_eq!(debug.as_str(), "sk_live_********567");
    }
}
