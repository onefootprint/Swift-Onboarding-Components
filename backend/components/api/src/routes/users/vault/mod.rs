use paperclip::actix::web;

pub mod decrypt;
pub mod document;
pub mod get;
pub mod put;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(put::put)
        .service(get::get)
        .service(decrypt::post)
        .service(document::get)
        .service(document::post_decrypt);
}
