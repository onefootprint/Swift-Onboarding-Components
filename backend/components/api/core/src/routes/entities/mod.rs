use paperclip::actix::web;

mod annotations;
mod decisions;
mod get;
mod liveness;
mod risk_signals;
mod timeline;
pub mod vault;

pub use get::{get_entities, get_entity};

pub fn routes(config: &mut web::ServiceConfig) {
    vault::routes(config);
    config
        .service(get::get)
        .service(get::get_detail)
        .service(annotations::get)
        .service(annotations::patch)
        .service(annotations::post)
        .service(decisions::post)
        .service(liveness::get)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(risk_signals::get_detail);
}
