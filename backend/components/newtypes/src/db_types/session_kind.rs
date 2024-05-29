use crate::util::impl_enum_str_diesel;
use derive_more::Display;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde_json;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum_macros::{
    AsRefStr,
    EnumString,
};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    SerializeDisplay,
    DeserializeFromStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum SessionKind {
    // Managed by JsonSession
    RateLimit,
    Handoff,
    // All of the below managed by AuthSession
    WorkOs,
    TenantRb,
    FirmEmployee,
    ClientTenant,
    User,
    EmailVerify,
    ValidateUserToken,
    OnboardingSession,
    BusinessOwner,
    SdkArgs,
}

impl_enum_str_diesel!(SessionKind);

pub trait HasSessionKind {
    fn session_kind(&self) -> SessionKind;
}
