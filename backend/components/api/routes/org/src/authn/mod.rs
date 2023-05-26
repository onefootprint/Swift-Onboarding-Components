use paperclip::actix::web;

pub mod assume_role;
pub mod login;
pub mod logout;
pub mod magic_link;
pub mod oauth;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(login::handler)
        .service(logout::handler)
        .service(magic_link::handler)
        .service(oauth::handler)
        .service(assume_role::get)
        .service(assume_role::post);
}
