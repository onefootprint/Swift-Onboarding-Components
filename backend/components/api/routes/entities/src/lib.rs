use api_core::*;
use paperclip::actix::web;

mod ai_summarize;
mod annotations;
mod auth_events;
mod client_token;
mod data;
mod decisions;
mod documents;
mod dupes;
mod get;
mod liveness;
mod match_signals;
mod risk_signals;
mod rule_set_result;
mod timeline;
mod token;
mod triggers;
mod user_insight;
mod vault;

pub fn routes(config: &mut web::ServiceConfig) {
    vault::routes(config);
    config
        .service(client_token::post::post)
        .service(client_token::get::get)
        .service(get::detail::get)
        .service(get::search::post)
        .service(data::get)
        .service(annotations::get)
        .service(annotations::patch)
        .service(annotations::post)
        .service(decisions::post)
        .service(documents::get)
        .service(liveness::get)
        .service(token::post)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(triggers::post)
        .service(risk_signals::get_detail)
        .service(risk_signals::decrypt_aml_hits)
        .service(auth_events::get)
        .service(rule_set_result::get_latest_workflow_decision)
        .service(rule_set_result::get)
        .service(user_insight::get)
        .service(dupes::get_dupes)
        .service(ai_summarize::get);
}
