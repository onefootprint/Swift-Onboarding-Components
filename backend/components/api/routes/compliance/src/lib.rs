use paperclip::actix::web;

mod documents;
mod members;
mod partners;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(documents::get);
    config.service(partners::get);
    config.service(members::post);
}
