mod list;
mod owners;
mod post;

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(owners::get).service(post::post).service(list::get);
}
