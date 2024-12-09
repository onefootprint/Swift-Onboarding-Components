use anyhow::Result;
use api_wire_types::TokenOperationKind;
use envconfig::Envconfig;
use newtypes::PiiString;
use newtypes::SessionAuthToken;
use rand::Rng;

#[derive(Envconfig, Clone)]

/// (2022-10-04) Note: to see where many of these env variables originate, see
/// the Pulumi container task definition in `backend/infra/src/containers.ts`
///
/// Our dev .env files are generated/modeled after the pulumi definitions to mimic
/// actual AWS server behavior
pub struct Config {
    /// The base URL of the API
    /// i.e prod=https://api.onefootprint.com
    /// dev=https://api.dev.onefootprint.com
    /// preview=https://api-xyz.dev.onefootprint.com
    /// local=http://localhost:8000
    #[envconfig(from = "API_ORIGIN", default = "http://localhost:8000")]
    pub api_origin: String,

    #[envconfig(nested = true)]
    pub service_config: ServiceEnvironmentConfig,

    #[envconfig(from = "PORT", default = "8000")]
    pub port: u16,

    #[envconfig(nested = true)]
    pub enclave_config: EnclaveConfig,

    #[envconfig(from = "AWS_HMAC_SIGNING_ROOT_KEY_ID")]
    pub signing_root_key_id: String,

    #[envconfig(from = "AWS_REGION")]
    pub aws_region: String,

    #[envconfig(from = "PRETTY_LOGS")]
    pub pretty_logs: Option<String>,

    #[envconfig(from = "DISABLE_TRACES")]
    pub disable_traces: Option<String>,

    #[envconfig(from = "DISABLE_METRICS")]
    pub disable_metrics: Option<String>,

    #[envconfig(from = "OTEL_ENDPOINT")]
    pub otel_endpoint: Option<String>,

    #[envconfig(from = "DISABLE_LAUNCH_DARKLY")]
    pub disable_launch_darkly: Option<String>,

    #[envconfig(from = "DATABASE_URL")]
    pub database_url: String,

    #[envconfig(from = "DATABASE_RO_URL")]
    pub database_ro_url: String,

    #[envconfig(from = "DATABASE_STATEMENT_TIMEOUT_SEC", default = "70")]
    pub database_statement_timeout_sec: u64,

    #[envconfig(from = "WORKOS_API_KEY")]
    pub workos_api_key: String,

    #[envconfig(from = "WORKOS_CLIENT_ID")]
    pub workos_client_id: String,
    #[envconfig(from = "COOKIE_SESSION_KEY")]
    pub cookie_session_key_hex: Option<String>,

    #[envconfig(from = "RELYING_PARTY_ID", default = "localhost")]
    pub rp_id: String,

    #[envconfig(from = "TIME_S_BETWEEN_SMS_CHALLENGES", default = "8")]
    pub time_s_between_challenges: i64,

    #[envconfig(from = "TWILIO_API_KEY")]
    pub twilio_api_key: String,
    #[envconfig(from = "TWILIO_ACCOUNT_SID")]
    pub twilio_acount_sid: String,
    #[envconfig(from = "TWILIO_API_KEY_SECRET")]
    pub twilio_api_key_secret: String,
    #[envconfig(from = "TWILIO_AUTH_KEY_WEBHOOKS")]
    pub twilio_auth_key_webhooks: String,
    #[envconfig(from = "TWILIO_PHONE_NUMBER")]
    pub twilio_phone_number: String,
    #[envconfig(from = "TWILIO_WHATSAPP_SENDER_SID")]
    pub twilio_whatsapp_sender_sid: String,
    #[envconfig(from = "TWILIO_WHATSAPP_OTP_TEMPLATE_ID")]
    pub twilio_whatsapp_otp_template_id: String,

