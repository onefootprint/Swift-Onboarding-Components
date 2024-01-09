use api_wire_types::ActionKind;
use newtypes::PiiString;
use webauthn_rs_core::proto::RegistrationState;

pub mod index;
pub mod verify;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RegisterChallenge {
    pub data: RegisterChallengeData,
    pub action_kind: ActionKind,
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
