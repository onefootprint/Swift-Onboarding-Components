use crate::data_identifier::ValidationError;
use regex::Regex;
use std::str::FromStr;

lazy_static! {
    pub static ref ALIAS_CHARS: Regex = Regex::new(r"^([A-Za-z0-9\-_]+)$").unwrap();
    pub static ref ALIAS_CHARS_W_DOT: Regex = Regex::new(r"^([A-Za-z0-9\-_\.]+)$").unwrap();
}

#[doc = "Key for a piece of custom data"]
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    derive_more::Display,
    derive_more::From,
    derive_more::Into,
    serde::Serialize,
    Default,
    DieselNewType,
    derive_more::Deref,
    // This is the unique part - use FromStr to validate the alias
    serde_with::DeserializeFromStr,
)]
#[serde(transparent)]
pub struct KvDataKey(pub(in crate::id) String);

impl FromStr for KvDataKey {
    type Err = ValidationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            return Err(ValidationError::InvalidLength);
        }
        if !ALIAS_CHARS_W_DOT.is_match(s) {
            return Err(ValidationError::InvalidCharacter);
        }
        Ok(Self(s.to_string()))
    }
}

impl paperclip::v2::schema::TypedData for KvDataKey {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}

impl KvDataKey {
    pub fn test_data(v: String) -> Self {
        Self(v)
    }

    #[allow(unused)]
    #[cfg(test)]
    pub(crate) fn escape_hatch(v: String) -> Self {
        Self(v)
    }
}

#[doc = "Alias for a piece of custom data"]
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    derive_more::Display,
    derive_more::From,
    derive_more::Into,
    serde::Serialize,
    Default,
    DieselNewType,
    derive_more::Deref,
    // This is the unique part - use FromStr to validate the alias
    serde_with::DeserializeFromStr,
)]
#[serde(transparent)]
pub struct AliasId(pub(in crate::id) String);

impl FromStr for AliasId {
    type Err = ValidationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            return Err(ValidationError::InvalidLength);
        }
        if !ALIAS_CHARS.is_match(s) {
            return Err(ValidationError::InvalidCharacter);
        }
        Ok(Self(s.to_string()))
    }
}

impl AliasId {
    pub fn random() -> Self {
        Self(crypto::random::gen_random_alphanumeric_code(10))
    }
}

impl paperclip::v2::schema::TypedData for AliasId {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}

#[cfg(test)]
mod test {
    use std::str::FromStr;

    use test_case::test_case;

    use crate::{AliasId, KvDataKey};

    #[test_case("hayes" => true)]
    #[test_case("hayes.valley" => false)]
    #[test_case("hayes_valley1" => true)]
    #[test_case("hayes-valley2" => true)]
    #[test_case("Hayes_Valley_3" => true)]
    #[test_case("hayes valley4" => false)]
    #[test_case("hayes!" => false)]
    fn test_parse(input: &str) -> bool {
        // Test serde deserialize, which should use the FromStr implementation
        let result = serde_json::from_str::<AliasId>(&format!("\"{}\"", input));
        result.is_ok()
    }

    #[test]
    fn test_parse_kv_data() {
        // Test serde deserialize, which should use the FromStr implementation
        let result = serde_json::from_str::<KvDataKey>("\"hayes.valley\"");
        assert!(result.is_ok());
    }

    #[test]
    fn test_random_alias() {
        let alias = AliasId::random();
        let parsed = AliasId::from_str(&alias.to_string()).unwrap();
        assert_eq!(alias, parsed);
    }
}
