use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct PiiInt(pub(super) i32);

impl PiiInt {
    pub fn new(pii: i32) -> Self {
        Self(pii)
    }

    pub fn leak(&self) -> &i32 {
        &self.0
    }
}

impl Debug for PiiInt {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted i32>")
    }
}

/// Like PiiInt, but scrubs the serde::Serialize implementation
#[derive(Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash, derive_more::Deref)]
#[serde(transparent)]
pub struct ScrubbedPiiInt(
    #[serde(serialize_with = "scrubbed_int")]
    #[deref]
    PiiInt,
);

fn scrubbed_int<S>(_v: &PiiInt, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED i32>")
}

impl ScrubbedPiiInt {
    pub fn new(i: PiiInt) -> Self {
        Self(i)
    }
}

impl From<PiiInt> for ScrubbedPiiInt {
    fn from(pii: PiiInt) -> Self {
        Self(pii)
    }
}

impl From<ScrubbedPiiInt> for PiiInt {
    fn from(value: ScrubbedPiiInt) -> Self {
        value.0
    }
}

impl Debug for ScrubbedPiiInt {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f) // debug with PiiInt debug
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Deserialize, Serialize, Debug)]
    pub struct SomeVendorResponse {
        pub ssn: ScrubbedPiiInt,
    }

    #[test]
    fn test_scrubbing() {
        let raw = serde_json::json!({
            "ssn": 84837
        });
        let deserialized: SomeVendorResponse = serde_json::from_value(raw).unwrap();

        assert_eq!(
            "SomeVendorResponse { ssn: <redacted i32> }",
            format!("{:?}", deserialized)
        );

        let reserialized = serde_json::to_value(&deserialized).unwrap();
        assert_eq!(
            serde_json::json!({
                "ssn": "<SCRUBBED i32>"
            }),
            reserialized
        );
    }
}
