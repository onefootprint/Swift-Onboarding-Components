use paperclip::v2::schema::TypedData;

use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::str::FromStr;

use crate::email::Email;

// TODO just use Email
#[derive(
    Debug,
    Clone,
    DeserializeFromStr,
    SerializeDisplay,
    DieselNewType,
    Default,
    Eq,
    PartialEq,
    macros::SerdeAttr,
)]
#[serde(transparent)]
pub struct OrgMemberEmail(pub String);

impl OrgMemberEmail {
    /// The email address of the TenantUser that is used in integration tests.
    /// This tenant user has is_firm_employee set, which is slightly dangerous. So, we use
    /// this hardcoded email address to also gate permissions in some places.
    /// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING.
    pub const INTEGRATION_TEST_USER_EMAIL: &str = "integrationtests@onefootprint.com";
    pub const INTEGRATION_TEST_RO_USER_EMAIL: &str = "integrationtests_ro@onefootprint.com";
}

impl FromStr for OrgMemberEmail {
    type Err = crate::Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(s.to_owned().to_lowercase()))
    }
}

impl TryFrom<Email> for OrgMemberEmail {
    type Error = crate::Error;
    fn try_from(value: Email) -> Result<Self, Self::Error> {
        Self::from_str(value.leak())
    }
}

impl std::fmt::Display for OrgMemberEmail {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl TypedData for OrgMemberEmail {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }
}
