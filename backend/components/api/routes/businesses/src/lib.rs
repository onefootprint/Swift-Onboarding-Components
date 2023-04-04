use paperclip::actix::web;

mod owners;

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(owners::get);
}
