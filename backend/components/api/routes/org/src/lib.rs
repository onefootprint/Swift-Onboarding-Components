use paperclip::actix::web;

mod access_events;
mod api_keys;
mod authn;
mod client_security_config;
mod index;
mod logo;
mod member;
mod members;
mod onboarding_configs;
mod proxy_configs;
mod roles;
mod settings;
mod webhook_portal;

// Temporary glob imports until api core is disbanded.
pub use api_core::auth;
pub use api_core::*;

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
        .service(webhook_portal::get)
        .service(client_security_config::get)
        .service(client_security_config::patch);

    onboarding_configs::routes(config);
    authn::routes(config);
    api_keys::routes(config);
    proxy_configs::routes(config);
}
