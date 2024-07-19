mod aws_selfie_doc;
mod backfill;
mod decrypt;
mod default_rules;
mod incode;
mod org;
mod samba;
mod sandbox_tenant;
mod task;
mod token_reveal;
mod verification_checks;
mod webhooks;
mod workflow;

use actix_web::web;
pub use api_core::auth::protected_auth::ProtectedAuth;
pub use api_core::State;

pub fn configure(config: &mut web::ServiceConfig) {
    config
        .service(check)
        .service(task::create_task)
        .service(incode::rerun_machine)
        .service(incode::adhoc_create_document_and_workflow)
        .service(incode::adhoc_upload_and_process)
        .service(incode::adhoc_document_process)
        .service(workflow::proceed)
        .service(token_reveal::post)
        .service(decrypt::post)
        .service(aws_selfie_doc::post)
        .service(default_rules::add_default_rules)
        .service(sandbox_tenant::post)
        .service(webhooks::post)
        .service(org::update_business_info)
        .service(samba::create_samba_order)
        .service(verification_checks::update_verification_checks)
        .service(org::get_business_info);
    backfill::configure(config);
}

#[actix_web::get("/private/protected/check")]
async fn check(_: ProtectedAuth) -> &'static str {
    "ok"
}
