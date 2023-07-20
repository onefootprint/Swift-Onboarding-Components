use paperclip::actix::web;

mod access_events;
mod authorized_orgs;
mod biometric;
mod consent;
mod document;
mod documents;
mod email;
mod liveness;
mod token;
mod upload;
mod vault;

#[cfg(test)]
mod tests;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(vault::patch::put)
        .service(vault::patch::patch)
        .service(vault::patch::post_validate)
        .service(vault::decrypt::post)
        .service(access_events::get)
        .service(authorized_orgs::get)
        .service(biometric::init_post)
        .service(biometric::complete_post)
        .service(document::post)
        .service(documents::index::post)
        .service(liveness::get)
        .service(token::get)
        .service(email::verify::post)
        .service(consent::post)
        .service(upload::post);
}
