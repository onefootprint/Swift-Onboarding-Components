use paperclip::actix::web;

pub mod api_keys;
pub mod index;
pub mod ob_config;
pub mod ob_session;
pub mod roles;
pub mod settings;
pub mod users;
pub mod workos;

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(web::resource("").route(web::get().to(index::get)))
        .service(ob_config::get)
        .service(ob_config::get_detail)
        .service(ob_config::patch)
        .service(ob_config::post)
        .service(ob_session::post)
        .service(users::get)
        .service(users::post)
        .service(users::patch)
        .service(roles::get)
        .service(roles::post)
        .service(roles::patch)
        .service(settings::routes())
        .service(workos::routes())
        .service(api_keys::routes())
}
