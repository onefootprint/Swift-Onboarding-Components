use paperclip::actix::web;

mod get;
mod put;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(get::get_versions).service(put::put_create_version);
}
