use actix_web::{
    get, HttpRequest
};
use crate::response::success::ApiResponseData;
use crate::ApiError;


#[tracing::instrument(name = "index", skip(req))]
#[get("/")]
async fn handler(req: HttpRequest) -> Result<ApiResponseData<String>, ApiError> {
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

    Ok(ApiResponseData {
        data: format!("{headers}")
    })
}

#[tracing::instrument(name = "log_headers")]
fn log_headers(headers: &Vec<String>) {
    tracing::info!("got headers");
}