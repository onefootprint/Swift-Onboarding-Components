pub use derive_more::{Add, Display, From, Into};

use diesel::AsExpression;
use serde::{Deserialize, Serialize};

#[derive(
    AsExpression,
    DieselNewType,
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    From,
    Into,
    Serialize,
    Deserialize,
    Default,
)]
#[serde(transparent)]
pub struct Fingerprint(pub Vec<u8>);

impl AsRef<[u8]> for Fingerprint {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}
