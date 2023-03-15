use paperclip::actix::web;
mod get;
pub mod vault;

pub use get::{get_entities, get_entity};

pub fn routes(config: &mut web::ServiceConfig) {
    vault::routes(config);
    config.service(get::get).service(get::get_detail);
}
