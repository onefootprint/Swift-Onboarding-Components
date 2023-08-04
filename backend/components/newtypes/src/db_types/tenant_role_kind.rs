use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum_macros::{AsRefStr, Display, EnumDiscriminants, EnumString};

#[derive(Debug, Clone, Copy, PartialEq, Eq, EnumDiscriminants)]
#[strum_discriminants(derive(
    Display,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    AsRefStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    JsonSchema,
))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(name(TenantRoleKindDiscriminant))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(diesel(sql_type = Text))]
pub enum TenantRoleKind {
    ApiKey { is_live: bool },
    DashboardUser,
}

crate::util::impl_enum_str_diesel!(TenantRoleKindDiscriminant);
