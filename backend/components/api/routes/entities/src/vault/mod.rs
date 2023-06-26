use paperclip::actix::web;

mod decrypt;
mod delete;
mod get;
mod integrity;
mod patch;
mod validate;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(decrypt::post)
        .service(decrypt::post_client)
        .service(validate::post)
        .service(validate::post_client)
        .service(patch::patch)
        .service(patch::patch_client)
        .service(delete::delete)
        .service(integrity::post);

    get::configure_get_aliases(config);
    decrypt::configure_post_aliases(config);
    decrypt::configure_post_client_aliases(config);
    patch::configure_patch_aliases(config);
    patch::configure_patch_client_aliases(config);
    validate::configure_post_aliases(config);
    validate::configure_post_client_aliases(config);
    delete::configure_delete_aliases(config);
    integrity::configure_post_aliases(config);
}
