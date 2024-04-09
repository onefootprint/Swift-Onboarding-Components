use paperclip::actix::web;

mod login;
mod logout;
mod roles;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(login::handler);
    config.service(logout::handler);
    config.service(roles::get);
}
