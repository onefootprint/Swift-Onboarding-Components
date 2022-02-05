use actix_web::{get, middleware::Logger, App, HttpRequest, HttpResponse, HttpServer, Responder};

#[get("/")]
async fn index(req: HttpRequest) -> impl Responder {
    let headers = req
        .headers()
        .iter()
        .map(|(name, value)| {
            let val = value.to_str().unwrap_or("?");
            format!("{name} -> {val}")
        })
        .collect::<Vec<String>>()
        .join("\n");

    HttpResponse::Ok().body(format!("{headers}"))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    log::info!("Starting HTTP server: go to http://localhost:8000");

    HttpServer::new(|| App::new().wrap(Logger::default()).service(index))
        .bind(("0.0.0.0", 8000))?
        .run()
        .await
}
