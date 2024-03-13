use paperclip::actix::web;

mod companies;
mod members;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(companies::get);
    config.service(members::post);
}
