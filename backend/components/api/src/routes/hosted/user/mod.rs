use crate::errors::ApiError;
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

pub fn routes(config: &mut web::ServiceConfig) {
    let document_json_cfg = web::JsonConfig::default()
        // limit request payload size to 5MB
        // see backend/components/api/src/routes/hosted/user/document.rs::TODO::6 for discussion
        .limit(5_000_000)
        // accept any content type
        .content_type(|_| true)
        // use custom error handler
        .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidJsonBody(err)));

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
        .app_data(document_json_cfg)
        .service(liveness::get)
        .service(token::get)
        .service(email::post)
        .service(email::verify::post)
        .service(email::challenge::post)
        .service(consent::post);
}
