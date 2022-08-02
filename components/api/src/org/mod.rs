use paperclip::actix::web;

pub mod access_events;
pub mod api_keys;
pub mod audit_trail;
pub mod decrypt;
pub mod liveness;
pub mod onboarding_configs;
pub mod scoped_users;
pub mod settings;
pub mod validate;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(access_events::handler)
        .service(audit_trail::get)
        .service(decrypt::handler)
        .service(scoped_users::get)
        .service(onboarding_configs::get)
        .service(onboarding_configs::patch)
        .service(
            web::resource("/config")
                .route(web::get().to(onboarding_configs::get_detail))
                .route(web::post().to(onboarding_configs::post)),
        )
        .service(web::resource("/onboarding_config").route(web::get().to(onboarding_configs::get_detail)))
        .service(web::resource("/onboarding_configs").route(web::post().to(onboarding_configs::post)))
        .service(liveness::get)
        .service(validate::validate)
        .service(settings::routes())
        .service(workos::routes())
        .service(api_keys::routes())
}
