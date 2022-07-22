use paperclip::actix::web;

pub mod access_events;
pub mod api_keys;
pub mod audit_trail;
pub mod decrypt;
pub mod liveness;
pub mod ob_config;
pub mod scoped_users;
pub mod settings;
pub mod validate;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(access_events::handler)
        .service(audit_trail::get)
        .service(decrypt::handler)
        .service(web::resource("onboardings").route(web::get().to(scoped_users::get)))
        .service(web::resource("scoped_users").route(web::get().to(scoped_users::get)))
        .service(ob_config::get)
        .service(ob_config::post)
        .service(liveness::get)
        .service(validate::validate)
        .service(settings::routes())
        .service(workos::routes())
        .service(api_keys::handler)
}
