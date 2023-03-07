use paperclip::actix::web;

mod access_events;
mod api_keys;
mod auth;
mod index;
mod logo;
mod member;
mod members;
mod onboarding_configs;
mod proxy_configs;
mod roles;
mod settings;
mod webhook_portal;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::patch)
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
        .service(access_events::get)
        .service(logo::put)
        .service(webhook_portal::get);

    onboarding_configs::routes(config);
    auth::routes(config);
    api_keys::routes(config);
    proxy_configs::routes(config);
}
