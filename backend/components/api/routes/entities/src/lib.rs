use api_core::*;
use paperclip::actix::web;

mod actions;
mod ai_summarize;
mod annotations;
mod auth_events;
mod business_insight;
mod business_owners;
mod businesses;
mod client_token;
mod data;
mod documents;
mod dupes;
mod get;
mod label;
mod liveness;
mod match_signals;
mod risk_signals;
mod rule_set_result;
mod tags;
mod timeline;
mod token;
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
        .service(actions::post::post)
        .service(annotations::get)
        .service(annotations::patch)
        .service(annotations::post)
        .service(documents::get)
        .service(liveness::get)
        .service(token::post)
        .service(timeline::get)
        .service(risk_signals::get)
        .service(match_signals::get)
        .service(risk_signals::get_detail)
        .service(risk_signals::decrypt_aml_hits)
        .service(auth_events::get)
        .service(rule_set_result::get_latest_workflow_decision)
        .service(rule_set_result::get)
        .service(business_owners::get)
        .service(businesses::get)
        .service(user_insight::get)
        .service(business_insight::get_business_insights)
        .service(dupes::get_dupes)
        .service(tags::get)
        .service(tags::post)
        .service(tags::delete)
        .service(label::get)
        .service(label::post)
        .service(ai_summarize::get);
}
