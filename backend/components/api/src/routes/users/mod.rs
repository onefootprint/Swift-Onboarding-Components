use paperclip::actix::web;

pub mod index;
pub mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::get_detail)
        .service(index::post);

    vault::routes(config);
}
