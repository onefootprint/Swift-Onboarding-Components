use paperclip::actix::web;

pub mod decrypt;
pub mod get;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(get::get).service(decrypt::post);
}
