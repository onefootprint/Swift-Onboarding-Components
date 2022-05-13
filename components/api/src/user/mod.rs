use paperclip::actix::web;

pub mod access_events;
pub mod detail;
pub mod login;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(login::login)
        .service(login::verify)
        .service(access_events::handler)
}
