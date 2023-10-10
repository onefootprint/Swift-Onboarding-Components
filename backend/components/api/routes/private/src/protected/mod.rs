mod aws_selfie_doc;
mod decrypt;
mod incode;
mod risk;
mod task;
mod token_reveal;
mod workflow;

use actix_web::web;

use crate::auth::ProtectedAuth;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(check)
        .service(risk::make_vendor_calls)
        .service(risk::make_decision)
        .service(risk::shadow_run)
        .service(task::execute_tasks)
        .service(task::create_task)
        .service(task::create_overdue_watchlist_check_tasks)
        .service(incode::rerun_machine)
        .service(workflow::create_workflow)
        .service(workflow::proceed)
        .service(token_reveal::post)
        .service(decrypt::post)
        .service(aws_selfie_doc::post);
}

#[actix_web::get("/private/protected/check")]
async fn check(_: ProtectedAuth) -> &'static str {
    "ok"
}