    /// In prod, we have a separate set of credentials from a backup twilio account in case
    /// there are problems
    #[envconfig(from = "TWILIO_API_KEY_BACKUP", default = "")]
    pub twilio_api_key_backup: String,
    #[envconfig(from = "TWILIO_ACCOUNT_SID_BACKUP", default = "")]
    pub twilio_acount_sid_backup: String,
    #[envconfig(from = "TWILIO_API_KEY_SECRET_BACKUP", default = "")]
    pub twilio_api_key_secret_backup: String,
    #[envconfig(from = "TWILIO_AUTH_KEY_WEBHOOKS_BACKUP", default = "")]
    pub twilio_auth_key_webhooks_backup: String,
    #[envconfig(from = "TWILIO_PHONE_NUMBER_BACKUP", default = "")]
    pub twilio_phone_number_backup: String,
    #[envconfig(from = "TWILIO_WHATSAPP_SENDER_SID_BACKUP", default = "")]
    pub twilio_whatsapp_sender_sid_backup: String,
    #[envconfig(from = "TWILIO_WHATSAPP_OTP_TEMPLATE_ID_BACKUP", default = "")]
    pub twilio_whatsapp_otp_template_id_backup: String,

    #[envconfig(from = "SENDGRID_API_KEY")]
    pub sendgrid_api_key: String,

    #[envconfig(from = "DEFAULT_PAGE_SIZE", default = "10")]
    pub default_page_size: usize,

    #[envconfig(from = "CUSTODIAN_KEY", default = "onefootprint")]
    pub custodian_key: String,

    #[envconfig(from = "PROTECTED_CUSTODIAN_KEY")]
    pub protected_custodian_key: Option<String>,

    #[envconfig(nested = true)]
    pub idology_config: IdologyConfig,

    #[envconfig(from = "DOCUMENT_S3_BUCKET", default = "footprint-dev-test")]
    pub document_s3_bucket: String,

    #[envconfig(from = "ASSETS_CDN_S3_BUCKET", default = "footprint-logos-dev-local")]
    pub assets_s3_bucket: String,

    #[envconfig(from = "ASSETS_CDN_ORIGIN", default = "https://local.i-dev.onefp.net")]
    pub assets_cdn_origin: String,

    #[envconfig(nested = true)]
    pub socure_config: SocureConfig,

    #[envconfig(from = "LAUNCH_DARKLY_SDK_KEY")]
    pub launch_darkly_sdk_key: String,

    #[envconfig(from = "SVIX_AUTH_TOKEN")]
    pub svix_auth_token: String,

    #[envconfig(nested = true)]
    pub stripe: StripeConfig,

    #[envconfig(nested = true)]
    pub experian: ExperianConfig,

    #[envconfig(from = "FINGERPRINTJS_SDK_KEY")]
    pub fingerprintjs_sdk_key: String,

    #[envconfig(nested = true)]
    pub incode: IncodeConfig,

    #[envconfig(nested = true)]
    pub middesk_config: MiddeskConfig,

    #[envconfig(nested = true)]
    pub stytch_config: StytchConfig,

    #[envconfig(nested = true)]
    pub apple_config: AppleConfig,

    #[envconfig(nested = true)]
    pub google_config: GooglePlayConfig,

    #[envconfig(nested = true)]
    pub lexis_config: LexisConfig,

    #[envconfig(nested = true)]
    pub neuro_id_config: NeuroIdConfig,

    #[envconfig(from = "OPENAI_API_KEY")]
    pub openai_api_key: String,

    #[envconfig(nested = true)]
    pub samba_safety_config: SambaSafetyConfig,

    #[envconfig(nested = true)]
    pub sentilink_config: SentilinkConfig,

    #[envconfig(nested = true)]
    pub vault_dr_config: VaultDrConfig,
}

fn load_from_env<T: Envconfig>() -> Result<T> {
    // for dev it's easier to load a .env
    let _dotenv = dotenv::dotenv()
        .map(|p| eprintln!("loaded .env at: {}", p.as_path().display()))
        .map_err(|e| eprintln!("proceeding without .env: {:?}", e)); // This is expected in
                                                                     // production.

    Ok(T::init_from_env()?)
}

impl Config {
    pub fn load_from_env() -> Result<Self> {
        load_from_env()
    }

    pub fn twilio_status_callback_url(&self) -> Option<String> {
        // Twilio can't reach the callback API on a server that's running locally
        (!self.service_config.is_local())
            .then_some(format!("{}/webhooks/twilio_status_callback", self.api_origin))
    }
}

