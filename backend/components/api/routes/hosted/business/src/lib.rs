use paperclip::actix::web;

mod index;
mod patch;
mod vault;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(patch::patch)
        .service(vault::patch::post_validate)
        .service(vault::patch::patch)
        .service(vault::decrypt::post);
}
