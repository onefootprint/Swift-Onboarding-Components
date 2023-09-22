use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use schemars::JsonSchema;
use strum_macros::{AsRefStr, Display, EnumString};

#[derive(
    Debug, Clone, Display, Copy, AsExpression, FromSqlRow, EnumString, AsRefStr, PartialEq, JsonSchema, Eq,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum VaultDataFormat {
    /// Plaintext string
    String,
    /// JSON-serialized string
    Json,
}

crate::util::impl_enum_str_diesel!(VaultDataFormat);
