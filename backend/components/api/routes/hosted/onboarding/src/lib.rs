#![recursion_limit = "256"]
use paperclip::actix::web;

mod authorize;
mod config;
mod fingerprint_visit;
mod index;
mod neuro_id;
mod pat;
mod process;
mod session;
mod skip_passkey_register;
mod socure_device;
mod status;
mod stytch;
mod timeline;
mod validate;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(authorize::post)
        .service(status::get)
        .service(skip_passkey_register::post)
        .service(fingerprint_visit::post)
        .service(pat::get)
        .service(socure_device::post)
        .service(process::post)
        .service(validate::post)
        .service(stytch::post)
        .service(neuro_id::get)
        .service(timeline::post)
        .service(session::get)
        .service(config::get);
}
