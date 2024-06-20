use crate::util::impl_enum_str_diesel;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    Clone,
    Copy,
    Display,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum TenantKind {
    // A Footprint tenant for vaulting, KYC, etc.
    Tenant,
    // A Compliance Partner of a Tenant.
    PartnerTenant,
}

impl_enum_str_diesel!(TenantKind);
