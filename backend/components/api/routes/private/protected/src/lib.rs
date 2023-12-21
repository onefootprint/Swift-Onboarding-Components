mod aws_selfie_doc;
mod decrypt;
mod default_rules;
mod incode;
mod refingerprint;
mod risk;
mod task;
mod token_reveal;
mod workflow;

use actix_web::web;

pub use api_core::auth::protected_auth::ProtectedAuth;
pub use api_core::State;

pub fn configure(config: &mut web::ServiceConfig) {
    config
        .service(check)
        .service(risk::make_vendor_calls)
        .service(risk::make_decision)
        .service(risk::shadow_run)
        .service(task::execute_tasks)
        .service(task::create_task)
        .service(task::create_overdue_watchlist_check_tasks)
        .service(incode::rerun_machine)
        .service(workflow::proceed)
        .service(token_reveal::post)
        .service(decrypt::post)
        .service(aws_selfie_doc::post)
        .service(refingerprint::post)
        .service(default_rules::add_default_rules);
}

#[actix_web::get("/private/protected/check")]
async fn check(_: ProtectedAuth) -> &'static str {
    "ok"
}
