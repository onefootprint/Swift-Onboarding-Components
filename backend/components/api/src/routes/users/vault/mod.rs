use paperclip::actix::web;

pub mod custom;
pub mod decrypt;
pub mod document;
pub mod get;
pub mod identity;
pub mod put;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(put::put)
        .service(get::get)
        .service(decrypt::post)
        .service(identity::put)
        .service(identity::get)
        .service(identity::post_decrypt)
        .service(document::get)
        .service(document::post_decrypt)
        .service(custom::put);
}
