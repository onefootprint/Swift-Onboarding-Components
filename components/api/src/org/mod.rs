use paperclip::actix::web;

pub mod api_keys;
pub mod onboarding_configs;
pub mod settings;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(onboarding_configs::get)
        .service(onboarding_configs::get_detail)
        .service(onboarding_configs::patch)
        .service(onboarding_configs::post)
        .service(settings::routes())
        .service(workos::routes())
        .service(api_keys::routes())
        // TODO remove these old routes
        .service(web::resource("/scoped_users").route(web::get().to(super::users::index::get)))
        .service(super::users::access_events::get)
        .service(super::users::audit_trail::get)
        .service(super::users::decrypt::post)
        .service(super::users::liveness::get)
        .service(super::users::validate::validate)
}
