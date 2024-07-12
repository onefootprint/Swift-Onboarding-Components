use api_core::web;

mod list;
mod post;

pub fn routes(config: &mut web::ServiceConfig) {
    list::configure_get_aliases(config);
    config.service(post::post).service(list::get);
}
