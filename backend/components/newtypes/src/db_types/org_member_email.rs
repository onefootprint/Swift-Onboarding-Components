use crate::email::Email;
use diesel::backend::Backend;
use diesel::deserialize::FromSql;
use diesel::deserialize::FromSqlRow;
use diesel::expression::AsExpression;
use diesel::serialize::ToSql;
use diesel::sql_types::Text;
use paperclip::v2::schema::TypedData;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use std::str::FromStr;

// TODO just use Email
#[derive(
    Debug,
    Clone,
    DeserializeFromStr,
    SerializeDisplay,
    Default,
    Eq,
    PartialEq,
    macros::SerdeAttr,
    AsExpression,
    FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Text)]
pub struct OrgMemberEmail(pub String);

impl OrgMemberEmail {
    pub const INTEGRATION_TEST_RO_USER_EMAIL: &'static str = "integrationtests_ro@onefootprint.com";
    /// The email address of the TenantUser that is used in integration tests.
    /// This tenant user has is_firm_employee set, which is slightly dangerous. So, we use
    /// this hardcoded email address to also gate permissions in some places.
    /// DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING.
    pub const INTEGRATION_TEST_USER_EMAIL: &'static str = "integrationtests@onefootprint.com";

    pub fn is_integration_test_email(&self) -> bool {
        let email = self.0.to_lowercase();

        email == Self::INTEGRATION_TEST_RO_USER_EMAIL.to_lowercase()
            || email == Self::INTEGRATION_TEST_USER_EMAIL.to_lowercase()
    }
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

impl<DB> ToSql<Text, DB> for OrgMemberEmail
where
    DB: Backend,
    String: ToSql<Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<Text, DB> for OrgMemberEmail
where
    DB: Backend,
    String: FromSql<Text, DB>,
{
    fn from_sql(bytes: diesel::backend::RawValue<'_, DB>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from_str(&String::from_sql(bytes)?)?)
    }
}
