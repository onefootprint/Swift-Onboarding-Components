use paperclip::actix::web;

pub mod access_events;
pub mod api_keys;
pub mod auth;
pub mod index;
pub mod member;
pub mod members;
pub mod ob_config;
pub mod proxy_configs;
pub mod roles;
pub mod settings;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::patch)
        .service(ob_config::get)
        .service(ob_config::get_detail)
        .service(ob_config::patch)
        .service(ob_config::post)
        .service(members::get)
        .service(members::post)
        .service(members::patch)
        .service(members::deactivate)
        .service(member::get)
        .service(member::patch)
        .service(roles::get)
        .service(roles::post)
        .service(roles::patch)
        .service(roles::deactivate)
        .service(settings::get)
        .service(access_events::get);

    auth::routes(config);
    api_keys::routes(config);
    proxy_configs::routes(config);
}
