use api_core::*;
use paperclip::actix::web;

mod auth_events;
mod detail;
mod documents;
mod get;
mod liveness;
mod match_signals;
mod post;
mod reonboard;
mod risk_signals;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post::post)
        .service(get::get)
        .service(documents::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(liveness::get)
        .service(auth_events::get)
        .service(reonboard::post)
        .service(detail::detail);
}
