mod basic;
mod mtls;
use futures_util::future::join;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let basic_port = std::env::var("BASIC_PORT")
        .ok()
        .and_then(|r| r.parse::<u16>().ok())
        .unwrap_or(5001);

    let tls_port = std::env::var("TLS_PORT")
        .ok()
        .and_then(|r| r.parse::<u16>().ok())
        .unwrap_or(5002);

    let basic = async move {
        basic::serve(basic_port)
            .await
            .expect("failed to run basic server")
    };
    let mtls = async move { mtls::serve(tls_port).await.expect("failed to run mTLS server") };
    let _ = join(basic, mtls).await;
    Ok(())
}
