use paperclip::actix::web;

mod detail;
mod list;
mod onboarding;
mod owners;
mod vault;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(list::get)
        .service(detail::get)
        .service(onboarding::post)
        .service(vault::patch::post_validate)
        .service(vault::patch::patch)
        .service(vault::decrypt::post)
        .service(owners::get::get)
        .service(owners::patch::patch);
}
