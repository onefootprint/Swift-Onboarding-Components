use paperclip::actix::web;

mod check;
mod index;
mod reveal;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(index::get)
        .service(index::patch)
        .service(reveal::post)
        .service(check::get);
}
