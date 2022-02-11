use actix_web::{get, middleware::Logger, App, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_opentelemetry::RequestTracing;
use tracing_actix_web::TracingLogger;
mod config;
mod telemetry;

#[tracing::instrument(name = "index", skip(req))]
#[get("/")]
async fn index(req: HttpRequest) -> impl Responder {
    let mut headers = req
        .headers()
        .iter()
        .filter(|(name, _)| {
            name.as_str().to_lowercase() != "X-Token-From-Cloudfront".to_lowercase()
        })
        .map(|(name, value)| {
            let val = value.to_str().unwrap_or("?");
            format!("{name} -> {val}")
        })
        .collect::<Vec<String>>();

    headers.sort();

    log_headers(&headers);

    let headers = headers.join("\n");

    HttpResponse::Ok().body(format!("{headers}"))
}

#[tracing::instrument(name = "test", skip(req))]
// #[get("/test")]
async fn test(req: HttpRequest) -> impl Responder {
    "hello"
}

#[tracing::instrument(name = "log_headers")]
fn log_headers(headers: &Vec<String>) {
    tracing::info!("got headers");
}

pub struct ApiError {}
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = config::Config::load_from_env().expect("failed to load config");
    telemetry::init(&config).expect("failed to init telemetry layers");

    let res = HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(TracingLogger::default())
            .service(index)
            .route("/test", actix_web::web::get().to(test))
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await;

    // telemetry::shutdown();
    res
}
