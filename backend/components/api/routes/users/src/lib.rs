use api_core::*;
use paperclip::actix::web;

mod detail;
mod documents;
mod get;
mod post;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post::post)
        .service(get::get)
        .service(documents::get)
        .service(detail::detail);
}
