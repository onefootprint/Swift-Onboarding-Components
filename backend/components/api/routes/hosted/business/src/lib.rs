use paperclip::actix::web;

mod index;
mod vault;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(vault::patch::post_validate)
        .service(vault::patch::patch)
        .service(vault::decrypt::post);
}