/// Config for idology
#[derive(Envconfig, Debug, Clone)]
pub struct IdologyConfig {
    #[envconfig(from = "IDOLOGY_USERNAME")]
    pub username: String,

    #[envconfig(from = "IDOLOGY_PASSWORD")]
    pub password: String,

    #[envconfig(from = "FRACTIONAL_IDOLOGY_USERNAME")]
    pub fractional_username: Option<String>,

    #[envconfig(from = "FRACTIONAL_IDOLOGY_PASSWORD")]
    pub fractional_password: Option<String>,
}

/// Separated config for Enclave settings
#[derive(Envconfig, Debug, Clone)]
pub struct EnclaveConfig {
    #[envconfig(from = "ENCLAVE_PORT", default = "5001")]
    pub enclave_port: u32,

    #[envconfig(from = "ENCLAVE_CID", default = "16")]
    pub enclave_cid: u32,

    #[envconfig(from = "ENCLAVE_LOCAL")]
    pub use_local: Option<String>,

    #[envconfig(from = "AWS_ROOT_KEY_ID")]
    pub enclave_root_key_id: String,

    #[envconfig(from = "ENCLAVE_AWS_ACCESS_KEY_ID")]
    pub enclave_aws_access_key_id: String,

    #[envconfig(from = "ENCLAVE_AWS_SECRET_ACCESS_KEY")]
    pub enclave_aws_secret_access_key: String,

    #[envconfig(from = "ENCLAVE_SEALED_ENC_IKEK_HEX")]
    pub enclave_sealed_enc_ikek_hex: String,

    #[envconfig(from = "ENCLAVE_SEALED_HMAC_IKEK_HEX")]
    pub enclave_sealed_hmac_ikek_hex: String,

    #[envconfig(from = "ENCLAVE_PROXY_ENDPOINT", default = "http://localhost:3668")]
    pub enclave_proxy_endpoint: String,

    #[envconfig(from = "ENCLAVE_PROXY_SECRET", default = "onefootprint")]
    pub enclave_proxy_secret: String,
}

/// separate service config struct to load minimal memory footprint for sensitive values
#[derive(Envconfig, Clone)]
pub struct ServiceEnvironmentConfig {
    #[envconfig(from = "SERVICE_ENVIRONMENT", default = "unspecified")]
    pub environment: String,

    #[envconfig(from = "METRICS_ENDPOINT_PATH", default = "metrics")]
    pub metrics_endpoint_path: String,
}

lazy_static::lazy_static! {
    pub static ref SERVICE_CONFIG:ServiceEnvironmentConfig = {
        #[allow(clippy::expect_used)]
        ServiceEnvironmentConfig::load_from_env().expect("failed to load service config")
    };
}

pub enum LinkKind {
    /// Hosted bifrost verify component with a user-specific link
    VerifyUser,
    /// Hosted bifrost verify component with a business-owner link
    VerifyBusinessOwner,
    /// Hosted auth to update login methods
    UpdateAuth,
    /// Small app to verify contact info using a citok
    ContactInfoVerify,
}

impl LinkKind {
    pub fn from_token_kind(kind: &TokenOperationKind) -> Self {
        match kind {
            TokenOperationKind::Inherit
            | TokenOperationKind::Onboard
            | TokenOperationKind::Reonboard
            | TokenOperationKind::User => LinkKind::VerifyUser,
            TokenOperationKind::UpdateAuthMethods => LinkKind::UpdateAuth,
        }
    }
}

impl ServiceEnvironmentConfig {
    pub fn load_from_env() -> Result<Self> {
        load_from_env()
    }

    pub fn is_production(&self) -> bool {
        self.environment.as_str() == "production"
    }

    pub fn is_local(&self) -> bool {
        self.environment.as_str() == "local"
    }

