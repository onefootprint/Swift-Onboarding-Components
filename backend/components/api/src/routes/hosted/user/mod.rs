use paperclip::actix::web;

pub mod access_events;
pub mod authorized_orgs;
pub mod biometric;
pub mod consent;
pub mod decrypt;
pub mod document;
pub mod email;
pub mod identity_data;
pub mod index;
pub mod liveness;
pub mod token;

#[cfg(test)]
mod tests;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(authorized_orgs::get)
        .service(identity_data::post)
        .service(identity_data::post_speculative)
        .service(decrypt::post)
        .service(access_events::get)
        .service(biometric::init_post)
        .service(biometric::complete_post)
        .service(document::get)
        .service(document::post)
        .service(liveness::get)
        .service(token::get)
        .service(email::post)
        .service(email::verify::post)
        .service(email::challenge::post)
        .service(consent::post);
}
