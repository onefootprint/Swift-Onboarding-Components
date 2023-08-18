use webauthn_rs_core::WebauthnCore;

use crate::config::Config;

pub struct WebauthnConfig {
    webauthn: WebauthnCore,
    android_webauthn: WebauthnCore,
}

impl WebauthnConfig {
    pub fn new(config: &Config) -> Self {
        let scheme = if config.rp_id.as_str() == "localhost" {
            "http"
        } else {
            "https"
        };

        let url = format!("{scheme}://{}", &config.rp_id);
        #[allow(clippy::unwrap_used)]
        let url = url::Url::parse(&url).unwrap();
        Self {
            webauthn: WebauthnCore::new_unsafe_experts_only(
                "Footprint",
                &config.rp_id,
                &url,
                Some(120 * 1000),
                Some(true),
                Some(true),
            ),
            android_webauthn: Self::android_config(&config.rp_id),
        }
    }

    /// TEMPORARY: workaround for this bug: https://github.com/android/identity-samples/issues/49
    pub fn android_config(rp_id: &str) -> WebauthnCore {
        WebauthnCore::new_unsafe_experts_only(
            "Footprint",
            rp_id,
            #[allow(clippy::unwrap_used)]
            &url::Url::parse("android:apk-key-hash:D_woKFaP1yeRthdVOKrD03l1Dx6xKjgv7cCoE13UXcg").unwrap(),
            Some(120 * 1000),
            Some(false),
            Some(true),
        )
    }

    pub fn android_workaround(&self) -> &WebauthnCore {
        &self.android_webauthn
    }

    pub fn webauthn(&self) -> &WebauthnCore {
        &self.webauthn
    }
}
