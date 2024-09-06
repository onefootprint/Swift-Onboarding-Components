use std::collections::HashSet;
use std::str::FromStr;

/// User-defined sandbox ID for a vault
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
pub struct SandboxId(pub(in crate::id) String);

impl FromStr for SandboxId {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // "sandbox suffix" must match [a-zA-Z0-9_]+
        let allowed_characters = HashSet::<char>::from_iter(['_']);
        if s.is_empty()
            || !s
                .chars()
                .all(|x| x.is_alphanumeric() || allowed_characters.contains(&x))
        {
            return Err(crate::Error::InvalidSandboxId);
        }
        Ok(Self(s.to_string()))
    }
}

impl<DB> diesel::serialize::ToSql<diesel::sql_types::Text, DB> for SandboxId
where
    DB: diesel::backend::Backend,
    String: diesel::serialize::ToSql<diesel::sql_types::Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> diesel::deserialize::FromSql<diesel::sql_types::Text, DB> for SandboxId
where
    DB: diesel::backend::Backend,
    String: diesel::deserialize::FromSql<diesel::sql_types::Text, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
        let value_str = <String>::from_sql(bytes)?;
        Ok(Self(value_str))
    }
}

impl paperclip::v2::schema::TypedData for SandboxId {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}

impl SandboxId {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self(crypto::random::gen_random_alphanumeric_code(10))
    }
}
