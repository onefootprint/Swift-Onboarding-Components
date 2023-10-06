use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, EnumIter};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Hash,
    Copy,
    Clone,
    strum_macros::EnumString,
    strum_macros::Display,
    SerializeDisplay,
    DeserializeFromStr,
    Apiv2Schema,
    AsRefStr,
    AsExpression,
    FromSqlRow,
    EnumIter,
    JsonSchema,
    Ord,
    PartialOrd,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentSide {
    Front,
    Back,
    Selfie,
}

crate::util::impl_enum_str_diesel!(DocumentSide);

#[cfg(test)]
mod test {
    use std::cmp::Ordering;

    use crate::DocumentSide;

    #[test]
    fn test_ord() {
        assert!(DocumentSide::Front.cmp(&DocumentSide::Back) == Ordering::Less);
        assert!(DocumentSide::Back.cmp(&DocumentSide::Selfie) == Ordering::Less);
    }
}
