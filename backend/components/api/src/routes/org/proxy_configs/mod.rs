use paperclip::actix::web;
mod deactivate;
mod index;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::get_detail)
        .service(index::post)
        .service(index::patch);

    deactivate::routes(config);
}
