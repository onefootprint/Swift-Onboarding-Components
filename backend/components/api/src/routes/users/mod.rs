use paperclip::actix::web;

pub mod annotations;
pub mod decisions;
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
        .service(annotations::get)
        .service(annotations::patch)
        .service(annotations::post)
        .service(decisions::post)
        .service(liveness::get)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(risk_signals::get_detail);

    vault::routes(config);
}
