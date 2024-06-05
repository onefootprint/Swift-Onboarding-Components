use envconfig::Envconfig;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "ENCLAVE_PROXY_PORT", default = "3668")]
    pub port: u16,

    #[envconfig(from = "ENCLAVE_PORT", default = "5000")]
    pub enclave_port: u16,

    #[envconfig(from = "ENCLAVE_CID", default = "16")]
    pub enclave_cid: u32,

    #[envconfig(from = "ENCLAVE_TCP_HOST")]
    pub enclave_tcp_host: Option<String>,

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
            address: format!(
                "{}:{}",
                self.enclave_tcp_host
                    .as_ref()
                    .map(|h| (*h).as_str())
                    .unwrap_or("127.0.0.1"),
                self.enclave_port
            ),
        };

        #[cfg(feature = "vsock")]
        if let Some(enclave_tcp_host) = self.enclave_tcp_host.as_ref() {
            crate::StreamType::Tcp {
                address: format!("{}:{}", enclave_tcp_host, self.enclave_port),
            }
        } else {
            crate::StreamType::Vsock {
                cid: self.enclave_cid,
                port: self.enclave_port as u32,
            }
        }
    }
}
