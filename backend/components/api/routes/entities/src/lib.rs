use api_core::*;
use paperclip::actix::web;

mod annotations;
mod client_token;
mod decisions;
mod auth_events;
mod documents;
mod get;
mod kyc;
mod liveness;
mod match_signals;
mod risk_signals;
mod timeline;
mod trigger;
mod vault;

pub use get::list::parse_search;

pub fn routes(config: &mut web::ServiceConfig) {
    vault::routes(config);
    client_token::post::configure_post_aliases(config);
    config
        .service(client_token::post::post)
        .service(client_token::get::get)
        .service(get::detail::get)
        .service(get::list::get)
        .service(annotations::get)
        .service(annotations::patch)
        .service(annotations::post)
        .service(decisions::post)
        .service(documents::get)
        .service(liveness::get)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(trigger::post)
        .service(kyc::post)
        .service(risk_signals::get_detail)
        .service(auth_events::get);
}
