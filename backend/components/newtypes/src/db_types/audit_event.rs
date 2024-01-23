use crate::{util::impl_enum_str_diesel, DataIdentifier};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::AsRefStr;
use strum_macros::{Display, EnumDiscriminants, EnumString};

#[derive(
    Display,
    Debug,
    Clone,
    Eq,
    PartialEq,
    EnumDiscriminants,
    Serialize,
    Deserialize,
    AsJsonb,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[strum_discriminants(
    name(AuditEventName),
    derive(
        Display,
        EnumString,
        AsRefStr,
        DeserializeFromStr,
        SerializeDisplay,
        FromSqlRow,
        AsExpression,
        Apiv2Schema,
        macros::SerdeAttr,
    ),
    vis(pub),
    strum(serialize_all = "snake_case"),
    diesel(sql_type = Text)
)]
pub enum AuditEventMetadata {
    CreateUser {
        is_live: bool,
        fields: Vec<DataIdentifier>,
    },
    UpdateUserData {
        is_live: bool,
        fields: Vec<DataIdentifier>,
    },
    DecryptUserData {
        is_live: bool,
        reason: String,
        fields: Vec<DataIdentifier>,
    },
    CreateUserAnnotation,
    CompleteUserCheckLiveness,
    CompleteUserCheckWatchlist,
    RequestUserData,
    StartUserVerification,
    CompleteUserVerification,
    CollectUserDocument, // TODO: is there a better name for this?
    CreateOrgApiKey,
    DecryptOrgApiKey,
    UpdateOrgApiKey,
    InviteOrgMember,
    UpdateOrgMember,
    LoginOrgMember,
    RemoveOrgMember,
    CreateOrg,
    UpdateOrgSettings,
    CreateOrgRole,
    UpdateOrgRole,
}

impl_enum_str_diesel!(AuditEventName);

#[cfg(test)]
mod tests {
    use crate::IdentityDataKind;

    use super::*;

    #[test]
    fn test_audit_event_metadata() {
        let json_str = r#"{
            "kind": "decrypt_user_data",
            "data": {
                "is_live": true,
                "reason": "an example reason",
                "fields": ["id.phone_number", "id.last_name"]
            }
        }"#;

        let meta: AuditEventMetadata = serde_json::from_str(json_str).unwrap();
        assert_eq!(
            meta,
            AuditEventMetadata::DecryptUserData {
                is_live: true,
                reason: "an example reason".to_owned(),
                fields: vec![
                    DataIdentifier::Id(IdentityDataKind::PhoneNumber),
                    DataIdentifier::Id(IdentityDataKind::LastName),
                ],
            }
        )
    }
}
