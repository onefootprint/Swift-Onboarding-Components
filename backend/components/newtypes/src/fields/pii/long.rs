use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct PiiLong(pub(super) i64);

impl PiiLong {
    pub fn new(pii: i64) -> Self {
        Self(pii)
    }

    pub fn leak(&self) -> &i64 {
        &self.0
    }
}

impl Debug for PiiLong {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted i64>")
    }
}

/// Like PiiLong, but scrubs the serde::Serialize implementation
#[derive(Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash, derive_more::Deref)]
#[serde(transparent)]
pub struct ScrubbedPiiLong(
    #[serde(serialize_with = "scrubbed_long")]
    #[deref]
    PiiLong,
);

fn scrubbed_long<S>(_v: &PiiLong, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED i64>")
}

impl ScrubbedPiiLong {
    pub fn new(i: PiiLong) -> Self {
        Self(i)
    }
}

impl From<PiiLong> for ScrubbedPiiLong {
    fn from(pii: PiiLong) -> Self {
        Self(pii)
    }
}

impl From<ScrubbedPiiLong> for PiiLong {
    fn from(value: ScrubbedPiiLong) -> Self {
        value.0
    }
}

impl Debug for ScrubbedPiiLong {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f) // debug with PiiLong debug
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Deserialize, Serialize, Debug)]
    pub struct SomeVendorResponse {
        pub itin: ScrubbedPiiLong,
    }

    #[test]
    fn test_scrubbing() {
        let raw = serde_json::json!({
            "itin": 443453
        });
        let deserialized: SomeVendorResponse = serde_json::from_value(raw).unwrap();

        assert_eq!(
            "SomeVendorResponse { itin: <redacted i64> }",
            format!("{:?}", deserialized)
        );

        let reserialized = serde_json::to_value(&deserialized).unwrap();
        assert_eq!(
            serde_json::json!({
                "itin": "<SCRUBBED i64>"
            }),
            reserialized
        );
    }
}
