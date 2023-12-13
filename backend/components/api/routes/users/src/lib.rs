use api_core::*;
use paperclip::actix::web;

mod auth_events;
mod decisions;
mod detail;
mod documents;
mod list;
mod liveness;
mod match_signals;
mod post;
mod reonboard;
mod risk_signals;
mod token;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(post::post)
        .service(list::get)
        .service(list::post_search)
        .service(documents::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(liveness::get)
        .service(token::post)
        .service(auth_events::get)
        .service(reonboard::post)
        .service(decisions::post)
        .service(detail::detail);
}
