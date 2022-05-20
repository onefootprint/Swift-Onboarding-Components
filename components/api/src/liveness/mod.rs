mod register;
mod verify;

use crate::State;
use db::{errors::DbError, models::webauthn_credential::WebauthnCredential};
use newtypes::UserVaultId;
use paperclip::actix::web;
use webauthn_rs::{
    proto::{AttestationConveyancePreference, AuthenticatorAttachment, ParsedAttestationData},
    WebauthnConfig,
};

pub fn routes() -> web::Scope {
    web::scope("/liveness")
        .service(register::init)
        .service(register::complete)
        .service(verify::init)
        .service(verify::complete)
}

pub struct LivenessWebauthnConfig {
    url: url::Url,
    rp_id: String,
}

impl LivenessWebauthnConfig {
    pub fn new(state: &State) -> Self {
        let (scheme, port) = if state.config.rp_id.as_str() == "localhost" {
            ("http", ":3000")
        } else {
            ("https", "")
        };

        let url = format!("{scheme}://{}{port}", &state.config.rp_id);

        Self {
            url: url::Url::parse(&url).unwrap(),
            rp_id: state.config.rp_id.clone(),
        }
    }
}
impl WebauthnConfig for LivenessWebauthnConfig {
    fn get_relying_party_name(&self) -> &str {
        "Footprint"
    }

    fn get_origin(&self) -> &url::Url {
        &self.url
    }

    fn get_relying_party_id(&self) -> &str {
        &self.rp_id
    }
    fn get_attestation_preference(&self) -> AttestationConveyancePreference {
        AttestationConveyancePreference::Direct
    }

    fn get_authenticator_attachment(&self) -> Option<AuthenticatorAttachment> {
        Some(AuthenticatorAttachment::Platform)
    }

    fn get_require_resident_key(&self) -> bool {
        true
    }

    fn require_valid_counter_value(&self) -> bool {
        false
    }

    fn allow_subdomains_origin(&self) -> bool {
        true
    }

    fn policy_verify_trust(&self, pad: ParsedAttestationData) -> Result<(), ()> {
        log::debug!("policy_verify_trust -> {:?}", pad);
        match pad {
            ParsedAttestationData::Basic(_attest_cert) => Ok(()),
            ParsedAttestationData::Self_ => Ok(()),
            ParsedAttestationData::AttCa(_attest_cert, _ca_chain) => Ok(()),
            ParsedAttestationData::AnonCa(_attest_cert, _ca_chain) => Ok(()),
            ParsedAttestationData::None => Ok(()),
            // TODO: trust is unimplemented here
            ParsedAttestationData::ECDAA => Err(()),
            // We don't trust Uncertain attestations
            ParsedAttestationData::Uncertain => Err(()),
        }
    }
}

pub async fn get_webauthn_creds(
    state: &web::Data<State>,
    user_vault_id: UserVaultId,
) -> Result<Vec<WebauthnCredential>, DbError> {
    state
        .db_pool
        .get()
        .await
        .map_err(DbError::from)?
        .interact(move |conn| WebauthnCredential::get_for_user_vault(conn, user_vault_id))
        .await
        .map_err(DbError::from)?
}
