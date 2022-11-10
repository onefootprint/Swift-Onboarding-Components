use paperclip::actix::web;

pub mod index;
pub mod liveness;
pub mod risk_signals;
pub mod timeline;
pub mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::get)
        .service(index::get_detail)
        .service(index::post)
        .service(liveness::get)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(risk_signals::get_detail);

    vault::routes(config);
}
