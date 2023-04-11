use paperclip::actix::web;

mod index;
mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(vault::post_validate)
        .service(vault::put);
}
