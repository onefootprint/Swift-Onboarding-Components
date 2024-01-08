use newtypes::PiiString;
use paperclip::actix::Apiv2Schema;
use webauthn_rs_core::proto::RegistrationState;

pub mod index;
pub mod verify;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RegisterChallenge {
    pub data: RegisterChallengeData,
    pub action_kind: ActionKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActionKind {
    /// Replace the existing auth method
    Replace,
    /// Add the provided auth method
    Add,
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
