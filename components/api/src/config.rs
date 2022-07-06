use envconfig::Envconfig;
use newtypes::PhoneNumber;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "SERVICE_ENVIRONMENT")]
    pub service_environment: Option<String>,

    #[envconfig(from = "PORT", default = "8000")]
    pub port: u16,

    #[envconfig(from = "ENCLAVE_PORT", default = "5000")]
    pub enclave_port: u32,

    #[envconfig(from = "ENCLAVE_CID", default = "16")]
    pub enclave_cid: u32,

    #[envconfig(from = "LOCAL")]
    pub use_local: Option<String>,

    #[envconfig(from = "AWS_ROOT_KEY_ID")]
    pub enclave_root_key_id: String,

    #[envconfig(from = "AWS_HMAC_SIGNING_ROOT_KEY_ID")]
    pub signing_root_key_id: String,

    #[envconfig(from = "AWS_REGION")]
    pub aws_region: String,

    #[envconfig(from = "ENCLAVE_AWS_ACCESS_KEY_ID")]
    pub enclave_aws_access_key_id: String,

    #[envconfig(from = "ENCLAVE_AWS_SECRET_ACCESS_KEY")]
    pub enclave_aws_secret_access_key: String,

    #[envconfig(from = "DISABLE_OTEL")]
    pub disable_otel: Option<String>,

    #[envconfig(from = "OTEL_ENDPOINT")]
    pub otel_endpoint: Option<String>,

    #[envconfig(from = "DATABASE_URL")]
    pub database_url: String,

    #[envconfig(from = "WORKOS_API_KEY")]
    pub workos_api_key: String,

    #[envconfig(from = "WORKOS_CLIENT_ID")]
    pub workos_client_id: String,

    #[envconfig(from = "WORKOS_DEFAULT_ORG")]
    pub workos_default_org: String,

    #[envconfig(from = "COOKIE_SESSION_KEY")]
    pub cookie_session_key_hex: Option<String>,

    #[envconfig(from = "RELYING_PARTY_ID", default = "localhost")]
    pub rp_id: String,

    #[envconfig(from = "COOKIE_DOMAIN", default = "localhost")]
    pub cookie_domain: String,

    #[envconfig(from = "TIME_S_BETWEEN_SMS_CHALLENGES", default = "15")]
    pub time_s_between_sms_challenges: i64,

    #[envconfig(from = "INTEGRATION_TEST_PHONE_NUMBER", default = "+1 339 331 1410")]
    pub integration_test_phone_number: PhoneNumber,

    #[envconfig(from = "TWILIO_API_KEY")]
    pub twilio_api_key: String,

    #[envconfig(from = "TWILIO_ACCOUNT_SID")]
    pub twilio_acount_sid: String,

    #[envconfig(from = "TWILIO_API_KEY_SECRET")]
    pub twilio_api_key_secret: String,

    #[envconfig(from = "TWILIO_PHONE_NUMBER")]
    pub twilio_phone_number: String,

    #[envconfig(from = "SENDGRID_API_KEY")]
    pub sendgrid_api_key: String,

    #[envconfig(from = "SENDGRID_FROM_EMAIL")]
    pub sendgrid_from_email: String,

    #[envconfig(
        from = "SENDGRID_CHALLENGE_TEMPLATE_ID",
        default = "d-c558e640dad04726a31e6710c7ffc57c"
    )]
    pub sendgrid_challenge_template_id: String,

    #[envconfig(from = "SENTRY_URL")]
    pub sentry_url: String,

    #[envconfig(from = "DEFAULT_PAGE_SIZE", default = "10")]
    pub default_page_size: usize,
}

impl Config {
    pub fn load_from_env() -> Result<Self, Box<dyn std::error::Error>> {
        // for dev it's easier to load a .env
        let _dotenv = dotenv::dotenv()
            .map(|p| eprintln!("load .env at: {}", p.as_path().display()))
            .map_err(|e| eprintln!("error loading .env: {:?}", e));

        Ok(Config::init_from_env()?)
    }
}

impl enclave_proxy::StreamConfig for Config {
    #[cfg(feature = "vsock")]
    fn stream_type(&self) -> enclave_proxy::StreamType {
        if self.use_local.is_some() {
            enclave_proxy::StreamType::Tcp {
                address: format!("127.0.0.1:{}", self.enclave_port),
            }
        } else {
            enclave_proxy::StreamType::Vsock {
                cid: self.enclave_cid,
                port: self.enclave_port,
            }
        }
    }
    #[cfg(not(feature = "vsock"))]
    fn stream_type(&self) -> enclave_proxy::StreamType {
        enclave_proxy::StreamType::Tcp {
            address: format!("127.0.0.1:{}", self.enclave_port),
        }
    }
}
