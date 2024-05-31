use api_core::web;

mod list;
mod post;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(list::get).service(post::post);
}
