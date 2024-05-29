use crate::util::impl_enum_str_diesel;
use crate::{
    PiiString,
    S3Url,
    SealedVaultDataKey,
};
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use serde_json;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum_macros::{
    AsRefStr,
    Display,
    EnumString,
};

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
    macros::SerdeAttr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ComplianceDocReviewDecision {
    Accepted,
    Rejected,
}

impl_enum_str_diesel!(ComplianceDocReviewDecision);

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize, AsJsonb, Apiv2Schema, macros::SerdeAttr)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum ComplianceDocData {
    ExternalUrl {
        url: PiiString,
    },
    SealedUpload {
        filename: String,
        s3_url: S3Url,
        e_data_key: SealedVaultDataKey,
    },
}

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Apiv2Schema,
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    EnumString,
    macros::SerdeAttr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum ComplianceDocStatus {
    NotRequested,
    WaitingForUpload,
    WaitingForReview,
    Accepted,
    Rejected,
}
