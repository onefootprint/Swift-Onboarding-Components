mod auth_context;
mod register;

use crate::{
    auth::AuthError,
    errors::ApiError,
    response::{success::ApiResponseData, Empty},
    State,
};
use actix_session::Session;
use db::models::session_data::{OnboardingSessionData, SessionState};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};
use webauthn_rs::{
    proto::{AttestationConveyancePreference, AuthenticatorAttachment, ParsedAttestationData},
    WebauthnConfig,
};

use self::auth_context::{RegisterState, WebAuthnCookieSessionState, WebAuthnState};

pub fn routes() -> web::Scope {
    web::scope("/liveness")
        .service(web::resource("").route(web::post().to(start)))
        .service(register::get_register_challenge)
        .service(register::post_register_challenge)
}

/// The data in this request is sent to a mobile device via sms/email
/// and includes the parameters as url fragments.
/// For example:
/// https://livecheck.onefootprint.com#<Base64({sid: <session_id>})?
#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
struct StartLivenessCheckRequest {
    session_id: String,
}

/// This handler starts the liveness check
/// It does the following:
///     1. Lookup the session by id
///     2. Validate session state: 2a: onboarding + registration, 2b: identity verification and auth
///     3. Install the session cookie with the session id and the webauthn state
#[api_v2_operation]
async fn start(
    request: Json<StartLivenessCheckRequest>,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let session_id = request.into_inner().session_id;
    let pool = &state.db_pool;
    let session_info = db::session::get_by_session_id(pool, session_id.clone()).await?;

    // TODO: add auth state
    let user_vault_id = match session_info.session_data {
        SessionState::OnboardingSession(OnboardingSessionData {
            user_vault_id,
            user_ob_id: _,
        }) => user_vault_id,
        _ => return Err(AuthError::InvalidSessionState.into()),
    };

    WebAuthnCookieSessionState {
        session_id,
        user_vault_id,
        state: WebAuthnState::Register(RegisterState::NotStarted),
    }
    .set(&session)?;

    Ok(Json(ApiResponseData::ok(Empty)))
}

//TODO: all this needs to be setup correctly
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
