use envconfig::Envconfig;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "ENCLAVE_PROXY_PORT", default = "3668")]
    pub port: u16,

    #[envconfig(from = "ENCLAVE_PORT", default = "5000")]
    pub enclave_port: u16,

    #[envconfig(from = "ENCLAVE_CID", default = "16")]
    pub enclave_cid: u32,

    #[envconfig(from = "LOCAL")]
    pub use_local: Option<String>,

    #[envconfig(from = "ENCLAVE_PROXY_SECRET", default = "onefootprint")]
    pub proxy_secret: String,
}

impl Config {
    pub fn load_from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Config::init_from_env()?)
    }
}

impl crate::StreamConfig for Config {
    fn stream_type(&self) -> crate::StreamType {
        #[cfg(not(feature = "vsock"))]
        return crate::StreamType::Tcp {
            address: format!("127.0.0.1:{}", self.enclave_port),
        };

        #[cfg(feature = "vsock")]
        if self.use_local.is_some() {
            crate::StreamType::Tcp {
                address: format!("127.0.0.1:{}", self.enclave_port),
            }
        } else {
            crate::StreamType::Vsock {
                cid: self.enclave_cid,
                port: self.enclave_port as u32,
            }
        }
    }
}
