pub mod session;

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(session::post).service(session::validate::post);
}
