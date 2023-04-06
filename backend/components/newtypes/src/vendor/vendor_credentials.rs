use crate::PiiString;

/// credentials for idology
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct IdologyCredentials {
    pub username: PiiString,
    pub password: PiiString,
}

#[allow(unused)]
/// credentials for experian
#[derive(Clone, PartialEq, Eq, Debug)]
pub struct ExperianCredentials {
    pub subscriber_code: PiiString,
    pub auth_username: PiiString,
    pub auth_password: PiiString,
    pub auth_client_id: PiiString,
    pub auth_client_secret: PiiString,
    pub cross_core_username: PiiString,
    pub cross_core_password: PiiString,
}

impl ExperianCredentials {
    #[allow(unused)]
    pub fn update_subscriber_code(mut self, subscriber_code: PiiString) -> Self {
        self.subscriber_code = subscriber_code;

        self
    }
}
