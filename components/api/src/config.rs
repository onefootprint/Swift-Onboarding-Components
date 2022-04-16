use envconfig::Envconfig;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "PORT", default = "8000")]
    pub port: u16,

    #[envconfig(from = "ENCLAVE_PORT", default = "5000")]
    pub enclave_port: u32,

    #[envconfig(from = "ENCLAVE_CID", default = "16")]
    pub enclave_cid: u32,

    #[envconfig(from = "LOCAL")]
    pub use_local: Option<String>,

    #[envconfig(from = "AWS_ROOT_KEY_ID")]
    pub root_key_id: String,

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
}

impl Config {
    pub fn load_from_env() -> Result<Self, Box<dyn std::error::Error>> {
        // for dev it's easier to load a .env
        let _ = dotenv::dotenv()
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