    /// Generate a link to hosted bifrost based on the environment in which we are running
    pub fn generate_link(&self, kind: LinkKind, token: &SessionAuthToken) -> PiiString {
        // TODO right now, for simplicity, we determine the base_url from the environment running
        // in the backend. Ideally, if you are testing a local frontend, we should send you a link
        // to your local frontend. In the future, migrate to have the client provide info on the
        // environment
        let base_url = match kind {
            LinkKind::VerifyUser | LinkKind::VerifyBusinessOwner => {
                if self.is_production() {
                    "https://verify.onefootprint.com"
                } else if self.is_local() {
                    "http://localhost:3004"
                } else {
                    "https://verify.preview.onefootprint.com"
                }
            }
            LinkKind::UpdateAuth => {
                if self.is_production() {
                    "https://auth.onefootprint.com/user"
                } else if self.is_local() {
                    "http://localhost:3011/user"
                } else {
                    "https://auth.preview.onefootprint.com/user"
                }
            }
            LinkKind::ContactInfoVerify => {
                if self.is_production() {
                    "https://confirm.onefootprint.com"
                } else if self.is_local() {
                    "http://localhost:3006"
                } else {
                    "https://confirm.preview.onefootprint.com"
                }
            }
        };
        // Randomize the querystring so different links open in different tabs
        let r = rand::thread_rng().gen_range(0..1000);

        let querystring = match kind {
            LinkKind::VerifyUser => format!("type=user&r={}", r),
            LinkKind::VerifyBusinessOwner => format!("type=bo&r={}", r),
            LinkKind::UpdateAuth => format!("r={}", r),
            LinkKind::ContactInfoVerify => format!("r={}", r),
        };
        // Send the auth token in the url fragment #, which isn't logged by default.
        // The auth token is a secret
        PiiString::new(format!("{}?{}#{}", base_url, querystring, token))
    }
}

impl enclave_proxy::StreamConfig for EnclaveConfig {
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

#[derive(Envconfig, Debug, Clone)]
pub struct SocureConfig {
    #[envconfig(from = "SOCURE_SANDBOX_API_KEY")]
    pub sandbox_api_key: String,

    #[envconfig(from = "SOCURE_PRODUCTION_API_KEY")]
    pub production_api_key: String,
}

#[derive(Envconfig, Debug, Clone)]
pub struct StripeConfig {
    #[envconfig(from = "STRIPE_API_KEY")]
    pub api_key: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct IncodeConfig {
    #[envconfig(from = "INCODE_API_KEY")]
    pub api_key: PiiString,
    #[envconfig(from = "INCODE_BASE_URL")]
    pub base_url: PiiString,
    #[envconfig(from = "INCODE_DOCUMENT_FLOW_ID")]
    pub document_flow_id: PiiString,
    #[envconfig(from = "INCODE_SELFIE_FLOW_ID")]
    pub selfie_flow_id: PiiString,

    #[envconfig(from = "INCODE_DEMO_API_KEY")]
    pub demo_api_key: PiiString,
    #[envconfig(from = "INCODE_DEMO_BASE_URL")]
    pub demo_base_url: PiiString,
    #[envconfig(from = "INCODE_DEMO_DOCUMENT_FLOW_ID")]
    pub demo_document_flow_id: PiiString,
    #[envconfig(from = "INCODE_DEMO_SELFIE_FLOW_ID")]
    pub demo_selfie_flow_id: PiiString,
}

impl IncodeConfig {
    pub fn selfie_flow_id(&self, is_sandbox: bool) -> PiiString {
        if is_sandbox {
            self.demo_selfie_flow_id.clone()
        } else {
            self.selfie_flow_id.clone()
        }
    }

