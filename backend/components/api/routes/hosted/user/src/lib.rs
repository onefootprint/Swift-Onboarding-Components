use paperclip::actix::web;

mod access_events;
mod attest_device;
mod auth_methods;
mod authorized_orgs;
mod challenge;
mod consent;
pub mod documents;
mod email;
mod token;
mod upload;
mod vault;

use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    documents::routes(config);
    config
        .service(vault::patch::patch)
        .service(vault::patch::post_validate)
        .service(vault::decrypt::post)
        .service(access_events::get)
        .service(authorized_orgs::get)
        .service(token::get)
        .service(token::post)
        .service(email::verify::post)
        .service(consent::post)
        .service(upload::post)
        .service(challenge::index::post)
        .service(challenge::verify::post)
        .service(auth_methods::get)
        .service(attest_device::post_challenge)
        .service(attest_device::post_attestation);
}
