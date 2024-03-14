use crate::PiiString;


#[derive(Clone)]
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
        let body = match self {
            Self::Otp { tenant_name, code } => {
                if let Some(tenant_name) = tenant_name {
                    format!("Your {} verification code is {}. Don't share your code with anyone, we will never contact you to request this code.", tenant_name, code.leak())
                } else {
                    // This copy likely won't work for safari's autofill, but the other one is being blocked by twilio
                    format!("Your Footprint verification code is {}. Don't share your code with anyone, we will never contact you to request this code.", code.leak())
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
}
