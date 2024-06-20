use newtypes::ActionKind;
use newtypes::AuthMethodKind;
use newtypes::PiiString;
use webauthn_rs_core::proto::RegistrationState;

pub mod index;
pub mod verify;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RegisterChallenge {
    pub data: RegisterChallengeData,
    pub action_kind: ActionKind,
    /// Additional field just to prevent accidentally deserializing another struct with similar
    /// serialization
    pub is_register_challenge: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum RegisterChallengeData {
    Sms {
        h_code: Vec<u8>,
        phone_number: PiiString,
    },
    Email {
        h_code: Vec<u8>,
        email: PiiString,
    },
    Passkey {
        reg_state: RegistrationState,
    },
}

impl<'a> From<&'a RegisterChallengeData> for AuthMethodKind {
    fn from(value: &'a RegisterChallengeData) -> Self {
        match value {
            RegisterChallengeData::Sms { .. } => Self::Phone,
            RegisterChallengeData::Email { .. } => Self::Email,
            RegisterChallengeData::Passkey { .. } => Self::Passkey,
        }
    }
}
