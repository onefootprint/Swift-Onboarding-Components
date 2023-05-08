use paperclip::actix::web;

pub mod index;

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(index::post).service(index::get);
}
