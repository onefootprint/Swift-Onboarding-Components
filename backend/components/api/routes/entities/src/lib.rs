use api_core::*;
use paperclip::actix::web;

mod annotations;
mod auth_events;
mod client_token;
mod decisions;
mod documents;
mod get;
mod kyb;
mod kyc;
mod liveness;
mod match_signals;
mod risk_signals;
mod rule_set_result;
mod timeline;
mod trigger;
mod trigger_link;
mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    vault::routes(config);
    config
        .service(client_token::post::post)
        .service(client_token::get::get)
        .service(get::detail::get)
        .service(get::search::post)
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
        .service(trigger_link::post)
        .service(kyb::post)
        .service(kyc::post)
        .service(risk_signals::get_detail)
        .service(risk_signals::decrypt_aml_hits)
        .service(auth_events::get)
        .service(rule_set_result::get);
}
