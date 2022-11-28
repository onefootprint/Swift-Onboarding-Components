#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    env_logger::init();
    let config = enclave_proxy::Config::load_from_env().expect("failed to load config");
    enclave_proxy::http_proxy::server::run(config).await
}
