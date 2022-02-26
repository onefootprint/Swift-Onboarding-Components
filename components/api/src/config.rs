use envconfig::Envconfig;

#[derive(Envconfig, Clone)]
pub struct Config {
    #[envconfig(from = "PORT", default = "8000")]
    pub port: u16,
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
