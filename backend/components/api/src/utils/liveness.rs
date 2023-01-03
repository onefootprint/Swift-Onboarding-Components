use webauthn_rs_core::WebauthnCore;

use crate::State;

pub struct LivenessWebauthnConfig {
    webauthn: WebauthnCore,
}

impl LivenessWebauthnConfig {
    pub fn new(state: &State) -> Self {
        let scheme = if state.config.rp_id.as_str() == "localhost" {
            "http"
        } else {
            "https"
        };

        let url = format!("{scheme}://{}", &state.config.rp_id);
        #[allow(clippy::unwrap_used)]
        let url = url::Url::parse(&url).unwrap();
        Self {
            webauthn: WebauthnCore::new_unsafe_experts_only(
                "Footprint",
                &state.config.rp_id,
                &url,
                Some(120 * 1000),
                Some(true),
                Some(true),
            ),
        }
    }

    pub fn webauthn(&self) -> &WebauthnCore {
        &self.webauthn
    }
}
