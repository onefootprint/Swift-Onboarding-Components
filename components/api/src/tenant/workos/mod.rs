use paperclip::actix::web;

pub mod callback;
pub mod magic_auth;
pub mod oauth;

pub fn routes() -> web::Scope {
    web::scope("/auth")
        .service(callback::handler)
        .service(magic_auth::handler)
        .service(oauth::handler)
}
