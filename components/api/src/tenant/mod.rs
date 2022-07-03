use paperclip::actix::web;

pub mod access_events;
pub mod audit_trail;
pub mod config;
pub mod decrypt;
pub mod liveness;
pub mod onboardings;
pub mod required_data;
pub mod validate;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(access_events::handler)
        .service(audit_trail::get)
        .service(decrypt::handler)
        .service(onboardings::handler)
        .service(required_data::set)
        .service(required_data::get)
        .service(config::get)
        .service(liveness::get)
        .service(validate::validate)
}
