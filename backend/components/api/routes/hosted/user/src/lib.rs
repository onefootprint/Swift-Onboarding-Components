use paperclip::actix::web;

mod access_events;
mod attest_device;
mod authorized_orgs;
mod consent;
pub mod documents;
mod email;
mod passkey;
mod token;
mod upload;
mod vault;

use api_core::*;

#[cfg(test)]
mod tests;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(vault::patch::patch)
        .service(vault::patch::post_validate)
        .service(vault::decrypt::post)
        .service(access_events::get)
        .service(authorized_orgs::get)
        .service(passkey::init_post)
        .service(passkey::complete_post)
        .service(documents::index::post)
        .service(documents::upload::post)
        .service(documents::process::post)
        .service(token::get)
        .service(email::verify::post)
        .service(consent::post)
        .service(upload::post)
        .service(attest_device::post_challenge)
        .service(attest_device::post_attestation);

    passkey::configure_init_post_aliases(config);
    passkey::configure_complete_post_aliases(config);
}
