use paperclip::actix::web;

mod logout;
mod roles;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(logout::handler);
    config.service(roles::get);
}
