use paperclip::actix::web;
mod get;

pub use get::{get_entities, get_entity};

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(get::get).service(get::get_detail);
}
