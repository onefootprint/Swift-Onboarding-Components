mod index;
use paperclip::actix::web;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(index::post);
}
