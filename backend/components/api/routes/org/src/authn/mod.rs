use paperclip::actix::web;

mod assume_role;
mod google_oauth;
mod login;
mod logout;
mod magic_link;
mod roles;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(login::handler)
        .service(logout::handler)
        .service(magic_link::handler)
        .service(google_oauth::handler)
        .service(roles::get)
        .service(assume_role::post);
}
