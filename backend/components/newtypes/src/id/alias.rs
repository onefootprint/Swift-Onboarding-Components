use crate::data_identifier::DiValidationError;
use diesel::backend::Backend;
use diesel::deserialize::{
    FromSql,
    FromSqlRow,
};
use diesel::expression::AsExpression;
use diesel::serialize::ToSql;
use diesel::sql_types::Text;
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
    derive_more::Deref,
    // This is the unique part - use FromStr to validate the alias
    serde_with::DeserializeFromStr,
    AsExpression,
    FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Text)]
pub struct KvDataKey(pub(in crate::id) String);

impl FromStr for KvDataKey {
    type Err = DiValidationError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            return Err(DiValidationError::InvalidLength);
        }
        if !ALIAS_CHARS_W_DOT.is_match(s) {
            return Err(DiValidationError::InvalidCharacter);
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

impl<DB> ToSql<Text, DB> for KvDataKey
where
    DB: Backend,
    String: ToSql<Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<Text, DB> for KvDataKey
where
    DB: Backend,
    String: FromSql<Text, DB>,
{
    fn from_sql(bytes: diesel::backend::RawValue<'_, DB>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(String::from_sql(bytes)?))
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
    derive_more::Deref,
    // This is the unique part - use FromStr to validate the alias
    serde_with::DeserializeFromStr,
    AsExpression,
    FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Text)]
pub struct AliasId(pub(in crate::id) String);

impl FromStr for AliasId {
    type Err = DiValidationError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            return Err(DiValidationError::InvalidLength);
        }
        if !ALIAS_CHARS.is_match(s) {
            return Err(DiValidationError::InvalidCharacter);
        }
        Ok(Self(s.to_string()))
    }
}

impl AliasId {
    pub fn random() -> Self {
        Self(crypto::random::gen_random_alphanumeric_code(10))
    }

    pub fn fixture() -> Self {
        Self("*".to_string())
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

impl<DB> ToSql<Text, DB> for AliasId
where
    DB: Backend,
    String: ToSql<Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<Text, DB> for AliasId
where
    DB: Backend,
    String: FromSql<Text, DB>,
{
    fn from_sql(bytes: diesel::backend::RawValue<'_, DB>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(String::from_sql(bytes)?))
    }
}

#[cfg(test)]
mod test {
    use crate::{
        AliasId,
        KvDataKey,
    };
    use std::str::FromStr;
    use test_case::test_case;

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