    pub fn document_flow_id(&self, is_sandbox: bool) -> PiiString {
        if is_sandbox {
            self.demo_document_flow_id.clone()
        } else {
            self.document_flow_id.clone()
        }
    }
}

#[derive(Envconfig, Debug, Clone)]
pub struct ExperianConfig {
    #[envconfig(from = "EXPERIAN_AUTH_USERNAME")]
    pub auth_username: PiiString,
    #[envconfig(from = "EXPERIAN_AUTH_PASSWORD")]
    pub auth_password: PiiString,
    #[envconfig(from = "EXPERIAN_AUTH_CLIENT_ID")]
    pub auth_client_id: PiiString,
    #[envconfig(from = "EXPERIAN_AUTH_CLIENT_SECRET")]
    pub auth_client_secret: PiiString,
    #[envconfig(from = "EXPERIAN_CROSS_CORE_USERNAME")]
    pub cross_core_username: PiiString,
    #[envconfig(from = "EXPERIAN_CROSS_CORE_PASSWORD")]
    pub cross_core_password: PiiString,
    #[envconfig(from = "EXPERIAN_PRECISEID_SUBSCRIBER_CODE")]
    pub subscriber_code: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct MiddeskConfig {
    #[envconfig(from = "MIDDESK_API_KEY")]
    pub middesk_api_key: PiiString,

    #[envconfig(from = "MIDDESK_WEBHOOK_SECRET")]
    pub middesk_webhook_secret: PiiString,

    #[envconfig(from = "MIDDESK_BASE_URL")]
    pub middesk_base_url: String,
}

#[derive(Envconfig, Debug, Clone)]
pub struct StytchConfig {
    #[envconfig(from = "STYTCH_PROJECT")]
    pub stytch_project: String,

    #[envconfig(from = "STYTCH_SECRET")]
    pub stytch_secret: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct AppleConfig {
    #[envconfig(from = "APPLE_DEVICE_CHECK_PRIVATE_KEY")]
    pub apple_device_check_private_key_pem: String,
    #[envconfig(from = "APPLE_DEVICE_CHECK_KEY_ID")]
    pub apple_device_check_key_id: String,
}

#[derive(Envconfig, Debug, Clone)]
pub struct GooglePlayConfig {
    #[envconfig(from = "GOOGLE_PLAY_INTEGRITY_VERIFICATION_KEY")]
    pub play_integrity_verificiation_key: String,
    #[envconfig(from = "GOOGLE_PLAY_INTEGRITY_DECRYPTION_KEY")]
    pub play_integrity_decryptiong_key: String,
}

#[derive(Envconfig, Debug, Clone)]
pub struct LexisConfig {
    #[envconfig(from = "LEXIS_USER_ID")]
    pub user_id: PiiString,

    #[envconfig(from = "LEXIS_PASSWORD")]
    pub password: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct NeuroIdConfig {
    #[envconfig(from = "NEUROID_API_KEY")]
    pub api_key: PiiString,
    #[envconfig(from = "NEUROID_API_KEY_TEST")]
    pub api_key_test: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct SambaSafetyConfig {
    #[envconfig(from = "SAMBA_API_KEY")]
    pub api_key: PiiString,
    #[envconfig(from = "SAMBA_BASE_URL")]
    pub base_url: PiiString,
    #[envconfig(from = "SAMBA_AUTH_USERNAME")]
    pub auth_username: PiiString,
    #[envconfig(from = "SAMBA_AUTH_PASSWORD")]
    pub auth_password: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct SentilinkConfig {
    #[envconfig(from = "SENTILINK_BASE_URL")]
    pub base_url: PiiString,
    #[envconfig(from = "SENTILINK_AUTH_USERNAME")]
    pub auth_username: PiiString,
    #[envconfig(from = "SENTILINK_AUTH_PASSWORD")]
    pub auth_password: PiiString,
}

#[derive(Envconfig, Debug, Clone)]
pub struct VaultDrConfig {
    // These AWS overrides are used to point the server at localstack for testing purposes.
    #[envconfig(from = "VAULT_DR_USE_LOCALSTACK")]
    pub use_localstack: Option<String>,
    #[envconfig(from = "VAULT_DR_AWS_REGION")]
    pub aws_region: Option<String>,
    #[envconfig(from = "VAULT_DR_AWS_ENDPOINT")]
    pub aws_endpoint: Option<String>,
    #[envconfig(from = "VAULT_DR_AWS_ACCESS_KEY_ID")]
    pub aws_access_key_id: Option<PiiString>,
    #[envconfig(from = "VAULT_DR_AWS_SECRET_ACCESS_KEY")]
    pub aws_secret_access_key: Option<PiiString>,
}
