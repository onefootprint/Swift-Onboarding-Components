use api_errors::FpError;
use api_errors::ValidationError;
use regex::Regex;
use std::str::FromStr;

fn external_id_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"^([A-Za-z0-9\-_\.]+)$").unwrap()
}

lazy_static! {
    pub static ref EXTERNAL_ID_CHARS: Regex = external_id_regex();
}

/// Identifier for a external vault ID referencing footprint ID
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    derive_more::Display,
    serde::Serialize,
    serde_with::DeserializeFromStr,
    diesel::expression::AsExpression,
    diesel::deserialize::FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = diesel::sql_types::Text)]
pub struct ExternalId(pub(in crate::id) String);

impl FromStr for ExternalId {
    type Err = FpError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.len() < 10 || s.len() > 256 {
            return ValidationError("External ID length is invalid. Must be between 10 and 256 characters.")
                .into();
        }
        if !EXTERNAL_ID_CHARS.is_match(s) {
            return ValidationError(
                "External ID is invalid. Must only include alphanumeric characters, -, _, or .",
            )
            .into();
        }
        Ok(Self(s.to_string()))
    }
}

impl<DB> diesel::serialize::ToSql<diesel::sql_types::Text, DB> for ExternalId
where
    DB: diesel::backend::Backend,
    String: diesel::serialize::ToSql<diesel::sql_types::Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> diesel::deserialize::FromSql<diesel::sql_types::Text, DB> for ExternalId
where
    DB: diesel::backend::Backend,
    String: diesel::deserialize::FromSql<diesel::sql_types::Text, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
        let value_str = <String>::from_sql(bytes)?;
        Ok(Self(value_str))
    }
}

impl paperclip::v2::schema::TypedData for ExternalId {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}
