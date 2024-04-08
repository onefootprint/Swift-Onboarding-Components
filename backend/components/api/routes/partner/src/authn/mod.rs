use paperclip::actix::web;

mod roles;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(roles::get);
}
