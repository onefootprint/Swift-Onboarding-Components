use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug,
    Eq,
    PartialEq,
    Display,
    Hash,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    serde_with::SerializeDisplay,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WorkflowSource {
    /// Created via a hosted flow by the user
    Hosted,
    /// Vaulted via tenant-facing `POST /kyc` or `POST /kyb` API
    Tenant,
    /// Just for events that aren't backfilled
    Unknown,
    /// Footprint initiated workflow (like Scheduled watchlist checks)
    Footprint,
}

crate::util::impl_enum_string_diesel!(WorkflowSource);
