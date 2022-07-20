use paperclip::actix::web;

pub mod login;
pub mod magic_link;
pub mod oauth;

pub fn routes() -> web::Scope {
    web::scope("/auth")
        .service(login::handler)
        .service(magic_link::handler)
        .service(oauth::handler)
}
