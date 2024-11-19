use paperclip::actix::web;

mod get;
mod post;
mod put;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(get::get_playbooks)
        .service(get::get_versions)
        .service(post::post_create_playbook)
        .service(post::post_restore)
        .service(put::put_create_version);

    get::configure_get_playbooks_aliases(config);
    post::configure_post_create_playbook_aliases(config);
}
