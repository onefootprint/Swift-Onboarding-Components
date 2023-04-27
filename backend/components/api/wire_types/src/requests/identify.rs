use newtypes::email::Email;

use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
/// An identifier for the identify flow that will uniquely identify a user
pub enum IdentifyId {
    Email(Email),
    PhoneNumber(PhoneNumber),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    pub identifier: IdentifyId,
}

impl IdentifyId {
    pub fn idk(&self) -> IdentityDataKind {
        match self {
            Self::Email(_) => IdentityDataKind::Email,
            Self::PhoneNumber(_) => IdentityDataKind::PhoneNumber,
        }
    }
}
