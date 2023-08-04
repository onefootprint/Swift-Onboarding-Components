use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum_macros::{AsRefStr, Display, EnumString};

#[derive(
    Debug,
    Clone,
    Display,
    Copy,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    PartialEq,
    JsonSchema,
    Eq,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum TenantRoleKind {
    ApiKey,
    DashboardUser,
}

crate::util::impl_enum_str_diesel!(TenantRoleKind);
