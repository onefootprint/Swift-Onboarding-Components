use crate::util::impl_enum_string_diesel;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{Display, EnumString};

#[derive(
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    Display,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WorkosAuthMethod {
    GoogleOauth,
    MagicLink,
    // NOTE: be careful adding new auth methods here. Right now, we use WorkOs to just tell us the
    // authed email address and provider. But, not every auth provider enforces that the email
    // address is owned by the user authing. Chat with Elliott before adding new WorkosAuth types
    // https://linear.app/footprint/issue/FP-5298/revisit-workos-integration
}

impl_enum_string_diesel!(WorkosAuthMethod);
