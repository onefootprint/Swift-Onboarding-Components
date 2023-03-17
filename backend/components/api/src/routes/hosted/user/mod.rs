use paperclip::actix::web;

mod access_events;
mod authorized_orgs;
mod biometric;
mod consent;
mod decrypt;
mod document;
mod email;
mod index;
mod liveness;
mod token;
mod upload;
mod vault;

#[cfg(test)]
mod tests;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(authorized_orgs::get)
        .service(vault::put)
        .service(vault::post_validate)
        .service(decrypt::post)
        .service(access_events::get)
        .service(biometric::init_post)
        .service(biometric::complete_post)
        .service(document::get)
        .service(document::post)
        .service(liveness::get)
        .service(token::get)
        .service(email::verify::post)
        .service(email::challenge::post)
        .service(consent::post)
        .service(upload::post);
}
