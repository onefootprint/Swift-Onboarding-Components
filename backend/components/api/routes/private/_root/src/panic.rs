use actix_web::get;
use api_core::{
    auth::protected_auth::ProtectedAuth,
    types::{EmptyResponse, JsonApiResponse},
};

#[get("/private/panic")]
async fn get(_: ProtectedAuth) -> JsonApiResponse<EmptyResponse> {
    tracing::debug!("about to panic");
    panic!("at the disco");
}
