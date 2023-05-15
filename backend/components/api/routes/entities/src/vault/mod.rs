use paperclip::actix::web;

pub mod decrypt;
pub mod get;
pub mod patch;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(decrypt::post)
        .service(patch::post_validate)
        .service(patch::patch);
        
    get::configure_get_aliases(config);
    decrypt::configure_post_aliases(config);
    patch::configure_patch_aliases(config);
    patch::configure_post_validate_aliases(config);
}
