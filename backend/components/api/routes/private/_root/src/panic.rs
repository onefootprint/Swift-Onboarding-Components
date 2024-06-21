use actix_web::get;
use api_core::auth::protected_auth::ProtectedAuth;
use api_core::types::ApiResponse;

#[get("/private/panic")]
async fn get(_: ProtectedAuth) -> ApiResponse<api_wire_types::Empty> {
    tracing::debug!("about to panic");
    panic!("at the disco");
}
