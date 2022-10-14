use paperclip::actix::web;

pub mod cleanup;
pub mod tenant;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(cleanup::post).service(tenant::post);
}
