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

// in prod sandbox, we need to use a different API key
#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct NeuroIdApiKeys {
    pub key: PiiString,
    pub test_key: PiiString,
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct NeuroIdSiteId(pub PiiString);

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct NeuroIdCredentials {
    // we get this from api Config
    api_key: PiiString,
    // we might get this from playbook or per-tenant configurations
    site_id: NeuroIdSiteId,
}

impl NeuroIdCredentials {
    pub fn new(api_keys: NeuroIdApiKeys, site_id: NeuroIdSiteId, use_test_key: bool) -> Self {
        let api_key = if use_test_key {
            api_keys.test_key
        } else {
            api_keys.key
        };
        Self { api_key, site_id }
    }

    pub fn api_key(&self) -> PiiString {
        self.api_key.clone()
    }

    pub fn site_id(&self) -> PiiString {
        self.site_id.0.clone()
    }
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct SambaSafetyCredentials {
    pub api_key: PiiString,
    pub base_url: PiiString,
    pub auth_username: PiiString,
    pub auth_password: PiiString,
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
