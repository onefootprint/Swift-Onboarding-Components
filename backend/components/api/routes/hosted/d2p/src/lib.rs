#![recursion_limit = "256"]

use paperclip::actix::web;

pub mod generate;
pub mod sms;
pub mod status;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(generate::handler)
        .service(status::get)
        .service(status::post)
        .service(sms::handler);
}
