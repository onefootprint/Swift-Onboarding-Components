use paperclip::actix::web;

mod companies;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(companies::get);
}
