use derive_more::{From, Into};

use serde::{Deserialize, Serialize};

#[derive(DieselNewType, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default)]
#[serde(transparent)]
pub struct Fingerprint(pub Vec<u8>);

impl std::fmt::Debug for Fingerprint {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("Fingerprint({})", crypto::hex::encode(&self.0)).fmt(f)
    }
}

impl AsRef<[u8]> for Fingerprint {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}
