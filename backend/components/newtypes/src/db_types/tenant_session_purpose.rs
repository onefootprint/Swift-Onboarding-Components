use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    EnumString, Display, serde_with::SerializeDisplay, serde_with::DeserializeFromStr, Debug, Clone, Copy,
)]
#[strum(serialize_all = "snake_case")]
pub enum TenantSessionPurpose {
    Dashboard,
    Docs,
}
