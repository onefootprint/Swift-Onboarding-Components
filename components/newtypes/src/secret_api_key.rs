use std::fmt::Debug;

pub use derive_more::{From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::{Fingerprint, Fingerprinter, SealedVaultBytes, VaultPublicKey};

/// A secret api key wrapper around a string
#[derive(Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(transparent)]
pub struct SecretApiKey(String);

impl SecretApiKey {
    /// prefixed on LIVE keys
    pub const LIVE_PREFIX: &'static str = "sk_live";

    /// prefix on sandbox keys
    pub const SANDBOX_PREFIX: &'static str = "sk_test";

    const LENGTH: usize = 34;

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
    pub async fn fingerprint<F: Fingerprinter>(&self, f: &F) -> Result<Fingerprint, F::Error> {
        f.sign_data(self.0.as_bytes()).await
    }
}
impl Debug for SecretApiKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let debug1 = self
            .0
            .chars()
            .take(Self::LIVE_PREFIX.len() + 3)
            .collect::<String>();

        let debug2 = self
            .0
            .chars()
            .skip(Self::LIVE_PREFIX.len() + Self::LENGTH - 1)
            .collect::<String>();

        f.write_str(&format!("{}...{}", debug1, debug2))
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
        assert_eq!(debug.as_str(), "sk_live_te...67");
    }
}
