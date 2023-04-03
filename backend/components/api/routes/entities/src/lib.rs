use paperclip::actix::web;

mod annotations;
mod decisions;
mod get;
mod liveness;
mod risk_signals;
mod timeline;
pub mod vault;

pub use get::{detail::get_entity, list::get_entities};

pub use api_core::*;

pub fn routes(config: &mut web::ServiceConfig) {
    vault::routes(config);
    config
        .service(get::detail::get)
        .service(get::list::get)
        .service(annotations::get)
        .service(annotations::patch)
        .service(annotations::post)
        .service(decisions::post)
        .service(liveness::get)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(risk_signals::get_detail);
}
