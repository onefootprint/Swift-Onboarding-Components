use crate::PiiString;
use std::collections::HashMap;

#[derive(Clone, strum::EnumDiscriminants)]
#[strum_discriminants(vis(pub), name(SmsMessageKind))]
pub enum SmsMessage {
    Otp {
        tenant_name: Option<String>,
        code: PiiString,
    },
    D2p {
        url: PiiString,
    },
    BoSession {
        inviter: PiiString,
        business_name: PiiString,
        tenant_name: String,
        url: PiiString,
    },
    Freeform {
        content: PiiString,
    },
}

impl SmsMessage {
    pub fn body(&self) -> PiiString {
        // NOTE: some carriers, particularly in Mexico, have a character limit of 140.
        // Be careful with long message bodies
        let body = match self {
            Self::Otp { tenant_name, code } => {
                if let Some(tenant_name) = tenant_name {
                    format!("Your {} verification code is {}.", tenant_name, code.leak())
                } else {
                    // This copy likely won't work for safari's autofill, but the other one is being blocked by twilio
                    format!("Your Footprint verification code is {}.", code.leak())
                }
            }
            Self::D2p { url } => format!(
                "Continue account verification on your phone using this link: {}",
                url.leak()
            ),
            Self::BoSession { inviter, business_name, tenant_name, url } => format!(
                "{} identified you as a beneficial owner of {}. To finish verifying your business for {}, we need to verify your identity as well. Continue here: {}",
                inviter.leak(),
                business_name.leak(),
                tenant_name,
                url.leak()
            ),
            Self::Freeform { content } => content.leak_to_string()
        };
        PiiString::from(format!("{}\n\nSent via Footprint", body))
    }

    pub fn rate_limit_scope(&self) -> &str {
        match self {
            Self::Otp { .. } => "sms_challenge",
            Self::D2p { .. } => "d2p_session",
            Self::BoSession { .. } => "bo_session",
            Self::Freeform { .. } => "freeform",
        }
    }

    /// The variables used to render the SmsMessage's content
    pub fn whatsapp_content_variables(&self) -> Option<HashMap<String, String>> {
        match self {
            // WhatsApp only supports a pre-defined message with a variable OTP
            Self::Otp { code, .. } => Some(HashMap::from([("1".into(), code.leak_to_string())])),
            _ => None,
        }
    }

    pub fn supports_whatsapp(&self) -> bool {
        self.whatsapp_content_variables().is_some()
    }
}
