use actix_web::web;

mod composite_fingerprints;

#[derive(serde::Deserialize)]
pub struct BackfillRequest<TCursor> {
    dry_run: bool,
    concurrency: usize,
    limit: i64,
    cursor: TCursor,
}

#[derive(serde::Serialize)]
pub struct BackfillResponse<T, TCursor> {
    data: T,
    cursor: Option<TCursor>,
}

pub fn configure(config: &mut web::ServiceConfig) {
    config.service(composite_fingerprints::post);
}
