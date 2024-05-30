use paperclip::actix::web;

mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(status::get);
}
