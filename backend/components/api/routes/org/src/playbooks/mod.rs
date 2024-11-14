use paperclip::actix::web;

mod get;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(get::get_versions);
}
