use paperclip::actix::web::ServiceConfig;

mod index;

pub fn routes(config: &mut ServiceConfig) {
    config.service(index::post);
}
