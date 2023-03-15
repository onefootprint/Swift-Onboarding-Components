use paperclip::actix::web;

pub mod get;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(get::get);
}
