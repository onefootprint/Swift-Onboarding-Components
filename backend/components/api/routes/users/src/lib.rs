use api_core::*;
use paperclip::actix::web;

mod detail;
mod get;
mod post;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post::post)
        .service(get::get)
        .service(detail::detail);
}
