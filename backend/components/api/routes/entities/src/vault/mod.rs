use paperclip::actix::web;

pub mod decrypt;
pub mod get;
pub mod put;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(decrypt::post)
        .service(put::post_validate)
        .service(put::put);
}
