use paperclip::actix::web;

pub mod decrypt;
pub mod get;
pub mod patch;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(decrypt::post)
        .service(patch::post_validate)
        .service(patch::patch)
        .service(patch::put);
}
