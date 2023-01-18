use paperclip::actix::web;
mod index;

pub fn routes(config: &mut web::ServiceConfig) {
    config.service(index::get).service(index::post);
}
