use paperclip::actix::web;

pub mod login;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(login::login)
        .service(login::verify)
}
