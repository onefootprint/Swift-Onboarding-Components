use actix_web::{get, App, HttpRequest, HttpResponse, HttpServer, Responder};
use tracing_actix_web::TracingLogger;
mod telemetry;

#[tracing::instrument(skip(req))]
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

#[tracing::instrument(skip(h))]
fn log_headers(h: &Vec<String>) {
    tracing::info!(?h, "got headers");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    telemetry::init();

    let res = HttpServer::new(move || App::new().wrap(TracingLogger::default()).service(index))
        .bind(("0.0.0.0", 8000))?
        .run()
        .await;

    telemetry::shutdown();
    res
}
