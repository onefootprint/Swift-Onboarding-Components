use paperclip::actix::web;

mod assume_role;
mod google_oauth;
mod login;
mod logout;
mod magic_link;
mod roles;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(assume_role::post);
    config.service(login::handler);
    config.service(logout::handler);
    config.service(magic_link::handler);
    config.service(google_oauth::handler);
    config.service(roles::get);
}
