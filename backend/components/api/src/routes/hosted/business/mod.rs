use paperclip::actix::web;

mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(vault::post_validate).service(vault::put);
}
