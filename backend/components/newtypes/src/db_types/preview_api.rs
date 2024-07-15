use crate::util::impl_enum_string_diesel;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::IntoEnumIterator;
use strum_macros::Display;
use strum_macros::EnumIter;

#[derive(
    Eq,
    PartialEq,
    Debug,
    Clone,
    AsExpression,
    FromSqlRow,
    SerializeDisplay,
    DeserializeFromStr,
    Display,
    EnumIter,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum PreviewApi {
    MatchSignalsList,
    LivenessList,
    AuthEventsList,
    /// Only findigs uses this, we really don't want anyone else to be using it.
    DocumentsList,
    /// We have a mixed stance on this. Generally we don't want tenants to be doing their own
    /// analysis on risk signals since this should be the job of the rules engine
    RiskSignalsList,
    OnboardingSessionToken,
    VaultIntegrity,
    ReonboardUser,
    CreateUserDecision,
    CreateUserToken,
    Labels,
    Tags,
    CreateBusinessOwner,
    ListBusinessOwners,
    VaultProxy,
    VaultProxyJit,
    OnboardingsList,
    DecisionsList,
    /// When enabled, sends the legacy footprint.onboarding.status_changed webhook
    LegacyOnboardingStatusWebhook,
    LegacyListUsersBusinesses,
    /// Support implicit auth when making a token in the `POST /users/<>/token` API
    ImplicitAuth,
    /// A catch-all variant here since we'll be scarily manually writing these values in a DB shell
    Other(String),
}

impl_enum_string_diesel!(PreviewApi);

// Manually implement conversions from string so we can have a save catch-all
impl ::core::str::FromStr for PreviewApi {
    type Err = ::strum::ParseError;

    fn from_str(s: &str) -> ::core::result::Result<PreviewApi, <Self as ::core::str::FromStr>::Err> {
        if let Some(v) = Self::iter().find(|v| v.to_string() == s) {
            Ok(v)
        } else {
            tracing::error!(value = s, "Encountered unknown PreviewApi variant");
            Ok(Self::Other(s.to_string()))
        }
    }
}

impl ::core::convert::TryFrom<&str> for PreviewApi {
    type Error = ::strum::ParseError;

    fn try_from(
        s: &str,
    ) -> ::core::result::Result<PreviewApi, <Self as ::core::convert::TryFrom<&str>>::Error> {
        ::core::str::FromStr::from_str(s)
    }
}
