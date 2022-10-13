use paperclip::actix::web;

pub mod api_keys;
pub mod index;
pub mod ob_config;
pub mod ob_session;
pub mod roles;
pub mod settings;
pub mod members;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(web::resource("").route(web::get().to(index::get)))
        .service(ob_config::get)
        .service(ob_config::get_detail)
        .service(ob_config::patch)
        .service(ob_config::post)
        .service(ob_session::post)
        .service(members::get)
        .service(members::post)
        .service(members::patch)
        .service(members::deactivate)
        .service(roles::get)
        .service(roles::post)
        .service(roles::patch)
        .service(roles::deactivate)
        .service(settings::routes())
        .service(workos::routes())
        .service(api_keys::routes())
}
