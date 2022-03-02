use envconfig::Envconfig;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "PORT", default = "8000")]
    pub port: u16,

    #[envconfig(from = "ENCLAVE_PORT", default = "5000")]
    pub enclave_port: u32,

    #[envconfig(from = "ENCLAVE_CID", default = "16")]
    pub enclave_cid: u32,

    #[envconfig(from = "UNIX_SOCKET")]
    pub unix_sock: Option<String>,
}

impl Config {
    pub fn load_from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Config::init_from_env()?)
    }
}

impl crate::StreamConfig for Config {
    fn stream_type(&self) -> crate::StreamType {
        if let Some(path) = &self.unix_sock {
            crate::StreamType::UnixSocket(path.clone())
        } else {
            crate::StreamType::Vsock {
                cid: self.enclave_cid,
                port: self.enclave_port,
            }
        }
    }
}
