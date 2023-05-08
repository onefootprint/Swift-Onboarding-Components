use paperclip::actix::web;

pub mod decrypt;
pub mod get;
pub mod patch;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(get::get_alias)
        .service(decrypt::post)
        .service(decrypt::post_alias)
        .service(patch::post_validate)
        .service(patch::post_validate_alias)
        .service(patch::patch)
        .service(patch::patch_alias);
}
