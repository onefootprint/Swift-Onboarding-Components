use paperclip::actix::web;

mod decrypt;
mod get;
mod patch;
mod validate;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(decrypt::post)
        .service(decrypt::post_client)
        .service(validate::post)
        .service(patch::patch);

    get::configure_get_aliases(config);
    decrypt::configure_post_aliases(config);
    patch::configure_patch_aliases(config);
    validate::configure_post_aliases(config);
}
