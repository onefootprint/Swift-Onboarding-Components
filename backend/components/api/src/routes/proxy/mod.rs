use paperclip::actix::web::ServiceConfig;

mod index;
mod token_parser;

pub fn routes(config: &mut ServiceConfig) {
    config.service(index::post);
}
