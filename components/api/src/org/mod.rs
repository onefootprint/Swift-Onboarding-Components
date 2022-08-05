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
}
