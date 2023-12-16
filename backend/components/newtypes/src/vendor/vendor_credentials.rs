use crate::PiiString;

/// credentials for idology
#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct IdologyCredentials {
    pub username: PiiString,
    pub password: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct ExperianCredentialBuilder {
    pub auth_username: PiiString,
    pub auth_password: PiiString,
    pub auth_client_id: PiiString,
    pub auth_client_secret: PiiString,
    pub cross_core_username: PiiString,
    pub cross_core_password: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct IncodeCredentials {
    pub api_key: PiiString,
    pub base_url: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct IncodeCredentialsWithToken {
    pub credentials: IncodeCredentials,
    pub authentication_token: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct MiddeskCredentials {
    pub api_key: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct LexisCredentials {
    pub user_id: PiiString,
    pub password: PiiString,
}

/// The bulk of experian credentials are shared across requests for different tenants
/// All that is different is the subscriber code
impl ExperianCredentialBuilder {
    pub fn build_with_subscriber_code(self, subscriber_code: PiiString) -> ExperianCredentials {
        ExperianCredentials {
            subscriber_code,
            auth_username: self.auth_username,
            auth_password: self.auth_password,
            auth_client_id: self.auth_client_id,
            auth_client_secret: self.auth_client_secret,
            cross_core_username: self.cross_core_username,
            cross_core_password: self.cross_core_password,
        }
    }
}
#[allow(unused)]
/// credentials for experian
#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct ExperianCredentials {
    pub subscriber_code: PiiString,
    pub auth_username: PiiString,
    pub auth_password: PiiString,
    pub auth_client_id: PiiString,
    pub auth_client_secret: PiiString,
    pub cross_core_username: PiiString,
    pub cross_core_password: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct ComplyAdvantageCredentials {
    pub api_key: PiiString,
}
