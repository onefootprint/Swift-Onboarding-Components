use envconfig::Envconfig;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "PORT", default = "8000")]
    pub port: u16,

    #[envconfig(from = "ENCLAVE_PORT", default = "5000")]
    pub enclave_port: u32,

    #[envconfig(from = "UNIX_SOCKET")]
    pub unix_sock: Option<String>,
}

impl Config {
    pub fn load_from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Config::init_from_env()?)
    }
}
