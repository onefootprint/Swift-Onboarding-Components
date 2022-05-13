use paperclip::actix::web;

pub mod detail;
pub mod login;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(login::login)
        .service(login::verify)
}
