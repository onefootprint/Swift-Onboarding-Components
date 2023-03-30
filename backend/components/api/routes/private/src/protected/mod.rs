mod risk;
mod task;

use paperclip::actix::{
    api_v2_operation, get,
    web::{self},
};

use crate::auth::protected_custodian::ProtectedCustodianAuthContext;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(check)
        .service(risk::make_vendor_calls)
        .service(risk::make_decision)
        .service(risk::shadow_run)
        .service(task::execute_tasks)
        .service(task::create_task)
        .service(task::create_overdue_watchlist_check_tasks);
}

#[api_v2_operation(tags(Private, Protected))]
#[get("/private/protected/check")]
fn check(_: ProtectedCustodianAuthContext) -> &'static str {
    "ok"
}
