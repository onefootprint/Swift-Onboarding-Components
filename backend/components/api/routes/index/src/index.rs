use crate::types::response::ResponseData;
use crate::types::{
    EmptyResponse,
    JsonApiResponse,
    StringResponse,
};
use actix_web::HttpRequest;
use paperclip::actix::{
    api_v2_operation,
    get,
};

#[api_v2_operation(tags(Private))]
#[tracing::instrument(name = "index")]
#[get("/")]
async fn root() -> JsonApiResponse<EmptyResponse> {
    ResponseData::ok(EmptyResponse {}).json()
}

#[tracing::instrument(name = "debug_headers", skip(req))]
#[api_v2_operation(tags(Private))]
#[get("/headers")]
async fn headers(req: HttpRequest) -> StringResponse {
    let mut headers = req
        .headers()
        .iter()
        .filter(|(name, _)| name.as_str().to_lowercase() != "X-Token-From-Cloudfront".to_lowercase())
        .map(|(name, value)| {
            let val = value.to_str().unwrap_or("?");
            format!("{name} -> {val}")
        })
        .collect::<Vec<String>>();

    headers.sort();

    log_headers(&headers);

    let headers = headers.join("\n");

    Ok(headers)
}

#[tracing::instrument(name = "log_headers")]
fn log_headers(headers_debug: &Vec<String>) {
    tracing::info!("got headers");
}
