use crate::util::impl_enum_string_diesel;
use crate::AuthEventKind;
use crate::ChallengeKind;
use crate::DataIdentifier;
use crate::Error;
use crate::IdentityDataKind;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use strum::IntoEnumIterator;
use strum_macros::Display;

#[derive(
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    Apiv2Schema,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    strum_macros::Display,
    strum_macros::EnumString,
    macros::SerdeAttr,
    AsExpression,
    FromSqlRow,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AuthMethodKind {
    Phone,
    Passkey,
    Email,
}

impl_enum_string_diesel!(AuthMethodKind);

impl TryFrom<AuthEventKind> for AuthMethodKind {
    type Error = Error;

    fn try_from(value: AuthEventKind) -> Result<Self, Self::Error> {
        let value = match value {
            AuthEventKind::Email => Self::Email,
            AuthEventKind::Passkey => Self::Passkey,
            AuthEventKind::Sms => Self::Phone,
            AuthEventKind::SmsLink => Self::Phone,
            AuthEventKind::ThirdParty => {
                return Err(Error::Custom(
                    "Third party auth event kind does not correspond to an auth method".to_owned(),
                ))
            }
        };
        Ok(value)
    }
}

#[derive(Debug, Clone, Copy, Apiv2Schema, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActionKind {
    /// Replace the existing auth method.
    Replace,
    /// Add the provided auth method, where an auth method of this kind doesn't already exist.
    /// Adding a secondary credential will be a different operation kind.
    AddPrimary,
}

#[derive(Debug, Display, Clone, Copy, Eq, PartialEq, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum ContactInfoKind {
    Phone,
    Email,
}

impl AuthMethodKind {
    pub fn supported_challenge_kinds(&self, support_sms_link: bool) -> Vec<ChallengeKind> {
        ChallengeKind::iter()
            .filter(|ck| ck != &ChallengeKind::SmsLink || support_sms_link)
            .filter(|ck| Self::from(*ck) == *self)
            .collect()
    }
}

impl From<ChallengeKind> for AuthMethodKind {
    fn from(value: ChallengeKind) -> Self {
        match value {
            ChallengeKind::Email => Self::Email,
            ChallengeKind::Sms => Self::Phone,
            ChallengeKind::SmsLink => Self::Phone,
            ChallengeKind::Passkey => Self::Passkey,
        }
    }
}

impl From<ContactInfoKind> for AuthMethodKind {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Email => AuthMethodKind::Email,
            ContactInfoKind::Phone => AuthMethodKind::Phone,
        }
    }
}

impl ContactInfoKind {
    pub fn verified_di(&self) -> DataIdentifier {
        match self {
            Self::Phone => IdentityDataKind::VerifiedPhoneNumber.into(),
            Self::Email => IdentityDataKind::VerifiedEmail.into(),
        }
    }

    pub fn di(&self) -> DataIdentifier {
        match self {
            Self::Phone => IdentityDataKind::PhoneNumber.into(),
            Self::Email => IdentityDataKind::Email.into(),
        }
    }
}
