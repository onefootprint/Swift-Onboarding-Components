pub use enclave::Config;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    let config = Config::load_from_env().expect("failed to load env");

    enclave::run(config).await
}
