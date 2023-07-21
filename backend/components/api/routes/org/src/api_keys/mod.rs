use paperclip::actix::web;

mod deactivate;
mod index;
mod reveal;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(index::get)
        .service(index::patch)
        .service(deactivate::post)
        .service(reveal::post);
}
