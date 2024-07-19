use paperclip::actix::web;

mod decrypt;
mod delete;
mod download;
mod get;
mod integrity;
mod patch;
mod upload;
mod validate;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get)
        .service(get::get_business)
        .service(decrypt::post)
        .service(decrypt::post_business)
        .service(decrypt::post_client)
        .service(validate::post)
        .service(validate::post_client)
        .service(validate::post_business)
        .service(patch::patch)
        .service(patch::patch_client)
        .service(patch::patch_business)
        .service(delete::delete)
        .service(delete::delete_business)
        .service(integrity::post)
        .service(download::get)
        .service(upload::post)
        .service(upload::post_client);

    get::configure_get_aliases(config);
    decrypt::configure_post_aliases(config);
    decrypt::configure_post_client_aliases(config);
    patch::configure_patch_aliases(config);
    patch::configure_patch_client_aliases(config);
    validate::configure_post_aliases(config);
    validate::configure_post_client_aliases(config);
    delete::configure_delete_aliases(config);
    integrity::configure_post_aliases(config);
    download::configure_get_aliases(config);
    upload::configure_post_aliases(config);
    upload::configure_post_client_aliases(config);
}
