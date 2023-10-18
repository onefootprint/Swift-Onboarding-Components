use crate::util::impl_enum_str_diesel;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;

use serde::{Deserialize, Serialize};
use serde_json;
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Eq,
    PartialEq,
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
pub enum LivenessSource {
    Skipped,
    WebauthnAttestation,
    PrivacyPass,
    AppleDeviceAttestation,
    GoogleDeviceAttestation,
}

impl Default for LivenessSource {
    fn default() -> Self {
        Self::Skipped
    }
}

impl_enum_str_diesel!(LivenessSource);

#[derive(Eq, PartialEq, Serialize, Deserialize, Debug, Clone, Apiv2Schema, Default, AsJsonb)]
pub struct LivenessAttributes {
    pub issuers: Vec<LivenessIssuer>,
    pub device: Option<String>,
    pub os: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Eq, PartialEq, Serialize, Deserialize, Debug, Clone, Apiv2Schema, EnumString, AsRefStr)]
#[serde(rename_all = "snake_case")]
pub enum LivenessIssuer {
    Apple,
    Google,
    Cloudflare,
    Footprint,
}
