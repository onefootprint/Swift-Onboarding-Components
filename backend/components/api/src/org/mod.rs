use paperclip::actix::web;

pub mod api_keys;
pub mod index;
pub mod onboarding_configs;
pub mod roles;
pub mod settings;
pub mod users;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(web::resource("").route(web::get().to(index::get)))
        .service(onboarding_configs::get)
        .service(onboarding_configs::get_detail)
        .service(onboarding_configs::patch)
        .service(onboarding_configs::post)
        .service(users::get)
        .service(roles::get)
        .service(settings::routes())
        .service(workos::routes())
        .service(api_keys::routes())
}
