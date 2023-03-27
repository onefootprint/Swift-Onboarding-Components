#![warn(clippy::unwrap_used)]
#![warn(clippy::expect_used)]

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    api_core::run_server().await
}
