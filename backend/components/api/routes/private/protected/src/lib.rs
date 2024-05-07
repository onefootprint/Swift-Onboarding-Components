mod aws_selfie_doc;
mod decrypt;
mod default_rules;
mod fix_card_expiration_year;
mod incode;
mod org;
mod risk;
mod sandbox_tenant;
mod task;
mod token_reveal;
mod webhooks;
mod workflow;

use actix_web::web;

pub use api_core::{auth::protected_auth::ProtectedAuth, State};

pub fn configure(config: &mut web::ServiceConfig) {
    config
        .service(check)
        .service(fix_card_expiration_year::post)
        .service(risk::make_vendor_calls)
        .service(risk::make_decision)
        .service(risk::shadow_run)
        .service(risk::save_risk_signals_for_vres)
        .service(task::create_task)
        .service(incode::rerun_machine)
        .service(workflow::proceed)
        .service(token_reveal::post)
        .service(decrypt::post)
        .service(aws_selfie_doc::post)
        .service(default_rules::add_default_rules)
        .service(sandbox_tenant::post)
        .service(webhooks::post)
        .service(org::update_business_info)
        .service(org::get_business_info);
}

#[actix_web::get("/private/protected/check")]
async fn check(_: ProtectedAuth) -> &'static str {
    "ok"
}
