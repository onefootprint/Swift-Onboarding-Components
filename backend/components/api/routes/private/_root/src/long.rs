use actix_web::get;
use actix_web::web;
use api_core::auth::protected_auth::ProtectedAuth;
use api_core::types::ModernApiResult;
use std::cmp;
use tokio::time::sleep;
use tokio::time::Duration;

#[derive(serde::Deserialize)]
struct DurationQuery {
    duration: Option<u64>,
}

#[get("/private/long")]
async fn get(
    _: ProtectedAuth,
    duration: web::Query<DurationQuery>,
) -> ModernApiResult<api_wire_types::Empty> {
    let DurationQuery { duration } = duration.into_inner();
    let duration = duration.unwrap_or(180);
    let duration = cmp::min(duration, 180);
    sleep(Duration::from_secs(duration)).await;
    Ok(api_wire_types::Empty)
}
